'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileIcon, Image as ImageIcon, File as FileDocIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAnnouncer } from '@/lib/hooks/useAccessibility';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  id: string;
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_MAX_FILES = 5;

export function FileUploader({
  onFilesSelected,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { announce } = useAnnouncer();

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    for (const file of files) {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        newErrors.push(`${file.name}: Invalid file type. Allowed: JPEG, PNG, PDF`);
        continue;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        newErrors.push(
          `${file.name}: File size exceeds ${maxSizeMB}MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
        );
        continue;
      }

      validFiles.push(file);
    }

    return { valid: validFiles, errors: newErrors };
  };

  const generatePreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      const errorMsg = `Maximum ${maxFiles} files allowed`;
      setErrors([errorMsg]);
      announce(errorMsg, 'assertive');
      return;
    }

    // Validate files
    const { valid, errors: validationErrors } = validateFiles(fileArray);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      announce(`${validationErrors.length} files failed validation`, 'assertive');
      return;
    }

    // Generate previews and add to uploaded files
    const newUploadedFiles: UploadedFile[] = [];

    for (const file of valid) {
      const preview = await generatePreview(file);
      newUploadedFiles.push({
        file,
        preview,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      });
    }

    const updatedFiles = [...uploadedFiles, ...newUploadedFiles];
    setUploadedFiles(updatedFiles);
    setErrors([]);

    // Announce success
    announce(
      `${valid.length} file${valid.length === 1 ? '' : 's'} uploaded successfully`,
      'polite'
    );

    // Call callback with all files
    onFilesSelected(updatedFiles.map(uf => uf.file));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveFile = (id: string) => {
    const fileToRemove = uploadedFiles.find(uf => uf.id === id);
    const updatedFiles = uploadedFiles.filter(uf => uf.id !== id);
    setUploadedFiles(updatedFiles);
    onFilesSelected(updatedFiles.map(uf => uf.file));

    if (fileToRemove) {
      announce(`Removed ${fileToRemove.file.name}`, 'polite');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
    }
    return <FileDocIcon className="h-4 w-4" aria-hidden="true" />;
  };

  const getFileTypeLabel = (type: string): string => {
    if (type === 'image/jpeg') return 'JPEG';
    if (type === 'image/png') return 'PNG';
    if (type === 'application/pdf') return 'PDF';
    return 'File';
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload area. Press Enter or Space to browse files, or drag and drop files here."
        aria-describedby="upload-instructions"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          aria-describedby="upload-instructions"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload 
            className="h-8 w-8 text-slate-400" 
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              Drag and drop files here
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded"
                aria-label="Click to browse and select files"
              >
                click to browse
              </button>
            </p>
          </div>
          <p 
            id="upload-instructions"
            className="text-xs text-slate-500 dark:text-slate-400 mt-2"
          >
            Supported formats: JPEG, PNG, PDF • Max size: {maxSizeMB}MB • Max files: {maxFiles}
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card 
          className="border-red-200 bg-red-50 dark:bg-red-900/20"
          role="alert"
          aria-live="polite"
        >
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Upload Errors:
              </h3>
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700 dark:text-red-300">
                  • {error}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </p>

          <div 
            className="space-y-2"
            role="list"
            aria-label="Uploaded files list"
          >
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                role="listitem"
              >
                {/* Preview or Icon */}
                <div className="flex-shrink-0">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={`Preview of ${uploadedFile.file.name}`}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div 
                      className="h-12 w-12 flex items-center justify-center bg-slate-200 dark:bg-slate-800 rounded"
                      role="img"
                      aria-label={`${getFileTypeLabel(uploadedFile.file.type)} file icon`}
                    >
                      {getFileIcon(uploadedFile.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span>{getFileTypeLabel(uploadedFile.file.type)}</span>
                    <span aria-hidden="true">•</span>
                    <span>{(uploadedFile.file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(uploadedFile.id)}
                  disabled={disabled}
                  className="p-1 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Remove ${uploadedFile.file.name} file`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
