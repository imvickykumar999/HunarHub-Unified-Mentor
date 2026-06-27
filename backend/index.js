const express = require('express');
const cors = require('cors');
const path = require('path');
global.crypto = require('crypto');
require('dotenv').config();

const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test API Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'HunarHub API is healthy' });
});

// Import Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const productRoutes = require('./routes/products');
const requestRoutes = require('./routes/requests');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');

// Apply Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
