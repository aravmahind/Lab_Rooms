import React from 'react';
import type { FileType } from '../../../types/file';

interface ImagePreviewProps {
  file: FileType;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ file }) => {
  return (
    <div className="flex justify-center">
      <img 
        src={file.url} 
        alt={file.filename} 
        className="max-h-[70vh] max-w-full object-contain"
        onError={(e) => {
          // Fallback to a simple div with file info if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const container = target.parentElement;
          if (container) {
            container.innerHTML = `
              <div class="text-center p-4">
                <div class="text-4xl mb-2">🖼️</div>
                <p class="text-sm text-gray-500">Could not load image preview</p>
                <a 
                  href="${file.url}" 
                  download
                  class="mt-2 inline-block text-sm text-blue-600 hover:underline"
                >
                  Download Image
                </a>
              </div>
            `;
          }
        }}
      />
    </div>
  );
};
