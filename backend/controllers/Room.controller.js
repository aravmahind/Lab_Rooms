import Room from '../models/Room.model.js';
import File from '../models/File.model.js';
import ErrorResponse from '../utils/errorResponse.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';
import mongoose from 'mongoose';

export const getRooms = async (req, res, next) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    let query = Room.find(JSON.parse(queryStr));
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Room.countDocuments(JSON.parse(queryStr));
    query = query.skip(startIndex).limit(limit);
    const rooms = await query;
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }
    res.status(200).json({ success: true, count: rooms.length, pagination, data: rooms });
  } catch (err) {
    next(err);
  }
};

// Get single room by id
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('files')
      .populate('members.user')
      .populate('codeSnippets.createdBy')
      .populate('chatMessages.user');
    if (!room) {
      return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

// Get room by code
export const getRoomByCode = async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code }).populate('files');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new room (supports both advanced and simple logic)
export const createRoom = async (req, res, next) => {
  try {
    // If using auth, add admin and members
    if (req.user) {
      req.body.admin = req.user.id;
      req.body.members = [{ user: req.user.id, role: 'admin' }];
      const room = await Room.create(req.body);
      return res.status(201).json({ success: true, data: room });
    }
    // Otherwise, use simple logic
    const { roomName, hostName, expiry, password } = req.body;
    let code;
    let existing;
    do {
      code = generateRoomCode(6);
      existing = await Room.findOne({ code });
    } while (existing);
    let expiresAt = new Date();
    switch (expiry) {
      case '2h': expiresAt.setHours(expiresAt.getHours() + 2); break;
      case '1d': expiresAt.setDate(expiresAt.getDate() + 1); break;
      case '7d': expiresAt.setDate(expiresAt.getDate() + 7); break;
      case '1y': expiresAt.setFullYear(expiresAt.getFullYear() + 1); break;
      default: expiresAt.setHours(expiresAt.getHours() + 2);
    }
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
      members: [hostMember],
      messages: []
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

// Update room
export const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
    }
    if (room.admin && room.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this room`, 401));
    }
    room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

// Delete room
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
    }
    if (room.admin && room.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this room`, 401));
    }
    await room.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// Add member to room (by id or code)
export const addMember = async (req, res, next) => {
  try {
    const { userId, role = 'member' } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) {
      return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
    }
    if (room.admin && room.admin.toString() !== req.user.id) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to add members to this room`, 401));
    }
    const existingMemberIndex = room.members.findIndex(member => member.user && member.user.toString() === userId);
    if (existingMemberIndex >= 0) {
      return next(new ErrorResponse('User is already a member of this room', 400));
    }
    room.members.push({ user: userId, role });
    await room.save();
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

// Remove member from room
export const removeMember = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
    }
    if (room.admin && room.admin.toString() !== req.user.id) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to remove members from this room`, 401));
    }
    const memberIndex = room.members.findIndex(member => member.user && member.user.toString() === req.params.userId);
    if (memberIndex === -1) {
      return next(new ErrorResponse('User is not a member of this room', 400));
    }
    room.members.splice(memberIndex, 1);
    await room.save();
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

// Add code snippet to room
export const addCodeSnippet = async (req, res, next) => {
  try {
    const { title, code, language } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) {
      return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
    }
    const isMember = room.members.some(member => member.user && member.user.toString() === req.user.id);
    if (!isMember && room.admin && room.admin.toString() !== req.user.id) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to add code to this room`, 401));
    }
    const newSnippet = { title, code, language, createdBy: req.user.id };
    room.codeSnippets = room.codeSnippets || [];
    room.codeSnippets.unshift(newSnippet);
    await room.save();
    await room.populate('codeSnippets.createdBy', 'name email avatar').execPopulate();
    res.status(201).json({ success: true, data: room.codeSnippets[0] });
  } catch (err) {
    next(err);
  }
};

// Add chat message to room
export const addChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) {
      return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
    }
    const isMember = room.members.some(member => member.user && member.user.toString() === req.user.id);
    if (!isMember && room.admin && room.admin.toString() !== req.user.id) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to chat in this room`, 401));
    }
    const newMessage = { user: req.user.id, message };
    room.chatMessages = room.chatMessages || [];
    room.chatMessages.push(newMessage);
    await room.save();
    await room.populate('chatMessages.user', 'name email avatar').execPopulate();
    res.status(201).json({ success: true, data: room.chatMessages[room.chatMessages.length - 1] });
  } catch (err) {
    next(err);
  }
};

