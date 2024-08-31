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
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  }
});

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(bodyParser.json()); // To parse JSON bodies
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

// Handle GET request for receiving messages
app.get('/receive', (req, res) => {
  // Logic to fetch messages from the server or database
  res.send({ messages: [] }); // Replace with actual messages if stored
});

// Handle POST request for sending messages
app.post('/send', (req, res) => {
  const { message } = req.body;

  // Emit the message to all clients
  io.emit('server message', message);

  // Respond to the client with a confirmation
  res.send({ success: true, message: 'Message sent to clients' });
});

// Set up Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
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
