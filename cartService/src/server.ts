import app from './app';

const PORT = process.env.PORT || 3007;

const server = app.listen(PORT, () => {
  console.log(`Cart Service is running on port ${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Shutting down Cart Service gracefully...');
  server.close(() => {
    console.log('HTTP server closed. Exit.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