// Add file to room
export const addFileToRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { filename, url, fileType, mimeType, size, uploader, publicId } = req.body;
    if (!filename || !url || !fileType || !mimeType || !size || !uploader || !publicId) {
      return res.status(400).json({ error: 'Missing required file details' });
    }
    const file = new File({ filename, url, fileType, mimeType, size, uploader, publicId, room: roomId });
    await file.save();
    await Room.findByIdAndUpdate(roomId, { $push: { files: file._id } });
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get members of room
export const getMembersOfRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room.members });
  } catch (error) {
    console.error('Error getting room members:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse("Please upload a file", 400));
    }

    const room = await Room.findOne({ code: req.params.roomCode });
    if (!room) {
      return next(new ErrorResponse(`Room with code ${req.params.roomCode} not found`, 404));
    }

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "labrooms",
      resource_type: "auto", // auto-detects image, video, raw
    });

    // Save file to MongoDB
    const file = new File({
      filename: req.file.originalname,
      url: result.secure_url,          // ✅ Cloudinary hosted URL
      fileType: getFileType(req.file.mimetype),
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploader: {
        id: req.user ? req.user.id : "anonymous",
        name: req.user ? req.user.name : "Anonymous",
      },
      room: room._id,
      publicId: result.public_id,      // ✅ Cloudinary public ID
    });

    await file.save();

    // Link file to room
    room.files.push(file._id);
    await room.save();

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

// Save file metadata after frontend Cloudinary upload
export const saveFileMeta = async (req, res, next) => {
  try {
    const { filename, url, fileType, mimeType, size, uploader, publicId } = req.body;
    if (!filename || !url || !fileType || !mimeType || !size || !uploader || !publicId) {
      return res.status(400).json({ error: "Missing required file details" });
    }

    const room = await Room.findOne({ code: req.params.roomCode });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const file = await File.create({
      filename,
      url,
      fileType,
      mimeType,
      size,
      uploader,
      room: room._id,
      publicId,
    });

    room.files.push(file._id);
    await room.save();

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

// Get all files for a room
export const getRoomFiles = async (req, res, next) => {
  try {
    const room = await Room.findOne({ code: req.params.roomCode })
      .populate('files');
    
    if (!room) {
      return next(new ErrorResponse(`Room with code ${req.params.roomCode} not found`, 404));
    }

    res.status(200).json({ success: true, count: room.files.length, data: room.files });
  } catch (error) {
    next(error);
  }
};

// Delete a file
export const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return next(new ErrorResponse(`File not found with id ${req.params.fileId}`, 404));
    }

    // Check if user is authorized (room admin or file uploader)
    const room = await Room.findOne({ _id: file.room });
    const isAdmin = room.admin.toString() === req.user.id;
    const isOwner = file.uploader.id === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return next(new ErrorResponse('Not authorized to delete this file', 401));
    }

    // Remove file from room
    await Room.updateOne(
      { _id: file.room },
      { $pull: { files: file._id } }
    );

    // Delete file from storage (you'll need to implement this)
    // await deleteFromCloudinary(file.publicId);

    // Delete file document
    await file.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Helper function to determine file type from mime type
function getFileType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (
    mimeType === 'text/plain' || 
    mimeType === 'text/markdown' || 
    mimeType === 'text/x-python' || 
    mimeType === 'application/javascript' ||
    mimeType === 'text/css' ||
    mimeType === 'text/html'
  ) return 'text';
  if (
    mimeType === 'application/zip' || 
    mimeType === 'application/x-rar-compressed' || 
    mimeType === 'application/x-7z-compressed' ||
    mimeType === 'application/x-tar' ||
    mimeType === 'application/gzip'
  ) return 'archive';
  return 'document';
}

// Export all required functions with their aliases
export {
  addMember as addMemberToRoom,
  getRoom as getRoomById,
};