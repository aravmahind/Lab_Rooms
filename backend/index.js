import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createRoom, getRooms, getRoomById, deleteRoom, getRoomByCode, addMemberToRoom, getMembersOfRoom } from './controllers/Room.controller.js';
import Room from './models/Room.model.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Routes
app.post('/rooms', createRoom);
app.get('/rooms', getRooms);
app.get('/rooms/code/:code', getRoomByCode);
app.get('/rooms/:id', getRoomById);
app.delete('/rooms/:id', deleteRoom);

app.post('/rooms/:code/members', addMemberToRoom);
app.get('/rooms/:code/members', getMembersOfRoom);

// Create HTTP server and attach Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomCode, user }) => {
    socket.join(roomCode);
    console.log(`👤 ${user.name} joined room: ${roomCode}`);
  });

  // Send message
  socket.on('send-message', async ({ roomCode, message }) => {
    try {
      // Ensure message has an id and timestamp
      if (!message.id) message.id = new mongoose.Types.ObjectId().toString();
      if (!message.timestamp) message.timestamp = new Date();
      if (!message.type) message.type = 'message';

      // Save to MongoDB
      await Room.updateOne(
        { code: roomCode },
        { $push: { messages: message } }
      );

      // Broadcast to all clients in the room
      io.to(roomCode).emit('receive-message', message);
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
