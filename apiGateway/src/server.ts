import app from './app';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Shutting down API Gateway gracefully...');
  server.close(() => {
    console.log('API Gateway closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
