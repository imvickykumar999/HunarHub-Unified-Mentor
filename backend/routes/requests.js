const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const Order = require('../models/Order');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const { protect, authorize } = require('../middleware/auth');

// Helper function to update entrepreneur rating
async function updateEntrepreneurRating(entrepreneurId) {
  try {
    const requests = await ServiceRequest.find({
      entrepreneur: entrepreneurId,
      'feedback.rating': { $exists: true, $ne: null }
    });

    const orders = await Order.find({
      entrepreneur: entrepreneurId,
      'feedback.rating': { $exists: true, $ne: null }
    });

    let totalRating = 0;
    let count = 0;

    requests.forEach(r => {
      totalRating += r.feedback.rating;
      count++;
    });

    orders.forEach(o => {
      totalRating += o.feedback.rating;
      count++;
    });

    const average = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;

    await EntrepreneurProfile.findOneAndUpdate(
      { user: entrepreneurId },
      { 'rating.average': average, 'rating.count': count }
    );
  } catch (error) {
    console.error('Error updating entrepreneur rating:', error);
  }
}

// @desc    Place a new service request
// @route   POST /api/requests
// @access  Private (Customer only)
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { entrepreneurId, serviceType, description, proposedDate, proposedPrice, notes } = req.body;

    const request = await ServiceRequest.create({
      customer: req.user.id,
      entrepreneur: entrepreneurId,
      serviceType,
      description,
      proposedDate,
      proposedPrice,
      notes
    });

    res.status(201).json({
      success: true,
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all service requests for logged in user
// @route   GET /api/requests
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'entrepreneur') {
      query.entrepreneur = req.user.id;
    }
    // Admin can see everything if we want, or default query

    const requests = await ServiceRequest.find(query)
      .populate('customer', 'name phone email location')
      .populate('entrepreneur', 'name phone email location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single service request
// @route   GET /api/requests/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name phone email location')
      .populate('entrepreneur', 'name phone email location');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Verify user is part of the request
    if (
      request.customer._id.toString() !== req.user.id &&
      request.entrepreneur._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
    }

    res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update status of a service request (accept, reject, complete, cancel)
// @route   PUT /api/requests/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    let request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Validation rules
    const isCustomer = request.customer.toString() === req.user.id;
    const isEntrepreneur = request.entrepreneur.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isEntrepreneur && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to change this request' });
    }

    if (['accepted', 'rejected'].includes(status) && !isEntrepreneur && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the entrepreneur can accept or reject requests' });
    }

    if (status === 'cancelled' && !isCustomer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the customer can cancel requests' });
    }

    // If status is completed, the entrepreneur or customer can set it.
    if (status === 'completed' && !isEntrepreneur && !isCustomer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this request' });
    }

    request.status = status;
    await request.save();

    // If request completed and proposedPrice exists, increment entrepreneur's total earnings
    if (status === 'completed' && request.proposedPrice) {
      await EntrepreneurProfile.findOneAndUpdate(
        { user: request.entrepreneur },
        { $inc: { earnings: request.proposedPrice } }
      );
    }

    res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Submit feedback/review for a service request
// @route   POST /api/requests/:id/feedback
// @access  Private (Customer only)
router.post('/:id/feedback', protect, authorize('customer'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    let request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (request.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to leave feedback' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only leave feedback on completed services' });
    }

    request.feedback = { rating, comment };
    await request.save();

    // Update entrepreneur aggregate rating
    await updateEntrepreneurRating(request.entrepreneur);

    res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.updateEntrepreneurRating = updateEntrepreneurRating; // Export rating updater
