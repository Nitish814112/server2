require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');


const app = express();

const mongoUrl = process.env.MONGO_URL || 'mongodb+srv://n814112:root@cluster0.ckgvg.mongodb.net/';
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connectToDb() {
  try {
    await client.connect();
    db = client.db('JavaScript_Interview_Question');
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Make sure to stop the server if the connection fails
    process.exit(1);
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
    console.error('Error fetching data:', error.message); // More specific error message
    res.status(500).send({ error: `Failed to fetch data: ${error.message}` });
  }
});

const port = process.env.PORT || 4000;

// Start server only after the database connection is established
connectToDb().then(() => {
  app.listen(port, () => {
    console.log('Listening on port', port);
  });
}).catch(error => {
  console.error('Failed to connect to database:', error);
  process.exit(1); // Exit the process if the connection fails
});

module.exports = app;
