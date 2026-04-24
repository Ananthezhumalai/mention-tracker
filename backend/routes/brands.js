const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Mention = require('../models/Mention');

// Get all brands with mention counts
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({}).lean();
    for (let brand of brands) {
      brand.mentionsCount = await Mention.countDocuments({ brandId: brand._id });
    }
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create brand
router.post('/', async (req, res) => {
  try {
    const brand = new Brand(req.body);
    await brand.save();
    res.status(201).json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update brand
router.put('/:id', async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete brand
router.delete('/:id', async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    await Mention.deleteMany({ brandId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
