const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const ServiceRequest = require('../models/ServiceRequest');
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

// @desc    Place a new product order
// @route   POST /api/orders
// @access  Private (Customer only)
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { productId, quantity, shippingAddress } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Only ${product.stock} left.` });
    }

    // Decrement stock
    product.stock -= quantity;
    await product.save();

    const totalPrice = product.price * quantity;

    const order = await Order.create({
      product: productId,
      customer: req.user.id,
      entrepreneur: product.entrepreneur,
      quantity,
      totalPrice,
      shippingAddress
    });

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all orders for logged in user
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'entrepreneur') {
      query.entrepreneur = req.user.id;
    }

    const orders = await Order.find(query)
      .populate('product')
      .populate('customer', 'name phone email location')
      .populate('entrepreneur', 'name phone email location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product')
      .populate('customer', 'name phone email location')
      .populate('entrepreneur', 'name phone email location');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (
      order.customer._id.toString() !== req.user.id &&
      order.entrepreneur._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order status (shipped, delivered, cancelled)
// @route   PUT /api/orders/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = order.customer.toString() === req.user.id;
    const isEntrepreneur = order.entrepreneur.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isEntrepreneur && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    if (['shipped', 'delivered'].includes(status) && !isEntrepreneur && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the entrepreneur can update delivery/shipping status' });
    }

    if (status === 'cancelled') {
      // Return stock if cancelled
      if (order.status !== 'cancelled') {
        const product = await Product.findById(order.product);
        if (product) {
          product.stock += order.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    await order.save();

    // If order delivered, increment entrepreneur's earnings
    if (status === 'delivered') {
      await EntrepreneurProfile.findOneAndUpdate(
        { user: order.entrepreneur },
        { $inc: { earnings: order.totalPrice } }
      );
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Submit feedback/review for an order
// @route   POST /api/orders/:id/feedback
// @access  Private (Customer only)
router.post('/:id/feedback', protect, authorize('customer'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to leave feedback' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Can only leave feedback on delivered orders' });
    }

    order.feedback = { rating, comment };
    await order.save();

    // Update entrepreneur aggregate rating
    await updateEntrepreneurRating(order.entrepreneur);

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
