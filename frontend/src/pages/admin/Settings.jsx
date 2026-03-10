import { useState } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useTheme } from "../../context/ThemeContext";
import { FiSave, FiBell, FiShield, FiGlobe, FiMail } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import toast from "react-hot-toast";

const Settings = () => {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState({
    siteName: "TaskFlow",
    siteEmail: "admin@taskflow.com",
    timezone: "UTC",
    emailNotifs: true,
    pushNotifs: true,
    weeklyReport: false,
    twoFactor: false,
    sessionTimeout: "30",
    passwordPolicy: "strong",
    maxProjects: "50",
    maxUsers: "200",
    allowRegistration: true,
  });

  const cardBg = isDark ? "#12121f" : "#ffffff";
  const border = isDark ? "#1e1e30" : "#e2e8f0";
  const text = isDark ? "#e8e8f0" : "#1a1a2e";
  const muted = isDark ? "#6b6b8a" : "#64748b";
  const inputBg = isDark ? "#0d0d18" : "#f8fafc";

  const handleSave = () => toast.success("Settings saved!");

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-300"
      style={{
        backgroundColor: value ? "#ff6b35" : isDark ? "#1e1e30" : "#e2e8f0",
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm"
        style={{ left: value ? "22px" : "2px" }}
      />
    </button>
  );

  const Section = ({ icon: Icon, title, children }) => (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.3)"
          : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="flex items-center gap-2 mb-5"
        style={{ borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c5a)" }}
        >
          <Icon size={16} color="white" />
        </div>
        <h3
          className="text-base font-bold"
          style={{ fontFamily: "Syne, sans-serif", color: text }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, children }) => (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: `1px solid ${border}` }}
    >
      <p
        className="text-sm"
        style={{ color: text, fontFamily: "DM Sans, sans-serif" }}
      >
        {label}
      </p>
      {children}
    </div>
  );

  return (
    <PageWrapper title="Settings">
      <div className="max-w-2xl">
        {/* General */}
        <Section icon={MdDashboard} title="General">
          <Field label="Site Name">
            <input
              value={settings.siteName}
              onChange={(e) =>
                setSettings({ ...settings, siteName: e.target.value })
              }
              className="px-3 py-2 rounded-xl outline-none text-sm w-48"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            />
          </Field>
          <Field label="Admin Email">
            <input
              value={settings.siteEmail}
              onChange={(e) =>
                setSettings({ ...settings, siteEmail: e.target.value })
              }
              className="px-3 py-2 rounded-xl outline-none text-sm w-48"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            />
          </Field>
          <Field label="Timezone">
            <select
              value={settings.timezone}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
              className="px-3 py-2 rounded-xl outline-none text-sm"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {["UTC", "EST", "PST", "IST", "GMT"].map((tz) => (
                <option key={tz}>{tz}</option>
              ))}
            </select>
          </Field>
          <Field label="Allow Registration">
            <Toggle
              value={settings.allowRegistration}
              onChange={(v) =>
                setSettings({ ...settings, allowRegistration: v })
              }
            />
          </Field>
        </Section>

        {/* Notifications */}
        <Section icon={FiBell} title="Notifications">
          <Field label="Email Notifications">
            <Toggle
              value={settings.emailNotifs}
              onChange={(v) => setSettings({ ...settings, emailNotifs: v })}
            />
          </Field>
          <Field label="Push Notifications">
            <Toggle
              value={settings.pushNotifs}
              onChange={(v) => setSettings({ ...settings, pushNotifs: v })}
            />
          </Field>
          <Field label="Weekly Reports">
            <Toggle
              value={settings.weeklyReport}
              onChange={(v) => setSettings({ ...settings, weeklyReport: v })}
            />
          </Field>
        </Section>

        {/* Security */}
        <Section icon={FiShield} title="Security">
          <Field label="Two-Factor Auth">
            <Toggle
              value={settings.twoFactor}
              onChange={(v) => setSettings({ ...settings, twoFactor: v })}
            />
          </Field>
          <Field label="Session Timeout (min)">
            <select
              value={settings.sessionTimeout}
              onChange={(e) =>
                setSettings({ ...settings, sessionTimeout: e.target.value })
              }
              className="px-3 py-2 rounded-xl outline-none text-sm"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {["15", "30", "60", "120"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Password Policy">
            <select
              value={settings.passwordPolicy}
              onChange={(e) =>
                setSettings({ ...settings, passwordPolicy: e.target.value })
              }
              className="px-3 py-2 rounded-xl outline-none text-sm"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {["basic", "medium", "strong"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
        </Section>

        {/* Limits */}
        <Section icon={FiGlobe} title="System Limits">
          <Field label="Max Projects">
            <input
              type="number"
              value={settings.maxProjects}
              onChange={(e) =>
                setSettings({ ...settings, maxProjects: e.target.value })
              }
              className="px-3 py-2 rounded-xl outline-none text-sm w-24"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            />
          </Field>
          <Field label="Max Users">
            <input
              type="number"
              value={settings.maxUsers}
              onChange={(e) =>
                setSettings({ ...settings, maxUsers: e.target.value })
              }
              className="px-3 py-2 rounded-xl outline-none text-sm w-24"
              style={{
                backgroundColor: inputBg,
                border: `1px solid ${border}`,
                color: text,
                fontFamily: "DM Sans, sans-serif",
              }}
            />
          </Field>
        </Section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #ff6b35, #ff8c5a)",
            color: "white",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: "0 4px 20px rgba(255,107,53,0.4)",
          }}
        >
          <FiSave size={16} /> Save All Settings
        </button>
      </div>
    </PageWrapper>
  );
};

export default Settings;
