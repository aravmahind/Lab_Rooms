import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import errorHandler from './middleware/error.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import fileRoutes from './routes/files.js';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle code updates
  socket.on('codeUpdate', ({ roomId, code, userId }) => {
    socket.to(roomId).emit('codeUpdate', { code, userId });
  });

  // Handle chat messages
  socket.on('sendMessage', ({ roomId, message, user }) => {
    io.to(roomId).emit('message', { message, user });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File upload middleware
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/files', fileRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = httpServer.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
