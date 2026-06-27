const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all verified entrepreneur profiles (with searching & filtering)
// @route   GET /api/profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, location, search } = req.query;
    let query = { verified: true }; // Only show verified by default

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Database lookup variables
    let matchingUserIds = [];
    let userFilter = { role: 'entrepreneur' };

    if (location) {
      userFilter.location = new RegExp(location, 'i');
    }

    if (search) {
      userFilter.$or = [
        { name: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    // Find users matching search/location criteria first
    const users = await User.find(userFilter).select('_id');
    matchingUserIds = users.map(u => u._id);

    if (location || search) {
      query.user = { $in: matchingUserIds };
    }

    // If search is active, we also search businessName or skills in the profile itself
    if (search && !location) {
      delete query.user; // Overwrite user limitation to search either user or profile
      query.$or = [
        { user: { $in: matchingUserIds } },
        { businessName: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { category: new RegExp(search, 'i') }
      ];
    }

    const profiles = await EntrepreneurProfile.find(query)
      .populate('user', 'name email phone location')
      .sort({ 'rating.average': -1 });

    res.status(200).json({
      success: true,
      count: profiles.length,
      profiles
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current entrepreneur profile
// @route   GET /api/profiles/me
// @access  Private (Entrepreneur only)
router.get('/me', protect, authorize('entrepreneur'), async (req, res) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.user.id })
      .populate('user', 'name email phone location');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get entrepreneur profile by user ID
// @route   GET /api/profiles/:userId
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const profile = await EntrepreneurProfile.findOne({ user: req.params.userId })
      .populate('user', 'name email phone location');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update current entrepreneur profile
// @route   PUT /api/profiles/me
// @access  Private (Entrepreneur only)
router.put('/me', protect, authorize('entrepreneur'), async (req, res) => {
  try {
    const { businessName, bio, category, skills, experience, pricingDetails, isAvailable, location, phone } = req.body;

    // Find the profile
    let profile = await EntrepreneurProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Update profile fields
    profile.businessName = businessName !== undefined ? businessName : profile.businessName;
    profile.bio = bio !== undefined ? bio : profile.bio;
    profile.category = category !== undefined ? category : profile.category;
    profile.skills = skills !== undefined ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : profile.skills;
    profile.experience = experience !== undefined ? experience : profile.experience;
    profile.pricingDetails = pricingDetails !== undefined ? pricingDetails : profile.pricingDetails;
    profile.isAvailable = isAvailable !== undefined ? isAvailable : profile.isAvailable;
    profile.updatedAt = Date.now();

    await profile.save();

    // Update user fields (location, phone) if provided
    const userUpdate = {};
    if (location !== undefined) userUpdate.location = location;
    if (phone !== undefined) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdate);
    }

    // Reload profile with populated user
    const updatedProfile = await EntrepreneurProfile.findOne({ user: req.user.id })
      .populate('user', 'name email phone location');

    res.status(200).json({
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
