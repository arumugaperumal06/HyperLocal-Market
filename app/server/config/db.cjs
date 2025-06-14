const mongoose = require('mongoose');
// .env should already be loaded by the main server file before this is called.

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('FATAL ERROR: MONGO_URI is not defined. Make sure .env is loaded and MONGO_URI is set.');
      process.exit(1);
    }
    // Use the MONGO_URI from your .env file
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
      // No need for other options like useCreateIndex, useFindAndModify with Mongoose 6+
    });
    console.log('MongoDB Connected successfully via db.js...');
  } catch (err) {
    console.error('MongoDB Connection Error (from db.js):', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;