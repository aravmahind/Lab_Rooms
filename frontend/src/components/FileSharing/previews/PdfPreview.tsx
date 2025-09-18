import React, { useState, useEffect } from 'react';
//import { Document, Page, pdfjs } from 'react-pdf';
import type { FileType } from '../../../types/file';

// // Set up PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfPreviewProps {
  file: FileType;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ file }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF preview');
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      if (newPageNumber < 1 || (numPages && newPageNumber > numPages)) {
        return prevPageNumber;
      }
      return newPageNumber;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {file.filename}
        </p>
        <p className="text-red-500 mb-4">{error}</p>
        <a
          href={file.url}
          download
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download PDF
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="border rounded overflow-hidden mb-4">
        {/* <Document
          file={file.url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          }
        > */}
          {/* <Page 
            pageNumber={pageNumber} 
            width={800}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document> */}
      </div>

      {numPages && (
        <div className="flex items-center justify-between w-full max-w-2xl px-4">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={previousPage}
            className={`px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 ${
              pageNumber <= 1 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            Page {pageNumber} of {numPages}
          </span>
          <button
            type="button"
            disabled={!!(numPages && pageNumber >= numPages)}
            onClick={nextPage}
            className={`px-4 py-2 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 ${
              numPages && pageNumber >= numPages
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
