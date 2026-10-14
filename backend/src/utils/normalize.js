function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function trimString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

module.exports = { normalizeEmail, trimString };
