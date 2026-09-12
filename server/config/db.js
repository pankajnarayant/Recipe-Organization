import mongoose from 'mongoose';
import { loadDatabase } from './fallbackStore.js';

global.isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartplate';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    global.isMongoConnected = true;
    console.log(`[Database] Connected to external MongoDB instance: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Note: Standalone MongoDB at ${uri} was not reachable (${err.message}).`);
    console.log('[Database] Activating integrated persistent MongoDB storage engine...');
    loadDatabase();
    global.isMongoConnected = false;
    console.log('[Database] Storage ready with JSON-backed persistence in server/data/');
  }
};

export const disconnectDB = async () => {
  if (global.isMongoConnected) {
    await mongoose.disconnect();
  }
};
