const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path'); // For robust .env path if needed here, but usually main server file handles it
const User = require('../models/User.cjs'); // Assuming .cjs for models
const { generateCaptchaText, verifyCaptchaText } = require('../services/captchaService.cjs'); // Import the updated functions

// Load .env variables if this file needs them directly and server.cjs hasn't already
// It's generally better if server.cjs loads .env once for the whole app.
// If server.cjs already does `require('dotenv').config(...)`, you might not need it here.
// However, to be safe for `process.env.JWT_SECRET`:
if (!process.env.JWT_SECRET) { // Check if already loaded
    require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); // Path to server/.env
}


const router = express.Router();

const LOGIN_ID_REGEX = /^\d{10}@student\.annauniv\.edu$/;
const MIN_YEAR = 2000; // Adjust as needed

// @route   GET /api/auth/captcha
// @desc    Get a new CAPTCHA text and store it in session
// @access  Public
router.get('/captcha', (req, res) => { // Define the handler function directly here
  try {
    const captcha = generateCaptchaText(); // Use the text generation function

    if (!req.session) {
        console.error("Session object not found on req in /captcha. Ensure session middleware is active.");
        return res.status(500).json({ msg: 'Session not initialized' });
    }

    req.session.captchaText = captcha; // Store the generated text in the session
    console.log(`CAPTCHA generated and stored in session ${req.sessionID}: ${captcha}`);
    res.json({ captchaText: captcha }); // Send the CAPTCHA text to the client
  } catch (err) {
    console.error('Error in /captcha route:', err.message);
    res.status(500).send('Server Error generating CAPTCHA');
  }
});

// @route   POST /api/auth/login
// @desc    Login user with Login ID and CAPTCHA
// @access  Public
router.post('/login', async (req, res) => {
  const { loginId, userCaptchaInput } = req.body;

  // 1. Validate Inputs
  if (!loginId || !userCaptchaInput) {
    return res.status(400).json({ msg: 'Login ID and CAPTCHA are required' });
  }

  // 2. Verify CAPTCHA
  if (!req.session || !req.session.captchaText) {
    // This case means CAPTCHA was never generated for this session or session expired/cleared
    console.warn(`Attempt to verify CAPTCHA for session ${req.sessionID} but no captchaText found in session.`);
    // It's good practice to generate a new one for the frontend to retry with
    const newCaptchaOnFail = generateCaptchaText();
    if (req.session) { // If session object exists, try to set it
        req.session.captchaText = newCaptchaOnFail;
    }
    return res.status(400).json({
        msg: 'CAPTCHA not found in session or has expired. Please refresh CAPTCHA.',
        newCaptchaText: newCaptchaOnFail // Provide a new one for the client
    });
  }

  // Use the verifyCaptchaText function, passing the user's input and the text from the session
  if (!verifyCaptchaText(userCaptchaInput, req.session.captchaText)) {
    console.log(`Invalid CAPTCHA attempt for session ${req.sessionID}. User: ${userCaptchaInput}, Expected: ${req.session.captchaText}`);
    // CAPTCHA is invalid, generate a new one and send it back
    const newCaptchaOnFail = generateCaptchaText();
    req.session.captchaText = newCaptchaOnFail; // Update session with new CAPTCHA
    return res.status(400).json({
      msg: 'Invalid CAPTCHA. A new one has been generated.',
      newCaptchaText: newCaptchaOnFail, // Send the new CAPTCHA text to the client
    });
  }

  // CAPTCHA verified successfully, clear it from session to prevent reuse
  console.log(`CAPTCHA verified for session ${req.sessionID}. Clearing session captchaText.`);
  req.session.captchaText = null;

  // 3. Validate Login ID Format and Year
  if (!LOGIN_ID_REGEX.test(loginId)) {
    return res.status(400).json({ msg: 'Invalid Login ID format. Expected: 10digits@student.annauniv.edu' });
  }

  const yearPart = parseInt(loginId.substring(0, 4), 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(yearPart) || yearPart < MIN_YEAR || yearPart > currentYear + 1) {
    return res.status(400).json({ msg: `Invalid year in Login ID. Year must be between ${MIN_YEAR} and ${currentYear + 1}.` });
  }

  try {
    // 4. Find or Create User
    let user = await User.findOne({ loginId });

    if (!user) {
      console.log(`User with loginId ${loginId} not found. Creating new user.`);
      user = new User({ loginId });
      await user.save();
      console.log(`New user created: ${user._id}`);
    } else {
      console.log(`User found: ${user._id}`);
    }

    // 5. Create JWT
    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not defined. Cannot sign token.");
        return res.status(500).send('Server configuration error (JWT).');
    }
    const payload = {
      user: {
        id: user.id, // or user._id depending on your Mongoose version / preference
        loginId: user.loginId,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // Token expiration time
      (err, token) => {
        if (err) {
            console.error('Error signing JWT:', err);
            return res.status(500).send('Error generating token.');
        }
        console.log(`JWT generated for user ${user.loginId}`);
        res.json({ token, user: { id: user.id, loginId: user.loginId } });
      }
    );
  } catch (err) {
    console.error('Login process error:', err.message);
    if (err.name === 'ValidationError') { // Mongoose validation error
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error during login process');
  }
});

module.exports = router;