import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../../services/fileService';
import { useAuth } from '../../contexts/AuthContext';

interface FileUploadProps {
  roomCode: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ roomCode }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      if (!user) {
        setError('You must be logged in to upload files');
        return;
      }

      const file = acceptedFiles[0];
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        await uploadFile(file, roomCode, (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        });
      } catch (err) {
        console.error('Upload error:', err);
        setError(
          err.response?.data?.message || 'Failed to upload file. Please try again.'
        );
      } finally {
        setIsUploading(false);
        // Reset progress after a short delay to show completion
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [roomCode, user]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: isUploading,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'application/x-tar': ['.tar'],
      'application/x-gzip': ['.gz'],
      'application/json': ['.json'],
      'text/css': ['.css'],
      'text/html': ['.html', '.htm'],
      'application/xml': ['.xml'],
      'text/yaml': ['.yaml', '.yml'],
      'application/javascript': ['.js'],
      'application/typescript': ['.ts'],
      'application/x-javascript': ['.jsx'],
      'application/x-typescript': ['.tsx'],
    },
  });

  return (
    <div className="mb-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        } ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className={`mx-auto h-12 w-12 ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm">
            {isUploading ? (
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  Uploading... {uploadProgress}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400">
                Drop the file here
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Upload a file
                </span>{' '}
                or drag and drop
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Supports images, documents, PDFs, text files, and more (max 50MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
