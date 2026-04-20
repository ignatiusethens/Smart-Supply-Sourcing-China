'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ZoomIn, Download } from 'lucide-react';
import { PaymentProof } from '@/types';

interface VerificationGalleryProps {
  proofs: PaymentProof[];
  isLoading?: boolean;
}

export function VerificationGallery({ proofs, isLoading = false }: VerificationGalleryProps) {
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const isImage = (proof: PaymentProof) => {
    return proof.fileType.startsWith('image/');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = (proof: PaymentProof) => {
    const link = document.createElement('a');
    link.href = proof.cloudinaryUrl;
    link.download = proof.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200"
        role="status"
        aria-label="Loading payment proofs"
      >
        <div className="text-gray-500">Loading proofs...</div>
      </div>
    );
  }

  if (proofs.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200"
        role="status"
        aria-label="No payment proofs available"
      >
        <div className="text-center">
          <div className="text-gray-500 mb-2">No payment proofs uploaded</div>
          <div className="text-sm text-gray-400">Payment proofs will appear here once uploaded</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gallery Grid */}
      <div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Payment proof gallery"
      >
        {proofs.map((proof) => (
          <button
            key={proof.id}
            className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            onClick={() => setSelectedProof(proof)}
            aria-label={`View ${proof.fileName} in detail`}
          >
            {isImage(proof) ? (
              <div className="relative w-full h-32 bg-gray-100">
                <Image
                  src={proof.cloudinaryUrl}
                  alt={`Payment proof: ${proof.fileName}`}
                  fill
                  className="object-cover group-hover:opacity-75 transition-opacity"
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2" aria-hidden="true">📄</div>
                  <div className="text-xs text-gray-600 truncate px-2">{proof.fileName}</div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <Badge 
              className="absolute top-2 right-2 bg-blue-600 text-white"
              aria-label={`File type: ${proof.fileType.split('/')[1]}`}
            >
              {proof.fileType.split('/')[1].toUpperCase()}
            </Badge>
          </button>
        ))}
      </div>

      {/* Proof List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-gray-700">Uploaded Files</h3>
        <div 
          className="space-y-2"
          role="list"
          aria-label="List of uploaded payment proof files"
        >
          {proofs.map((proof) => (
            <div
              key={proof.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              role="listitem"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">{proof.fileName}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatFileSize(proof.fileSize)} • {new Date(proof.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProof(proof)}
                  className="text-blue-600 hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label={`View ${proof.fileName} in detail`}
                >
                  <ZoomIn className="w-4 h-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(proof)}
                  className="text-gray-600 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label={`Download ${proof.fileName}`}
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom Modal */}
      {selectedProof && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h3 
                  id="modal-title"
                  className="font-semibold text-gray-900"
                >
                  {selectedProof.fileName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(selectedProof.fileSize)} • {new Date(selectedProof.uploadedAt).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProof(null)}
                className="text-gray-500 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {isImage(selectedProof) ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ maxHeight: '60vh' }}>
                    <Image
                      src={selectedProof.cloudinaryUrl}
                      alt={selectedProof.fileName}
                      width={800}
                      height={600}
                      className="object-contain"
                      style={{ transform: `scale(${zoomLevel / 100})` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                      className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      aria-label="Zoom out image"
                    >
                      Zoom Out
                    </Button>
                    <div 
                      className="flex-1 text-center text-sm text-gray-600"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {zoomLevel}%
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                      className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      aria-label="Zoom in image"
                    >
                      Zoom In
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(100)}
                      className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      aria-label="Reset zoom to 100%"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="text-6xl">📄</div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{selectedProof.fileName}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This file cannot be previewed in the browser
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownload(selectedProof)}
                    className="gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    aria-label={`Download ${selectedProof.fileName}`}
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Download File
                  </Button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => handleDownload(selectedProof)}
                className="gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label={`Download ${selectedProof.fileName}`}
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedProof(null)}
                className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label="Close modal"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
