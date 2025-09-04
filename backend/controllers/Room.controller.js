import Room from '../models/Room.model.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';
import mongoose from 'mongoose';

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const { roomName, hostName, expiry, password } = req.body;

    // Generate unique room code
    let code;
    let existing;
    do {
      code = generateRoomCode(6);
      existing = await Room.findOne({ code });
    } while (existing);

    // Set expiry time
    let expiresAt = new Date();
    switch (expiry) {
      case '2h':
        expiresAt.setHours(expiresAt.getHours() + 2);
        break;
      case '1d':
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case '7d':
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      case '1y':
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        break;
      default:
        expiresAt.setHours(expiresAt.getHours() + 2); // default 2h
    }

    // Add host as first member
    const hostMember = {
      id: new mongoose.Types.ObjectId().toString(),
      name: hostName,
      isOnline: true,
      joinedAt: new Date()
    };

    const room = new Room({
      code,
      name: roomName,
      createdAt: new Date(),
      expiresAt,
      password: password || null,
      data: { roomName, hostName },
      members: [hostMember],   // 👈 host added here
      messages: []             // start empty
    });

    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add member to a room by code
export const addMemberToRoom = async (req, res) => {
  try {
    const { code } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Member name is required' });
    }

    // always uppercase code
    const room = await Room.findOne({ code: code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // fallback to [] if somehow not set
    if (!room.members) room.members = [];

    const newMember = {
      id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      isOnline: true,
      joinedAt: new Date()
    };

    const exists = room.members.find(
      (m) => m.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (!exists) {
      room.members.push(newMember);
      await room.save();
    }

    res.status(200).json({ message: 'Member added', room });
  } catch (error) {
    console.error('❌ Error adding member:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all members of a room
export const getMembersOfRoom = async (req, res) => {
  try {
    const { code } = req.params;

    const room = await Room.findOne({ code: code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(200).json(room.members);
  } catch (error) {
    console.error("❌ Error fetching members:", error);
    res.status(500).json({ error: error.message });
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


export const getRoomByCode = async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });
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