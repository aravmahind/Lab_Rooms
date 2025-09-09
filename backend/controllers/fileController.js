import cloudinary from 'cloudinary';
import ErrorResponse from '../utils/errorResponse.js';
import File from '../models/File.model.js';
import Room from '../models/Room.model.js';

// @desc    Upload file
// @route   POST /api/v1/rooms/:roomCode/files
// @access  Private
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.files || !req.files.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;
    const { roomCode } = req.params;
    const { user } = req;
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return next(new ErrorResponse('File size should be less than 50MB', 400));
    }

    // Check if room exists and user is a member
    const room = await Room.findOne({ 
      code: roomCode,
      'members.id': user.id 
    });

    if (!room) {
      return next(new ErrorResponse('Not authorized to upload to this room', 403));
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `labrooms/${roomCode}`,
      resource_type: 'auto'
    });

    // Determine file type
    const fileType = getFileType(file.mimetype, file.name);

    // Create file document
    const newFile = new File({
      filename: file.name,
      url: result.secure_url,
      fileType,
      mimeType: file.mimetype,
      size: file.size,
      uploader: {
        id: user.id,
        name: user.name || 'Anonymous'
      },
      roomCode,
      publicId: result.public_id
    });

    // Save file to database
    const savedFile = await newFile.save();

    // Add file reference to room
    room.files.push(savedFile._id);
    await room.save();

    // Emit socket event
    if (req.io) {
      req.io.to(roomCode).emit('file_uploaded', savedFile);
    }

    res.status(201).json({
      success: true,
      data: savedFile
    });
  } catch (err) {
    console.error('Upload Error:', err);
    next(new ErrorResponse('File upload failed', 500));
  }
};

// @desc    Get all files for a room
// @route   GET /api/v1/rooms/:roomCode/files
// @access  Private
export const getRoomFiles = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const { user } = req;

    // Check if room exists and user is a member
    const room = await Room.findOne({ 
      code: roomCode,
      'members.id': user.id 
    });

    if (!room) {
      return next(new ErrorResponse('Not authorized to view files in this room', 403));
    }

    // Get all files for the room, sorted by newest first
    const files = await File.find({ roomCode })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (err) {
    console.error('Get Files Error:', err);
    next(new ErrorResponse('Failed to get files', 500));
  }
};

// @desc    Delete a file
// @route   DELETE /api/v1/files/:fileId
// @access  Private
export const deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { user } = req;

    // Find the file
    const file = await File.findById(fileId);
    if (!file) {
      return next(new ErrorResponse('File not found', 404));
    }

    // Check if user is the uploader or room admin
    const room = await Room.findOne({ 
      code: file.roomCode,
      $or: [
        { 'members.id': user.id, 'members.isAdmin': true },
        { 'members.id': user.id, 'members.id': file.uploader.id }
      ]
    });

    if (!room) {
      return next(new ErrorResponse('Not authorized to delete this file', 403));
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.publicId);

    // Remove file reference from room
    room.files = room.files.filter(id => id.toString() !== fileId);
    await room.save();

    // Delete file document
    await File.findByIdAndDelete(fileId);

    // Emit socket event
    if (req.io) {
      req.io.to(file.roomCode).emit('file_deleted', fileId);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Delete File Error:', err);
    next(new ErrorResponse('Failed to delete file', 500));
  }
};

// Helper function to determine file type
function getFileType(mimeType, filename) {
  const extension = filename.split('.').pop().toLowerCase();
  
  // Images
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  
  // PDFs
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return 'pdf';
  }
  
  // Documents
  const documentTypes = [
    'doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'odp'
  ];
  if (documentTypes.includes(extension)) {
    return 'document';
  }
  
  // Text files
  if (mimeType.startsWith('text/') || 
      ['txt', 'js', 'jsx', 'ts', 'tsx', 'json', 'css', 'html', 'xml', 'yaml', 'yml'].includes(extension)) {
    return 'text';
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'archive';
  }
  
  return 'other';
}
