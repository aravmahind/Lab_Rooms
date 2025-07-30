import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createRoom, getRooms, getRoomById, deleteRoom, getRoomByCode } from './controllers/Room.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.post('/rooms', createRoom);
app.get('/rooms', getRooms);
app.get('/rooms/code/:code', getRoomByCode);
app.get('/rooms/:id', getRoomById);
app.delete('/rooms/:id', deleteRoom);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});