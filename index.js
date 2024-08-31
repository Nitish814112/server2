require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());

const mongoUrl = process.env.MONGO_URL || 'mongodb+srv://n814112:root@cluster0.ckgvg.mongodb.net/';
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

// Function to connect to the database
async function connectToDb() {
  if (!db) {
    try {
      await client.connect();
      db = client.db('JavaScript_Interview_Question');
      console.log('Connected to MongoDB successfully!');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
}

// Middleware to ensure DB connection is available
app.use(async (req, res, next) => {
  try {
    if (!db) {
      await connectToDb();
    }
    next();
  } catch (error) {
    res.status(500).send({ error: 'Failed to connect to the database' });
  }
});

app.get('/', (req, res) => {
  res.send({ message: "Serving on local" });
});

app.get('/datata', async (req, res) => {
  try {
    let data = await db.collection('Mock_Question').find({}).toArray();
    res.status(200).send(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send({ error: `Failed to fetch data: ${error.message}` });
  }
});

app.get('/data', async (req, res) => {
  try {
    let data = await db.collection('Coding_Questions').find({}).toArray();
    res.status(200).send(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send({ error: `Failed to fetch data: ${error.message}` });
  }
});

const port = process.env.PORT || 4000;

// Start the server only after the initial database connection attempt
connectToDb().then(() => {
  app.listen(port, () => {
    console.log('Listening on port', port);
  });
}).catch(error => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

module.exports = app;
