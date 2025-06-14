
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  loginId: { // Changed from phoneNumber
    type: String,
    required: true,
    unique: true,
    match: [
      /^\d{10}@student\.annauniv\.edu$/,
      'Please fill a valid Login ID (e.g., 2023xxxxxx@student.annauniv.edu)',
    ],
  },
  // You can add more fields like name, etc.
  // name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
