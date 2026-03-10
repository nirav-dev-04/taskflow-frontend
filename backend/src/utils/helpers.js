/**
 * General-purpose helper utilities for TaskFlow.
 */

// ─── String Helpers ────────────────────────────────────────────────────────

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 */
export function capitalize(str = "") {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert snake_case or kebab-case to Title Case.
 * "in_progress" → "In Progress"
 */
export function toTitleCase(str = "") {
  return str
    .replace(/[_-]/g, " ")
    .replace(
      /\w\S*/g,
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    );
}

/**
 * Truncate a string to maxLength and append ellipsis.
 * @param {string} str
 * @param {number} maxLength (default 60)
 */
export function truncate(str = "", maxLength = 60) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Get initials from a full name.
 * "John Doe" → "JD", "Alice" → "AL"
 */
export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a slug from a string.
 * "My Project Name" → "my-project-name"
 */
export function slugify(str = "") {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Simple pluralize — returns singular or plural form.
 * pluralize(1, "task") → "task"
 * pluralize(3, "task") → "tasks"
 * pluralize(3, "person", "people") → "people"
 */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural || `${singular}s`;
}

// ─── Number & Math Helpers ─────────────────────────────────────────────────

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage — avoids divide-by-zero.
 * @param {number} part
 * @param {number} total
 * @param {number} decimals (default 0)
 */
export function percentage(part, total, decimals = 0) {
  if (!total || total === 0) return 0;
  return parseFloat(((part / total) * 100).toFixed(decimals));
}

/**
 * Format a number with commas: 1000000 → "1,000,000"
 */
export function formatNumber(n) {
  if (n == null) return "0";
  return new Intl.NumberFormat("en-US").format(n);
}

/**
 * Format bytes to a human-readable size.
 * 1024 → "1 KB", 1048576 → "1 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

// ─── Array Helpers ─────────────────────────────────────────────────────────

/**
 * Group an array of objects by a key.
 * groupBy(tasks, "status") → { todo: [...], done: [...] }
 */
export function groupBy(arr = [], key) {
  return arr.reduce((acc, item) => {
    const group = item[key] ?? "other";
    acc[group] = acc[group] ? [...acc[group], item] : [item];
    return acc;
  }, {});
}

/**
 * Remove duplicates from an array of primitives or objects.
 * @param {Array}  arr
 * @param {string} key  - if provided, deduplicates objects by this key
 */
export function unique(arr = [], key) {
  if (!key) return [...new Set(arr)];
  const seen = new Set();
  return arr.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

/**
 * Sort an array of objects by a key, ascending or descending.
 * @param {object[]} arr
 * @param {string}   key
 * @param {"asc"|"desc"} direction
 */
export function sortBy(arr = [], key, direction = "asc") {
  return [...arr].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return direction === "desc" ? -cmp : cmp;
  });
}

/**
 * Chunk an array into sub-arrays of size n.
 * chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]]
 */
export function chunk(arr = [], size = 1) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ─── Object Helpers ────────────────────────────────────────────────────────

/**
 * Deep clone a JSON-serializable object.
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove keys with null/undefined/empty-string values from an object.
 * Useful for cleaning query params before API calls.
 */
export function cleanObject(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && v !== "",
    ),
  );
}

/**
 * Pick specific keys from an object.
 * pick({ a:1, b:2, c:3 }, ["a","c"]) → { a:1, c:3 }
 */
export function pick(obj = {}, keys = []) {
  return Object.fromEntries(
    keys.filter((k) => k in obj).map((k) => [k, obj[k]]),
  );
}

/**
 * Omit specific keys from an object.
 * omit({ a:1, b:2, c:3 }, ["b"]) → { a:1, c:3 }
 */
export function omit(obj = {}, keys = []) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k)),
  );
}

// ─── Color / Avatar Helpers ────────────────────────────────────────────────

const AVATAR_PALETTE = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#6366f1",
];

/**
 * Deterministically pick an avatar background color from a name/id string.
 */
export function getAvatarColor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// ─── URL / Navigation Helpers ──────────────────────────────────────────────

/**
 * Build a query string from an object, skipping empty values.
 * buildQueryString({ page: 1, search: "hello", status: "" }) → "?page=1&search=hello"
 */
export function buildQueryString(params = {}) {
  const cleaned = cleanObject(params);
  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `?${qs}` : "";
}

/**
 * Parse a query string back to an object.
 * parseQueryString("?page=1&search=hello") → { page: "1", search: "hello" }
 */
export function parseQueryString(search = "") {
  return Object.fromEntries(new URLSearchParams(search));
}

// ─── Async Helpers ─────────────────────────────────────────────────────────

/**
 * Sleep for n milliseconds.
 * await sleep(500)
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function up to `attempts` times with exponential backoff.
 */
export async function retryAsync(fn, attempts = 3, delayMs = 300) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await sleep(delayMs * Math.pow(2, i));
    }
  }
  throw lastError;
}

// ─── Clipboard ────────────────────────────────────────────────────────────

/**
 * Copy text to clipboard.
 * @returns {Promise<boolean>} true on success
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
