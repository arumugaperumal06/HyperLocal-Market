const express = require('express');
const connectDB = require('./config/db.cjs');
const cors = require('cors');
const session = require('express-session');
const path = require('path'); 
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = express();
connectDB();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());
if (!process.env.SESSION_SECRET) {
    console.error("FATAL ERROR: SESSION_SECRET is not defined in .env. Please set it.");
    process.exit(1);
}
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, 
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    }
  })
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => res.send('API Running - Server Root'));
app.use('/api/auth', require('./routes/auth.cjs'));
app.use('/api/items', require('./routes/items.cjs')); 
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});