const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure 'User' is the name of your User model
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  name: { 
    type: String,
    required: [true, 'Please add a name'], // Make it required if users must have a name
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Books', 'Electronics', 'Furniture', 'Stationery', 'Notes', 'Services', 'Other'],
  },
  condition: {
    type: String,
    required: [true, 'Please select the condition'],
    enum: ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'],
  },
  location: {
    type: String,
    required: [true, 'Please specify a pickup location'],
  },
  phone:{
    type: String,
  },
  images: [ // Array to store image paths/URLs
    {
      type: String,
    },
  ],
  isSold: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Item', ItemSchema);