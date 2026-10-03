const mongoose = require('mongoose');
const dns = require('dns');


try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  
}

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_complaints';

  try {
    // Attempt standard connection to MongoDB URI
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500 // Fast failover if local MongoDB is not running
    });
    console.log(` MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(` Could not connect to MongoDB at ${uri} (${err.message}).`);
    console.log(` Starting in-memory MongoDB server for zero-config operation...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();

      const conn = await mongoose.connect(inMemoryUri);
      console.log(` Connected to In-Memory MongoDB Server: ${inMemoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(` Failed to connect to MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error(`Error disconnecting database: ${err.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
