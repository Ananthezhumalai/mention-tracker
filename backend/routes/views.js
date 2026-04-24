const express = require('express');
const router = express.Router();
const SavedView = require('../models/SavedView');

// Get views for brand
router.get('/', async (req, res) => {
  try {
    const views = await SavedView.find({ brandId: req.query.brandId }).sort({ createdAt: -1 });
    res.json(views);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create view
router.post('/', async (req, res) => {
  try {
    const view = new SavedView(req.body);
    await view.save();
    res.status(201).json(view);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete view
router.delete('/:id', async (req, res) => {
  try {
    await SavedView.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
