import { LIMITS } from "./constants";

/**
 * Validation utilities for TaskFlow forms.
 * Each validator returns an error string on failure, or "" on success.
 * Schema validators return an errors object { field: errorMessage }.
 */

// ─── Primitives ────────────────────────────────────────────────────────────

/** Required — rejects empty string, null, undefined */
export function required(value, fieldName = "This field") {
  if (value === null || value === undefined) return `${fieldName} is required`;
  if (typeof value === "string" && !value.trim())
    return `${fieldName} is required`;
  if (Array.isArray(value) && value.length === 0)
    return `${fieldName} is required`;
  return "";
}

/** Min string length */
export function minLength(value = "", min, fieldName = "This field") {
  if (value.trim().length < min)
    return `${fieldName} must be at least ${min} characters`;
  return "";
}

/** Max string length */
export function maxLength(value = "", max, fieldName = "This field") {
  if (value.trim().length > max)
    return `${fieldName} must be at most ${max} characters`;
  return "";
}

/** Min numeric value */
export function minValue(value, min, fieldName = "Value") {
  if (Number(value) < min) return `${fieldName} must be at least ${min}`;
  return "";
}

/** Max numeric value */
export function maxValue(value, max, fieldName = "Value") {
  if (Number(value) > max) return `${fieldName} must be at most ${max}`;
  return "";
}

// ─── Format Validators ─────────────────────────────────────────────────────

/** Email address */
export function validateEmail(email = "") {
  if (!email.trim()) return "Email is required";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return "Please enter a valid email address";
  return "";
}

/** Password strength */
export function validatePassword(password = "") {
  if (!password) return "Password is required";
  if (password.length < LIMITS.PASSWORD_MIN)
    return `Password must be at least ${LIMITS.PASSWORD_MIN} characters`;
  if (password.length > LIMITS.PASSWORD_MAX)
    return `Password must be at most ${LIMITS.PASSWORD_MAX} characters`;
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  return "";
}

/** Confirm password matches */
export function validateConfirmPassword(password = "", confirmPassword = "") {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
}

/** Full name */
export function validateName(name = "") {
  if (!name.trim()) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (name.trim().length > LIMITS.NAME_MAX)
    return `Name must be at most ${LIMITS.NAME_MAX} characters`;
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim()))
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  return "";
}

/** URL */
export function validateUrl(url = "") {
  if (!url) return "";
  try {
    new URL(url);
    return "";
  } catch {
    return "Please enter a valid URL (e.g. https://example.com)";
  }
}

/** Date — must be a valid date string */
export function validateDate(date = "") {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Please enter a valid date";
  return "";
}

/** Date must be in the future */
export function validateFutureDate(date = "") {
  const err = validateDate(date);
  if (err) return err;
  if (date && new Date(date) <= new Date()) return "Date must be in the future";
  return "";
}

/** File size */
export function validateFileSize(file, maxMB = 10) {
  if (!file) return "";
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) return `File size must be under ${maxMB}MB`;
  return "";
}

/** File type */
export function validateFileType(file, allowedTypes = []) {
  if (!file || allowedTypes.length === 0) return "";
  if (!allowedTypes.includes(file.type))
    return `File type not allowed. Accepted: ${allowedTypes.map((t) => t.split("/")[1]).join(", ")}`;
  return "";
}

// ─── Form Schema Validators ────────────────────────────────────────────────

/**
 * Validate login form.
 * @param {{ email, password }} values
 * @returns {{ email?, password? }} errors
 */
export function validateLoginForm(values) {
  const errors = {};
  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;
  if (!values.password) errors.password = "Password is required";
  return errors;
}

/**
 * Validate register form.
 * @param {{ name, email, password, confirmPassword }} values
 * @returns errors object
 */
