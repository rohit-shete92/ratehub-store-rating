const { error } = require('../utils/response');

function notFound(req, res) {
  return error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return error(res, 'A record with this email already exists', 409);
  }

  if (err.type === 'entity.parse.failed') {
    return error(res, 'Invalid JSON body', 400);
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return error(res, message, status);
}

module.exports = { notFound, errorHandler };
