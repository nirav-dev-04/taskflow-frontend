import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { FiSave, FiBell, FiShield, FiGlobe } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import toast from "react-hot-toast";

const SETTINGS_KEY = "taskflow_settings";

const DEFAULT_SETTINGS = {
  siteName:         "TaskFlow",
  siteEmail:        "admin@taskflow.com",
  timezone:         "UTC",
  emailNotifs:      true,
  pushNotifs:       true,
  weeklyReport:     false,
  twoFactor:        false,
  sessionTimeout:   "30",
  passwordPolicy:   "strong",
  maxProjects:      "50",
  maxUsers:         "200",
  allowRegistration: true,
};

const Settings = () => {
  const { isDark } = useTheme();

  // ✅ Load from localStorage on mount so settings persist on refresh
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });
  const [saving, setSaving] = useState(false);

  const cardBg  = isDark ? "#12121f" : "#ffffff";
  const border  = isDark ? "#1e1e30" : "#e2e8f0";
  const text    = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted   = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const handleSave = () => {
    setSaving(true);
    try {
      // ✅ localStorage only — no backend route needed
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-300"
      style={{ backgroundColor: value ? "#ff6b35" : isDark ? "#1e1e30" : "#e2e8f0" }}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm"
        style={{ left: value ? "22px" : "2px" }} />
    </button>
  );

  const Section = ({ icon: Icon, title, children }) => (
    <div className="rounded-2xl p-5 mb-4"
      style={{ backgroundColor: cardBg, border: `1px solid ${border}`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-2 mb-5" style={{ borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)" }}>
          <Icon size={16} color="white" />
        </div>
        <h3 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif", color: text }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, children }) => (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${border}` }}>
      <p className="text-sm" style={{ color: text, fontFamily: "DM Sans, sans-serif" }}>{label}</p>
      {children}
    </div>
  );

  const inputStyle = {
    backgroundColor: inputBg,
    border: `1px solid ${border}`,
    color: text,
    fontFamily: "DM Sans, sans-serif",
  };

  return (
    <PageWrapper title="Settings">
      <div className="max-w-2xl">

        {/* General */}
        <Section icon={MdDashboard} title="General">
          <Field label="Site Name">
            <input value={settings.siteName} onChange={e => update("siteName", e.target.value)}
              className="px-3 py-2 rounded-xl outline-none text-sm w-48" style={inputStyle} />
          </Field>
          <Field label="Admin Email">
            <input value={settings.siteEmail} onChange={e => update("siteEmail", e.target.value)}
              className="px-3 py-2 rounded-xl outline-none text-sm w-48" style={inputStyle} />
          </Field>
          <Field label="Timezone">
            <select value={settings.timezone} onChange={e => update("timezone", e.target.value)}
              className="px-3 py-2 rounded-xl outline-none text-sm" style={inputStyle}>
              {["UTC","EST","PST","IST","GMT"].map(tz => <option key={tz}>{tz}</option>)}
            </select>
          </Field>
          <Field label="Allow Registration">
            <Toggle value={settings.allowRegistration} onChange={v => update("allowRegistration", v)} />
          </Field>
        </Section>

        {/* Notifications */}
        <Section icon={FiBell} title="Notifications">
          <Field label="Email Notifications">
            <Toggle value={settings.emailNotifs} onChange={v => update("emailNotifs", v)} />
          </Field>
          <Field label="Push Notifications">
            <Toggle value={settings.pushNotifs} onChange={v => update("pushNotifs", v)} />
          </Field>
          <Field label="Weekly Reports">
            <Toggle value={settings.weeklyReport} onChange={v => update("weeklyReport", v)} />
          </Field>
        </Section>

        {/* Security */}
        <Section icon={FiShield} title="Security">
          <Field label="Two-Factor Auth">
            <Toggle value={settings.twoFactor} onChange={v => update("twoFactor", v)} />
          </Field>
          <Field label="Session Timeout (min)">
            <select value={settings.sessionTimeout} onChange={e => update("sessionTimeout", e.target.value)}
              className="px-3 py-2 rounded-xl outline-none text-sm" style={inputStyle}>
              {["15","30","60","120"].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Password Policy">
            <select value={settings.passwordPolicy} onChange={e => update("passwordPolicy", e.target.value)}
              className="px-3 py-2 rounded-xl outline-none text-sm" style={inputStyle}>
              {["basic","medium","strong"].map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </Section>

        {/* Limits */}
        <Section icon={FiGlobe} title="System Limits">
          <Field label="Max Projects">
            <input type="number" value={settings.maxProjects} onChange={e => update("maxProjects", e.target.value)}
              className="px-3 py-2 rounded-xl outline-none text-sm w-24" style={inputStyle} />
          </Field>
          <Field label="Max Users">
            <input type="number" value={settings.maxUsers} onChange={e => update("maxUsers", e.target.value)}
              className="px-3 py-2 rounded-xl outline-none text-sm w-24" style={inputStyle} />
          </Field>
        </Section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: "0 4px 20px rgba(255,107,53,0.4)", opacity: saving ? 0.7 : 1 }}>
          <FiSave size={16} /> {saving ? "Saving..." : "Save All Settings"}
        </button>

        {/* Saved indicator */}
        <p className="text-center text-xs mt-3" style={{ color: muted, fontFamily: "DM Sans, sans-serif" }}>
          Settings are saved to your browser and persist on refresh.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Settings;