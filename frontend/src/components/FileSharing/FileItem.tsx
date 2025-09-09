import React, { useState } from 'react';
import { FileType } from '../../types/file';
import { formatFileSize, formatDate } from '../../utils/fileUtils';
import { FilePreview } from './FilePreview';

interface FileItemProps {
  file: FileType;
  onDelete?: (fileId: string) => void;
  currentUserId: string;
}

export const FileItem: React.FC<FileItemProps> = ({ file, onDelete, currentUserId }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isOwner = file.uploader.id === currentUserId;

  const getFileIcon = () => {
    switch (file.fileType) {
      case 'image':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'document':
        return '📝';
      case 'text':
        return '📋';
      case 'archive':
        return '🗜️';
      default:
        return '📁';
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (['image', 'pdf', 'text'].includes(file.fileType)) {
      setIsPreviewOpen(true);
    } else {
      window.open(file.url, '_blank');
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(file._id);
    }
  };

  return (
    <>
      <div 
        className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        onClick={handlePreview}
      >
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl mr-4">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {file.filename}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatFileSize(file.size)}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(file.createdAt)}</span>
            <span className="mx-2">•</span>
            <span>Uploaded by {file.uploader.name}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href={file.url}
            download
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            title="Download"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
          {isOwner && onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isPreviewOpen && (
        <FilePreview 
          file={file} 
          onClose={() => setIsPreviewOpen(false)} 
        />
      )}
    </>
  );
};
