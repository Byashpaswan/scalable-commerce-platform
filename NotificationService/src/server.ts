import app from './app';

const PORT = process.env.PORT || 3008;

const server = app.listen(PORT, () => {
  console.log(`Notification Service is running on port ${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Shutting down Notification Service gracefully...');
  server.close(() => {
    console.log('HTTP server closed. Exit.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
