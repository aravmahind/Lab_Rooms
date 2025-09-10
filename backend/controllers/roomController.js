import Room from '../models/Room.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @access  Public
export const getRooms = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Room.find(JSON.parse(queryStr)).populate('admin', 'name email');

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Room.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const rooms = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: rooms.length,
      pagination,
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single room
// @route   GET /api/v1/rooms/:id
// @access  Public
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members.user', 'name email avatar')
      .populate('codeSnippets.createdBy', 'name email avatar')
      .populate('chatMessages.user', 'name email avatar');

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new room
// @route   POST /api/v1/rooms
// @access  Private
export const createRoom = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.admin = req.user.id;

    // Add the creator as the first member
    req.body.members = [
      {
        user: req.user.id,
        role: 'admin'
      }
    ];

    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update room
// @route   PUT /api/v1/rooms/:id
// @access  Private
export const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is room admin
    if (room.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this room`,
          401
        )
      );
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete room
// @route   DELETE /api/v1/rooms/:id
// @access  Private
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is room admin or admin
    if (room.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this room`,
          401
        )
      );
    }

    await room.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add member to room
// @route   PUT /api/v1/rooms/:id/members
// @access  Private
export const addMember = async (req, res, next) => {
  try {
    const { userId, role = 'member' } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is room admin
    if (room.admin.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add members to this room`,
          401
        )
      );
    }

    // Check if user is already a member
    const existingMemberIndex = room.members.findIndex(
      member => member.user.toString() === userId
    );

    if (existingMemberIndex >= 0) {
      return next(new ErrorResponse('User is already a member of this room', 400));
    }

    room.members.push({ user: userId, role });
    await room.save();

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove member from room
// @route   DELETE /api/v1/rooms/:id/members/:userId
// @access  Private
export const removeMember = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is room admin
    if (room.admin.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to remove members from this room`,
          401
        )
      );
    }

    // Check if user is a member
    const memberIndex = room.members.findIndex(
      member => member.user.toString() === req.params.userId
    );

    if (memberIndex === -1) {
      return next(new ErrorResponse('User is not a member of this room', 400));
    }

    // Remove member
    room.members.splice(memberIndex, 1);
    await room.save();

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add code snippet to room
// @route   POST /api/v1/rooms/:id/code
// @access  Private
export const addCodeSnippet = async (req, res, next) => {
  try {
    const { title, code, language } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if user is a member of the room
    const isMember = room.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember && room.admin.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add code to this room`,
          401
        )
      );
    }

    const newSnippet = {
      title,
      code,
      language,
      createdBy: req.user.id
    };

    room.codeSnippets.unshift(newSnippet);
    await room.save();

    // Populate the createdBy field before sending the response
    await room.populate('codeSnippets.createdBy', 'name email avatar').execPopulate();

    res.status(201).json({
      success: true,
      data: room.codeSnippets[0]
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add chat message to room
// @route   POST /api/v1/rooms/:id/chat
// @access  Private
export const addChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if user is a member of the room
    const isMember = room.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember && room.admin.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to chat in this room`,
          401
        )
      );
    }

    const newMessage = {
      user: req.user.id,
      message
    };

    room.chatMessages.push(newMessage);
    await room.save();

    // Populate the user field before sending the response
    await room.populate('chatMessages.user', 'name email avatar').execPopulate();

    res.status(201).json({
      success: true,
      data: room.chatMessages[room.chatMessages.length - 1]
    });
  } catch (err) {
    next(err);
  }
};
