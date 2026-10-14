const NAME_MIN = 20;
const NAME_MAX = 60;
const ADDRESS_MAX = 400;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateName(name) {
  const value = String(name || '').trim();
  if (!value) return 'Name is required';
  if (value.length < NAME_MIN || value.length > NAME_MAX) {
    return `Name must be between ${NAME_MIN} and ${NAME_MAX} characters`;
  }
  return '';
}

export function validateAddress(address) {
  const value = String(address || '').trim();
  if (!value) return 'Address is required';
  if (value.length > ADDRESS_MAX) {
    return `Address must be at most ${ADDRESS_MAX} characters`;
  }
  return '';
}

export function validateEmail(email) {
  const value = normalizeEmail(email);
  if (!value) return 'Email is required';
  if (!emailRegex.test(value)) return 'Please provide a valid email address';
  return '';
}

export function validatePassword(password) {
  const value = String(password || '');
  if (!value) return 'Password is required';
  if (value.length < PASSWORD_MIN || value.length > PASSWORD_MAX) {
    return `Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`;
  }
  if (!passwordRegex.test(value)) {
    return 'Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character';
  }
  return '';
}

export function validateRating(rating) {
  const n = Number(rating);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return 'Rating must be an integer between 1 and 5';
  }
  return '';
}

export function validateRequired(value, label = 'This field') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} is required`;
  }
  return '';
}

export const LIMITS = { NAME_MIN, NAME_MAX, ADDRESS_MAX, PASSWORD_MIN, PASSWORD_MAX };
