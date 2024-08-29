const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');
let db;

async function connectToDb() {
  try {
    await client.connect();
    db = client.db('second_dataBase');
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

// app.use('/', (req, res) => {
//   res.send({ message: "Serving on local" });
// });

app.get('/data', async (req, res) => {
  try {
    let data = await db.collection('peaks').find({}).toArray();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch data' });
  }
});

const port = process.env.PORT || 4000;

connectToDb().then(() => {
  app.listen(port, () => {
    console.log('Listening on port', port);
  });
});
