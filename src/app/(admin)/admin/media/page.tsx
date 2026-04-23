'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, X, CheckCircle, ImageIcon } from 'lucide-react';
import { authFetch } from '@/lib/api/auth-client';

interface SitePhoto {
  key: string;
  label: string;
  description: string;
  currentUrl: string;
  recommended: string;
}

const SITE_PHOTOS: SitePhoto[] = [
  {
    key: 'hero',
    label: 'Hero Background',
    description:
      'Main warehouse/supply chain image shown in the landing page hero section',
    currentUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
    recommended: '1600×900px, JPG',
  },
  {
    key: 'about',
    label: 'About / Process Image',
    description: 'Supporting image used in the How It Works or About section',
    currentUrl: '',
    recommended: '800×600px, JPG',
  },
  {
    key: 'payment',
    label: 'Payment Section Image',
    description: 'Image shown alongside the payment options section',
    currentUrl: '',
    recommended: '800×600px, JPG',
  },
];

export default function AdminMediaPage() {
  const [photos, setPhotos] = useState<Record<string, string>>(
    Object.fromEntries(SITE_PHOTOS.map((p) => [p.key, p.currentUrl]))
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(key);
    setError(null);
    setSuccess(null);

    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('folder', `smart-supply-sourcing/site/${key}`);

      const res = await authFetch('/api/upload/cloudinary', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (data.success) {
        const url =
          data.data.uploads[0]?.secure_url ||
          data.data.uploads[0]?.secureUrl ||
          '';
        setPhotos((prev) => ({ ...prev, [key]: url }));
        setSuccess(
          `${SITE_PHOTOS.find((p) => p.key === key)?.label} updated successfully!`
        );
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const handleRemove = (key: string) => {
    setPhotos((prev) => ({ ...prev, [key]: '' }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Site Media</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload and manage the static photos that appear across the website
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-5 flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-5 flex items-center gap-2 p-3 bg-[#e8f4f0] border border-[#b2d8cc] rounded-lg text-sm text-[#1a6b50] font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Photo cards */}
      <div className="space-y-6">
        {SITE_PHOTOS.map((photo) => {
          const currentUrl = photos[photo.key];
          const isUploading = uploading === photo.key;

          return (
            <div
              key={photo.key}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-base font-bold text-gray-900">
                  {photo.label}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {photo.description}
                </p>
              </div>

              <div className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                {/* Preview */}
                <div className="w-full sm:w-64 shrink-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                    Current Image
                  </p>
                  <div className="relative h-40 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    {currentUrl ? (
                      <>
                        <Image
                          src={currentUrl}
                          alt={photo.label}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          onClick={() => handleRemove(photo.key)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                        <p className="text-xs text-gray-400">No image set</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload */}
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                    Upload New Image
                  </p>
                  <label
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      isUploading
                        ? 'border-[#1a6b50] bg-[#e8f4f0]'
                        : 'border-gray-300 hover:border-[#1a6b50] hover:bg-[#f0faf6]'
                    }`}
                  >
                    <Upload
                      className={`w-7 h-7 mb-2 ${isUploading ? 'text-[#1a6b50]' : 'text-gray-400'}`}
                    />
                    <span className="text-sm font-medium text-gray-600">
                      {isUploading ? 'Uploading...' : 'Click to upload'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Recommended: {photo.recommended}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => handleUpload(photo.key, e)}
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
