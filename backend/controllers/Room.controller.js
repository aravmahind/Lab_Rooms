import Room from '../models/Room.model.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const { roomName, hostName, expiry } = req.body;
    
    let code;
    let existing;
    do {
      code = generateRoomCode(6);
      existing = await Room.findOne({ code });
    } while (existing);


    let expiresAt = new Date();
    if (expiry === '2h') expiresAt.setHours(expiresAt.getHours() + 2);
    else if (expiry === '1d') expiresAt.setDate(expiresAt.getDate() + 1);
    else if (expiry === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
    else if (expiry === '1y') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setHours(expiresAt.getHours() + 2); // default 2h

    const room = new Room({
      code,
      expiresAt,
      data: { roomName, hostName }
    });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};