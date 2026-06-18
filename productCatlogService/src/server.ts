import app from './app';
import { database } from './config/db';

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, () => {
  console.log(`Product Service is running on port ${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Shutting down Product Service gracefully...');
  server.close(async () => {
    console.log('HTTP server closed.');
    await database.disconnect();
    console.log('Database connections closed. Exit.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
