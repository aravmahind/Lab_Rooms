import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['image', 'document', 'pdf', 'text', 'archive', 'other']
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploader: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  roomCode: {
    type: String,
    required: true,
    ref: 'Room'
  },
  publicId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
fileSchema.index({ roomCode: 1, createdAt: -1 });

const File = mongoose.model('File', fileSchema);
export default File;
