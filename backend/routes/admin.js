const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const Product = require('../models/Product');
const ServiceRequest = require('../models/ServiceRequest');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get dashboard analytics/statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Total numbers
    const totalUsers = await User.countDocuments();
    const customerCount = await User.countDocuments({ role: 'customer' });
    const entrepreneurCount = await User.countDocuments({ role: 'entrepreneur' });
    const verifiedCount = await EntrepreneurProfile.countDocuments({ verified: true });
    
    // Product sales stats
    const orders = await Order.find({ status: 'delivered' });
    const totalSalesVolume = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const orderCount = await Order.countDocuments();

    // Service request stats
    const totalRequests = await ServiceRequest.countDocuments();
    const completedRequests = await ServiceRequest.countDocuments({ status: 'completed' });
    const requestConversionRate = totalRequests > 0 ? Number(((completedRequests / totalRequests) * 100).toFixed(1)) : 0;

    // Average earnings
    const profiles = await EntrepreneurProfile.find({});
    const totalEarnings = profiles.reduce((sum, p) => sum + p.earnings, 0);
    const avgEarnings = profiles.length > 0 ? Number((totalEarnings / profiles.length).toFixed(2)) : 0;

    // Category breakdown
    const categories = ['Cobbler', 'Potter', 'Tailor', 'Artisan', 'Small Vendor', 'Other'];
    const categoryBreakdown = {};
    for (const cat of categories) {
      categoryBreakdown[cat] = await EntrepreneurProfile.countDocuments({ category: cat });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        customerCount,
        entrepreneurCount,
        verifiedCount,
        unverifiedCount: entrepreneurCount - verifiedCount,
        totalSalesVolume,
        orderCount,
        totalRequests,
        completedRequests,
        requestConversionRate,
        totalEarnings,
        avgEarnings,
        categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all entrepreneurs (verified and unverified)
// @route   GET /api/admin/entrepreneurs
// @access  Private (Admin only)
router.get('/entrepreneurs', protect, authorize('admin'), async (req, res) => {
  try {
    const profiles = await EntrepreneurProfile.find({})
      .populate('user', 'name email phone location')
      .sort({ verified: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: profiles.length,
      profiles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Verify/approve an entrepreneur
// @route   PUT /api/admin/entrepreneurs/:id/verify
// @access  Private (Admin only)
router.put('/entrepreneurs/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const { verified } = req.body; // boolean

    const profile = await EntrepreneurProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.verified = verified;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Entrepreneur profile has been ${verified ? 'verified' : 'unverified'}`,
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get recent activities (orders and requests combined)
// @route   GET /api/admin/activities
// @access  Private (Admin only)
router.get('/activities', protect, authorize('admin'), async (req, res) => {
  try {
    const recentRequests = await ServiceRequest.find()
      .populate('customer', 'name')
      .populate('entrepreneur', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentOrders = await Order.find()
      .populate('product', 'name')
      .populate('customer', 'name')
      .populate('entrepreneur', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      activities: {
        requests: recentRequests,
        orders: recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
