const mongoose = require('mongoose');
const { subDays, startOfDay } = require('date-fns');

const Brand = require('./models/Brand');
const Mention = require('./models/Mention');
const SavedView = require('./models/SavedView');

const SOURCES = ['twitter', 'instagram', 'reddit', 'news'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];
const TAGS = ['support', 'pricing', 'feature-request', 'praise', 'bug', 'general'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTags() {
  const t = [];
  const count = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < count; i++) {
    const r = randomChoice(TAGS);
    if (!t.includes(r)) t.push(r);
  }
  return t;
}

async function seed() {
  console.log('Clearing existing data...');
  await Promise.all([Brand.deleteMany({}), Mention.deleteMany({}), SavedView.deleteMany({})]);

  const brandsData = [
    { name: 'Acme Corp', keywords: ['acme', 'acmecorp', 'acme support'] },
    { name: 'Globex', keywords: ['globex', 'globex tools'] },
    { name: 'Initech', keywords: ['initech software'] },
  ];

  const brands = await Brand.insertMany(brandsData);
  console.log('Brands added:', brands.map(b => b.name).join(', '));

  let mentions = [];
  for (let b of brands) {
    const numMentions = 1000 + Math.floor(Math.random() * 500); // 1000 to 1500 per brand
    for (let i = 0; i < numMentions; i++) {
        const date = subDays(new Date(), Math.floor(Math.random() * 30));
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        mentions.push({
            brandId: b._id,
            source: randomChoice(SOURCES),
            author: `user_${Math.floor(Math.random() * 10000)}`,
            body: `This is a sample mention for ${b.name} which includes some generic text about ${randomChoice(b.keywords)}. I think it is ${randomChoice(['great', 'okay', 'terrible'])}.`,
            url: `https://example.com/post/${Math.floor(Math.random() * 10000000)}`,
            externalId: `ext_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
            postedAt: date,
            sentiment: randomChoice(SENTIMENTS),
            tags: randomTags()
        });
    }
  }

  await Mention.insertMany(mentions);
  console.log(`Added ${mentions.length} mentions.`);
}

module.exports = seed;

// If run directly
if (require.main === module) {
  require('dotenv').config();
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mentiontracker';
  mongoose.connect(MONGO_URI).then(() => seed()).then(() => process.exit()).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
