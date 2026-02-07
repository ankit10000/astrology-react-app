const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  // Gemini quota/rate limit errors
  if (err.message?.includes('429') || err.message?.includes('quota')) {
    return res.status(429).json({
      error: 'AI service is temporarily busy. Please try again in a minute.',
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
