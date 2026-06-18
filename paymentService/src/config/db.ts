import mongoose from 'mongoose';

class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined in env variables');
      process.exit(1);
    }

    try {
      if (mongoose.connection.readyState === 1) {
        console.log('MongoDB already connected');
        return;
      }

      mongoose.connection.on('connected', () => {
        console.log('MongoDB connection established successfully');
      });

      mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
      });

      await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

    } catch (err) {
      console.error('MongoDB Initial Connection Error:', err);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('MongoDB disconnected cleanly');
  }
}

export const database = Database.getInstance();
