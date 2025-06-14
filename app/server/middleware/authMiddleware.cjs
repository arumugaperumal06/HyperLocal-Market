const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs'); // Assuming your User model
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select('-password'); // Exclude password if you have one
      if (!req.user) {
        return res.status(401).json({ msg: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token && req.headers['x-auth-token']) { // Fallback for the token header we used in AuthContext
     try {
      token = req.headers['x-auth-token'];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select('-password');
       if (!req.user) {
        return res.status(401).json({ msg: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: 'Not authorized, token failed (x-auth-token)' });
    }
  }


  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

module.exports = { protect };