export function validateRegisterForm(values) {
  const errors = {};
  const nameErr = validateName(values.name);
  const emailErr = validateEmail(values.email);
  const passErr = validatePassword(values.password);
  const confErr = validateConfirmPassword(
    values.password,
    values.confirmPassword,
  );
  if (nameErr) errors.name = nameErr;
  if (emailErr) errors.email = emailErr;
  if (passErr) errors.password = passErr;
  if (confErr) errors.confirmPassword = confErr;
  return errors;
}

/**
 * Validate forgot password form.
 * @param {{ email }} values
 */
export function validateForgotPasswordForm(values) {
  const errors = {};
  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;
  return errors;
}

/**
 * Validate reset password form.
 * @param {{ password, confirmPassword }} values
 */
export function validateResetPasswordForm(values) {
  const errors = {};
  const passErr = validatePassword(values.password);
  const confErr = validateConfirmPassword(
    values.password,
    values.confirmPassword,
  );
  if (passErr) errors.password = passErr;
  if (confErr) errors.confirmPassword = confErr;
  return errors;
}

/**
 * Validate task form.
 * @param {{ title, description?, priority, dueDate?, status }} values
 */
export function validateTaskForm(values) {
  const errors = {};
  const titleReq = required(values.title, "Title");
  if (titleReq) {
    errors.title = titleReq;
  } else {
    const titleLen = maxLength(values.title, LIMITS.TITLE_MAX, "Title");
    if (titleLen) errors.title = titleLen;
  }
  if (values.description) {
    const descLen = maxLength(
      values.description,
      LIMITS.DESCRIPTION_MAX,
      "Description",
    );
    if (descLen) errors.description = descLen;
  }
  if (!values.priority) errors.priority = "Priority is required";
  if (values.dueDate) {
    const dateErr = validateDate(values.dueDate);
    if (dateErr) errors.dueDate = dateErr;
  }
  return errors;
}

/**
 * Validate project form.
 * @param {{ name, description?, status, priority, dueDate? }} values
 */
export function validateProjectForm(values) {
  const errors = {};
  const nameReq = required(values.name, "Project name");
  if (nameReq) {
    errors.name = nameReq;
  } else {
    const nameLen = maxLength(values.name, LIMITS.NAME_MAX, "Project name");
    if (nameLen) errors.name = nameLen;
  }
  if (values.description) {
    const descLen = maxLength(
      values.description,
      LIMITS.DESCRIPTION_MAX,
      "Description",
    );
    if (descLen) errors.description = descLen;
  }
  if (!values.status) errors.status = "Status is required";
  if (!values.priority) errors.priority = "Priority is required";
  if (values.dueDate) {
    const dateErr = validateDate(values.dueDate);
    if (dateErr) errors.dueDate = dateErr;
  }
  return errors;
}

/**
 * Validate profile update form.
 * @param {{ name, email }} values
 */
export function validateProfileForm(values) {
  const errors = {};
  const nameErr = validateName(values.name);
  const emailErr = validateEmail(values.email);
  if (nameErr) errors.name = nameErr;
  if (emailErr) errors.email = emailErr;
  return errors;
}

/**
 * Validate change-password form.
 * @param {{ currentPassword, newPassword, confirmPassword }} values
 */
export function validateChangePasswordForm(values) {
  const errors = {};
  if (!values.currentPassword)
    errors.currentPassword = "Current password is required";
  const passErr = validatePassword(values.newPassword);
  if (passErr) errors.newPassword = passErr;
  const confErr = validateConfirmPassword(
    values.newPassword,
    values.confirmPassword,
  );
  if (confErr) errors.confirmPassword = confErr;
  if (values.currentPassword && values.newPassword === values.currentPassword)
    errors.newPassword = "New password must be different from current password";
  return errors;
}

// ─── Utility ───────────────────────────────────────────────────────────────

/** Returns true if an errors object has no error messages */
export function isFormValid(errors = {}) {
  return Object.values(errors).every((v) => !v);
}

/** Returns the first error message found in an errors object */
export function getFirstError(errors = {}) {
  return Object.values(errors).find((v) => !!v) || null;
}
