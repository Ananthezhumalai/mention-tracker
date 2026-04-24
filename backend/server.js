const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const brandRoutes = require('./routes/brands');
const mentionRoutes = require('./routes/mentions');
const viewRoutes = require('./routes/views');

app.use('/api/brands', brandRoutes);
app.use('/api/mentions', mentionRoutes);
app.use('/api/views', viewRoutes);

const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mentiontracker';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.log('Failed to connect to primary MongoDB, falling back to Memory Server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    MONGO_URI = mongoServer.getUri();
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Memory Server connected:', MONGO_URI);
    
    // Seed the memory database automatically since it's empty
    console.log('Seeding memory database...');
    const seed = require('./seed');
    await seed();
    console.log('Memory DB seeded');
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
