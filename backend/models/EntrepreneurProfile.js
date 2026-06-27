const mongoose = require('mongoose');

const EntrepreneurProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Cobbler', 'Potter', 'Tailor', 'Artisan', 'Small Vendor', 'Other'],
    required: [true, 'Please specify your primary skill category']
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  pricingDetails: {
    type: String,
    trim: true
  },
  gallery: [{
    type: String // File paths or image URLs
  }],
  verified: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  earnings: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EntrepreneurProfile', EntrepreneurProfileSchema);
