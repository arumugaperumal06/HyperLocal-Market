const express = require('express');
const router = express.Router();
const Item = require('../models/Item.cjs'); // Import the Item model
const { protect } = require('../middleware/authMiddleware.cjs'); // Your authentication middleware
const multer = require('multer');
const path = require('path');

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif' || file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, or WEBP images are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  },
  fileFilter: fileFilter
});
// --- End Multer Configuration ---


// @route   POST /api/items
// @desc    Create a new item
// @access  Private
router.post(
  '/',
  protect,
  upload.single('image'),
  async (req, res) => {
    console.log('--- POST /api/items: New Item Request ---');
    console.log('Authenticated User:', req.user);
    console.log('Request Body (text fields):', req.body);
    console.log('Request File (uploaded image):', req.file);

    try {
      const { title, description, price, category, condition, location, phone } = req.body;

      if (!title || !description || !price || !category || !condition || !location || !phone) {
        console.log('Validation Error: Missing required text fields (including phone).');
        return res.status(400).json({ msg: 'Please enter all required text fields, including phone number' });
      }
      if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        console.log('Validation Error: Price is not a positive number.');
        return res.status(400).json({ msg: 'Price must be a positive number.' });
      }
      if (!/^\d{10}$/.test(phone.replace(/\s+/g, ''))) {
          console.log('Validation Error: Phone number is not a valid 10-digit number.');
          return res.status(400).json({ msg: 'Please enter a valid 10-digit phone number.' });
      }

      let imagePaths = [];
      if (req.file) {
        const imagePath = `/uploads/${req.file.filename}`;
        imagePaths.push(imagePath);
        console.log('Image uploaded. Path generated:', imagePath);
      }

      const newItemData = {
        user: req.user.id, // Associate with the logged-in user
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        location,
        phone,
        images: imagePaths,
      };

      console.log('Data for new Item document:', newItemData);

      const newItem = new Item(newItemData);
      let savedItem = await newItem.save();

      // Populate user details (including name) before sending response
      savedItem = await savedItem.populate('user', 'loginId name'); // <<< POPULATE USER WITH NAME

      console.log('Item successfully saved to database:', savedItem);
      res.status(201).json(savedItem);

    } catch (err) {
      console.error('--- ERROR in POST /api/items ---');
      console.error('Error Message:', err.message);
      console.error('Error Stack:', err.stack);

      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ msg: messages.join(', ') });
      }
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ msg: `File upload error: ${err.message}` });
      }
      if (err.message && err.message.includes('Only JPEG, PNG, GIF, or WEBP images are allowed!')) {
        return res.status(400).json({ msg: err.message });
      }
      
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/items
// @desc    Get all items that are not marked as sold
// @access  Public
router.get('/', async (req, res) => {
  console.log('--- GET /api/items: Fetching all items ---');
  try {
    const items = await Item.find({ isSold: false })
      .populate('user', 'loginId name') // <<< POPULATE USER WITH NAME
      .sort({ createdAt: -1 });
    
    console.log(`Fetched ${items.length} items.`);
    res.json(items);
  } catch (err) {
    console.error('--- ERROR in GET /api/items ---');
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/items/:id
// @desc    Get a single item by its ID
// @access  Public
router.get('/:id', async (req, res) => {
  console.log(`--- GET /api/items/${req.params.id}: Fetching single item ---`);
  try {
    const item = await Item.findById(req.params.id)
      .populate('user', 'loginId name'); // <<< POPULATE USER WITH NAME

    if (!item) {
      console.log(`Item with ID ${req.params.id} not found.`);
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    console.log('Fetched single item:', item);
    res.json(item);
  } catch (err) {
    console.error(`--- ERROR in GET /api/items/${req.params.id} ---`);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found (invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
});


// @route   PUT /api/items/:id/sell
// @desc    Mark an item as sold
// @access  Private
router.put(
  '/:id/sell',
  protect,
  async (req, res) => {
    console.log(`--- PUT /api/items/${req.params.id}/sell: Mark as sold request ---`);
    console.log('Authenticated User attempting to mark as sold:', req.user);

    try {
      const itemId = req.params.id;
      const currentUserId = req.user.id;

      const itemToCheck = await Item.findById(itemId);

      if (!itemToCheck) {
        console.log(`Item with ID ${itemId} not found for selling.`);
        return res.status(404).json({ msg: 'Item not found' });
      }

      if (itemToCheck.isSold) {
        console.log(`Item ${itemId} is already sold.`);
        // Populate user details for consistency in response, even if already sold
        const populatedItem = await itemToCheck.populate('user', 'loginId name');
        return res.status(400).json({ msg: 'This item is already marked as sold.', item: populatedItem });
      }

      if (itemToCheck.user.toString() === currentUserId) {
         console.log(`Seller (User ID: ${currentUserId}) cannot mark their own item (ID: ${itemId}) as sold through this buyer endpoint.`);
         return res.status(403).json({ msg: 'Sellers cannot mark their own items as sold using this action.' });
      }

      const updatedItem = await Item.findByIdAndUpdate(
        itemId,
        { $set: { isSold: true } },
        { new: true, runValidators: false } 
      ).populate('user', 'loginId name'); // <<< POPULATE USER WITH NAME

      if (!updatedItem) {
          console.log(`Item with ID ${itemId} not found during update.`);
          return res.status(404).json({ msg: 'Item not found during update' });
      }

      console.log(`Item ${itemId} marked as sold successfully by User ID: ${currentUserId}`);
      res.json(updatedItem);

    } catch (err) {
      console.error(`--- ERROR in PUT /api/items/${req.params.id}/sell ---`);
      console.error('Error Message:', err.message);
      console.error('Error Stack:', err.stack);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Item not found (invalid ID format)' });
      }
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;