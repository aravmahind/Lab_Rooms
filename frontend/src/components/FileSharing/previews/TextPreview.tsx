import React, { useState, useEffect } from 'react';
import { FileType } from '../../../types/file';

interface TextPreviewProps {
  file: FileType;
}

export const TextPreview: React.FC<TextPreviewProps> = ({ file }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error('Failed to fetch file content');
        }
        const text = await response.text();
        setContent(text);
        setError(null);
      } catch (err) {
        console.error('Error fetching text content:', err);
        setError('Could not load file content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [file.url]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-500 mb-2">{error}</div>
        <a
          href={file.url}
          download
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download File
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
      <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[60vh]">
        {content}
      </pre>
    </div>
  );
};
