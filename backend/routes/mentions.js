const express = require('express');
const router = express.Router();
const Mention = require('../models/Mention');
const { startOfDay, subDays, endOfDay } = require('date-fns');
const papaparse = require('papaparse');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// List mentions with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      brandId, page = 1, limit = 20, source, sentiment, tag, startDate, endDate, search 
    } = req.query;

    const query = { brandId };

    if (source) query.source = { $in: source.split(',') };
    if (sentiment) query.sentiment = { $in: sentiment.split(',') };
    if (tag) query.tags = { $in: tag.split(',') };
    
    if (startDate || endDate) {
      query.postedAt = {};
      if (startDate) query.postedAt.$gte = new Date(startDate);
      if (endDate) query.postedAt.$lte = new Date(endDate);
    }

    if (search) {
      query.body = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [mentions, total] = await Promise.all([
      Mention.find(query).sort({ postedAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Mention.countDocuments(query)
    ]);

    res.json({ mentions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { brandId } = req.query;
    
    const [total, sentimentCounts, sourceCounts, topTagsObj, recentMentions] = await Promise.all([
      Mention.countDocuments({ brandId }),
      Mention.aggregate([
        { $match: { brandId: new require('mongoose').Types.ObjectId(brandId) } },
        { $group: { _id: '$sentiment', count: { $sum: 1 } } }
      ]),
      Mention.aggregate([
        { $match: { brandId: new require('mongoose').Types.ObjectId(brandId) } },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Mention.aggregate([
        { $match: { brandId: new require('mongoose').Types.ObjectId(brandId) } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      // Last 30 days daily counts
      Mention.aggregate([
        { 
          $match: { 
            brandId: new require('mongoose').Types.ObjectId(brandId),
            postedAt: { $gte: subDays(startOfDay(new Date()), 30) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$postedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      total,
      sentimentCounts,
      sourceCounts,
      topTags: topTagsObj,
      recentDailyCounts: recentMentions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single create
router.post('/', async (req, res) => {
  try {
    const mention = new Mention(req.body);
    await mention.save();
    res.status(201).json(mention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Bulk ingest (JSON or CSV via upload)
router.post('/bulk', upload.single('file'), async (req, res) => {
  try {
    const { brandId } = req.body;
    let data = [];
    
    if (req.file) {
      if (req.file.originalname.endsWith('.csv')) {
        const csvString = req.file.buffer.toString();
        const parsed = papaparse.parse(csvString, { header: true });
        data = parsed.data;
      } else if (req.file.originalname.endsWith('.json')) {
        data = JSON.parse(req.file.buffer.toString());
      }
    } else if (req.body.mentions) {
      data = req.body.mentions;
    }

    let added = 0, skipped = 0, failed = 0;

    for (let item of data) {
      if (!item.postedAt) item.postedAt = new Date();
      if (item.tags && typeof item.tags === 'string') {
        item.tags = item.tags.split(',').map(t => t.trim()).filter(t => t);
      }
      
      try {
        const m = new Mention({ ...item, brandId });
        await m.save();
        added++;
      } catch (err) {
        if (err.code === 11000) {
          skipped++; // Duplicate
        } else {
          failed++;
        }
      }
    }

    res.json({ added, skipped, failed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update mention
router.put('/:id', async (req, res) => {
  try {
    const mention = await Mention.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(mention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete mention
router.delete('/:id', async (req, res) => {
  try {
    await Mention.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
