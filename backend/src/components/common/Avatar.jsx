const SIZES = {
  xs:  { container: "w-6 h-6",   text: "text-[9px]",  status: "w-1.5 h-1.5 border" },
  sm:  { container: "w-8 h-8",   text: "text-xs",     status: "w-2 h-2 border" },
  md:  { container: "w-10 h-10", text: "text-sm",     status: "w-2.5 h-2.5 border-2" },
  lg:  { container: "w-12 h-12", text: "text-base",   status: "w-3 h-3 border-2" },
  xl:  { container: "w-16 h-16", text: "text-xl",     status: "w-3.5 h-3.5 border-2" },
  "2xl": { container: "w-20 h-20", text: "text-2xl",  status: "w-4 h-4 border-2" },
};

const STATUS_COLORS = {
  online:  "bg-emerald-500",
  away:    "bg-amber-500",
  busy:    "bg-red-500",
  offline: "bg-slate-400",
};

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500",  "bg-pink-500", "bg-indigo-500",
  "bg-cyan-500",   "bg-orange-500",
];

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({
  src,
  name = "",
  size = "md",
  status,
  shape = "circle",
  className = "",
  onClick,
}) {
  const s = SIZES[size] || SIZES.md;
  const shapeClass = shape === "square" ? "rounded-xl" : "rounded-full";
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div
      className={`relative inline-flex shrink-0 ${s.container} ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={name || "avatar"}
          className={`w-full h-full object-cover ${shapeClass} ring-2 ring-white dark:ring-slate-800`}
          onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
        />
      ) : null}

      {/* Fallback initials */}
      <div
        className={`
          w-full h-full ${shapeClass} ${bgColor}
          flex items-center justify-center
          font-bold text-white ${s.text}
          ring-2 ring-white dark:ring-slate-800
          ${src ? "hidden" : "flex"}
        `}
      >
        {initials || "?"}
      </div>

      {/* Status dot */}
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${s.status} ${shapeClass === "rounded-full" ? "rounded-full" : "rounded-sm"} border-white dark:border-slate-900 ${STATUS_COLORS[status] || STATUS_COLORS.offline}`}
        />
      )}
    </div>
  );
}

// Avatar Group
export function AvatarGroup({ users = [], max = 3, size = "sm", className = "" }) {
  const visible = users.slice(0, max);
  const extra = users.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visible.map((user, i) => (
        <Avatar
          key={user.id || user._id || i}
          src={user.avatar}
          name={user.name || user}
          size={size}
          className="ring-2 ring-white dark:ring-slate-800"
        />
      ))}
      {extra > 0 && (
        <div
          className={`
            inline-flex items-center justify-center shrink-0
            ${SIZES[size]?.container || SIZES.sm.container}
            rounded-full bg-slate-200 dark:bg-slate-700
            text-slate-600 dark:text-slate-400
            font-bold ${SIZES[size]?.text || SIZES.sm.text}
            ring-2 ring-white dark:ring-slate-800
          `}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}