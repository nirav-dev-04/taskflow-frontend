/**
 * Date formatting utilities for TaskFlow.
 * No external dependencies — uses native Intl & Date APIs.
 */

// ─── Core Formatters ───────────────────────────────────────────────────────

/**
 * Format a date as "Jan 15, 2025"
 * @param {string|Date} date
 */
export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date as "Jan 15"  (no year)
 * @param {string|Date} date
 */
export function formatDateShort(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date as "January 15, 2025"
 * @param {string|Date} date
 */
export function formatDateLong(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date + time as "Jan 15, 2025 at 3:45 PM"
 * @param {string|Date} date
 */
export function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format time only as "3:45 PM"
 * @param {string|Date} date
 */
export function formatTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format as ISO date string for <input type="date"> — "2025-01-15"
 * @param {string|Date} date
 */
export function formatDateInput(date) {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Relative Time ─────────────────────────────────────────────────────────

/**
 * Returns a human-friendly relative time string:
 * "just now", "5 minutes ago", "2 days ago", "Jan 15, 2025"
 * @param {string|Date} date
 */
export function formatRelativeTime(date) {
  if (!date) return "—";
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 10) return "just now";
  if (diffSecs < 60) return `${diffSecs} seconds ago`;
  if (diffMins < 60)
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  if (diffWeeks < 5)
    return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  return formatDate(date);
}

/**
 * Future-aware relative time:
 * "in 3 days", "in 2 hours", "overdue by 1 day"
 * @param {string|Date} date
 */
export function formatRelativeFuture(date) {
  if (!date) return "—";
  const now = new Date();
  const then = new Date(date);
  const diffMs = then - now;

  if (diffMs < 0) {
    const overdueDays = Math.abs(Math.floor(diffMs / 86400000));
    if (overdueDays < 1) return "overdue today";
    return `overdue by ${overdueDays} day${overdueDays !== 1 ? "s" : ""}`;
  }

  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 60) return `in ${diffMins} minute${diffMins !== 1 ? "s" : ""}`;
  if (diffHrs < 24) return `in ${diffHrs} hour${diffHrs !== 1 ? "s" : ""}`;
  if (diffDays < 7) return `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  if (diffWeeks < 5) return `in ${diffWeeks} week${diffWeeks !== 1 ? "s" : ""}`;
  return formatDate(date);
}

// ─── Due Date Helpers ──────────────────────────────────────────────────────

/**
 * Returns true if the date is in the past.
 * @param {string|Date} date
 */
export function isOverdue(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

/**
 * Returns true if the date is within the next N days.
 * @param {string|Date} date
 * @param {number} days  (default 3)
 */
export function isDueSoon(date, days = 3) {
  if (!date) return false;
  const now = new Date();
  const then = new Date(date);
  const diffMs = then - now;
  return diffMs > 0 && diffMs <= days * 86400000;
}

/**
 * Returns true if the date is today.
 * @param {string|Date} date
 */
export function isToday(date) {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Smart due-date label: "Overdue", "Due today", "Due in 2 days", or "Jan 15"
 * @param {string|Date} date
 */
export function formatDueDate(date) {
  if (!date) return null;
  if (isOverdue(date)) return "Overdue";
  if (isToday(date)) return "Due today";
  if (isDueSoon(date, 3)) return formatRelativeFuture(date);
  return formatDateShort(date);
}

// ─── Calendar Helpers ──────────────────────────────────────────────────────

/**
 * Returns the start of a given day (midnight).
 * @param {Date} date
 */
export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the end of a given day (23:59:59.999).
 * @param {Date} date
 */
export function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Returns array of all days in a given month.
 * @param {number} year
 * @param {number} month  (0-indexed)
 * @returns {Date[]}
 */
export function getDaysInMonth(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

/**
 * Returns name of the weekday: "Monday", "Tuesday" …
 * @param {string|Date} date
 */
export function getDayName(date) {
  return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
}

/**
 * Returns month name + year: "January 2025"
 * @param {string|Date} date
 */
export function getMonthYear(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
