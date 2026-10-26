import mongoose from 'mongoose';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let mongodInstance: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    let mongoUri = env.MONGODB_URI;

    if (!mongoUri || mongoUri === 'in-memory') {
      console.log('🔄 Initializing in-memory MongoDB instance for development/testing...');
      mongodInstance = await MongoMemoryServer.create({
        binary: {
          version: '5.0.28',
          downloadDir: path.resolve(__dirname, '../../.mongo-bin'),
        },
      });
      mongoUri = mongodInstance.getUri();
      console.log(`✅ In-memory MongoDB started at: ${mongoUri}`);
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`📦 Connected to MongoDB at: ${mongoUri.includes('@') ? mongoUri.split('@')[1] : mongoUri}`);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
    console.log('🛑 MongoDB disconnected gracefully');
  } catch (error) {
    console.error('Error during database disconnection:', error);
  }
};
