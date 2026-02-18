const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // AWS S3 errors
  if (err.name === 'NoSuchKey') {
    return res.status(404).json({
      success: false,
      message: 'Video not found in storage',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors,
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;