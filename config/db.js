import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Ensure indexes are built on all models after connection
    await Promise.all(
      Object.values(mongoose.connection.models).map((model) =>
        model.createIndexes()
      )
    );
    console.log('All indexes ensured');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
