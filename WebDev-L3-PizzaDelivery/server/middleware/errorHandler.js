// Central error handler — never leaks stack traces to the client.
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already in use`;
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier supplied';
  }

  res.status(status).json({
    message: process.env.NODE_ENV === 'production' && status === 500 ? 'Something went wrong' : message,
  });
}

module.exports = { notFound, errorHandler };
