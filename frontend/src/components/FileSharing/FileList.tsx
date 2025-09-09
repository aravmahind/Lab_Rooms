import React, { useEffect, useState } from 'react';
import { FileItem } from './FileItem';
import { FileUpload } from './FileUpload';
import { FileType } from '../../types/file';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { getRoomFiles, deleteFile as deleteFileService } from '../../services/fileService';

interface FileListProps {
  roomCode: string;
}

export const FileList: React.FC<FileListProps> = ({ roomCode }) => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();
  const { user } = useAuth();

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await getRoomFiles(roomCode);
      setFiles(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load files:', err);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();

    // Set up socket listeners
    const handleFileUploaded = (newFile: FileType) => {
      if (newFile.roomCode === roomCode) {
        setFiles(prev => [newFile, ...prev]);
      }
    };

    const handleFileDeleted = (deletedFileId: string) => {
      setFiles(prev => prev.filter(file => file._id !== deletedFileId));
    };

    if (socket) {
      socket.on('file_uploaded', handleFileUploaded);
      socket.on('file_deleted', handleFileDeleted);
    }

    return () => {
      if (socket) {
        socket.off('file_uploaded', handleFileUploaded);
        socket.off('file_deleted', handleFileDeleted);
      }
    };
  }, [roomCode, socket]);

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await deleteFileService(fileId, roomCode);
      // The socket event will handle the UI update
    } catch (err) {
      console.error('Failed to delete file:', err);
      alert('Failed to delete file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FileUpload roomCode={roomCode} />
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {files.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No files</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by uploading a file.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.map((file) => (
              <FileItem 
                key={file._id} 
                file={file} 
                currentUserId={user?._id} 
                onDelete={handleDeleteFile}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
