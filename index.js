require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');


const app = express();
app.use(cors());

const client = new MongoClient(process.env.MONGO_URL || 'mongodb+srv://n814112:root@cluster0.ckgvg.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connectToDb() {
  try {
    await client.connect();
    db = client.db('JavaScript_Interview_Question');
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

app.get('/', (req, res) => {
  res.send({ message: "Serving on local" });
});

app.get('/datata', async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    let data = await db.collection('Mock_Question').find({}).toArray();
    res.status(200).send(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send({ error: 'Failed to fetch data' });
  }
});

const port = process.env.PORT || 4000;

connectToDb().then(() => {
  app.listen(port, () => {
    console.log('Listening on port', port);
  });
}).catch(error => {
  console.error('Failed to connect to database:', error);
});

// Export the app for serverless deployment
module.exports = app;
