require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3001", "https://crack-moto.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  }
});

app.use(cors({
  origin: ["http://localhost:3001", "https://crack-moto.vercel.app"],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoUrl = process.env.MONGO_URL || 'mongodb+srv://n814112:root@cluster0.ckgvg.mongodb.net/';
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

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

app.use(async (req, res, next) => {
  if (!db) {
    try {
      await connectToDb();
    } catch (error) {
      return res.status(500).send({ error: 'Failed to connect to the database' });
    }
  }
  next();
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

app.get('/receive', (req, res) => {
  res.send({ messages: [] });  // Placeholder, implement actual message retrieval if needed
});

app.post('/send', (req, res) => {
  const { message } = req.body;

  if (message) {
    io.emit('server message', message);
    res.send({ success: true, message: 'Message sent to clients' });
  } else {
    res.status(400).send({ error: 'Message content is required' });
  }
});

io.on('connection', (socket) => {
  console.log(`A user connected with ID: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected with ID: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error: ${error}`);
  });
});

const port = process.env.PORT || 4000;

connectToDb().then(() => {
  server.listen(port, () => {
    console.log('Listening on port', port);
  });
}).catch(error => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

module.exports = app;
