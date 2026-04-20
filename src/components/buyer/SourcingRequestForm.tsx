'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FileUploader } from './FileUploader';
import { SourcingRequest } from '@/types';

interface SourcingRequestFormProps {
  buyerId: string;
  onSuccess?: (request: SourcingRequest) => void;
  onError?: (error: string) => void;
}

export function SourcingRequestForm({ buyerId, onSuccess, onError }: SourcingRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    itemDescription: '',
    specifications: '',
    quantity: '',
    targetPrice: '',
    deliveryLocation: '',
    timeline: '',
    complianceRequirements: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.itemDescription.trim() || !formData.quantity || !formData.deliveryLocation.trim()) {
        onError?.('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Create FormData for multipart upload
      const submitFormData = new FormData();
      submitFormData.append('buyerId', buyerId);
      submitFormData.append('itemDescription', formData.itemDescription);
      submitFormData.append('specifications', formData.specifications);
      submitFormData.append('quantity', formData.quantity);
      submitFormData.append('targetPrice', formData.targetPrice);
      submitFormData.append('deliveryLocation', formData.deliveryLocation);
      submitFormData.append('timeline', formData.timeline);
      submitFormData.append('complianceRequirements', formData.complianceRequirements);

      // Add files
      uploadedFiles.forEach((file) => {
        submitFormData.append('attachments', file);
      });

      const response = await fetch('/api/sourcing/requests', {
        method: 'POST',
        body: submitFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sourcing request');
      }

      const result = await response.json();
      onSuccess?.(result.data);

      // Reset form
      setFormData({
        itemDescription: '',
        specifications: '',
        quantity: '',
        targetPrice: '',
        deliveryLocation: '',
        timeline: '',
        complianceRequirements: '',
      });
      setUploadedFiles([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create sourcing request';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded">
        Request Custom Sourcing
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Description */}
        <div>
          <label 
            htmlFor="itemDescription"
            className="block text-sm font-medium mb-2"
          >
            Item Description <span aria-label="required" className="text-red-500">*</span>
          </label>
          <textarea
            id="itemDescription"
            name="itemDescription"
            value={formData.itemDescription}
            onChange={handleInputChange}
            placeholder="Describe the item you need to source"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
            rows={4}
            required
            aria-required="true"
            aria-describedby="itemDescription-help"
          />
          <p id="itemDescription-help" className="text-xs text-gray-500 mt-1">
            Provide detailed information about the item you need
          </p>
        </div>

        {/* Specifications */}
        <div>
          <label 
            htmlFor="specifications"
            className="block text-sm font-medium mb-2"
          >
            Specifications
          </label>
          <textarea
            id="specifications"
            name="specifications"
            value={formData.specifications}
            onChange={handleInputChange}
            placeholder="Technical specifications and requirements"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
            rows={3}
            aria-describedby="specifications-help"
          />
          <p id="specifications-help" className="text-xs text-gray-500 mt-1">
            Include technical details, dimensions, materials, etc.
          </p>
        </div>

        {/* Quantity */}
        <div>
          <label 
            htmlFor="quantity"
            className="block text-sm font-medium mb-2"
          >
            Quantity <span aria-label="required" className="text-red-500">*</span>
          </label>
          <Input
            id="quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="Enter quantity"
            min="1"
            required
            aria-required="true"
            aria-describedby="quantity-help"
            className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          />
          <p id="quantity-help" className="text-xs text-gray-500 mt-1">
            Number of units needed
          </p>
        </div>

        {/* Target Price */}
        <div>
          <label 
            htmlFor="targetPrice"
            className="block text-sm font-medium mb-2"
          >
            Target Price (KES)
          </label>
          <Input
            id="targetPrice"
            type="number"
            name="targetPrice"
            value={formData.targetPrice}
            onChange={handleInputChange}
            placeholder="Enter target price"
            min="0"
            step="0.01"
            aria-describedby="targetPrice-help"
            className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          />
          <p id="targetPrice-help" className="text-xs text-gray-500 mt-1">
            Your budget estimate (optional)
          </p>
        </div>

        {/* Delivery Location */}
        <div>
          <label 
            htmlFor="deliveryLocation"
            className="block text-sm font-medium mb-2"
          >
            Delivery Location <span aria-label="required" className="text-red-500">*</span>
          </label>
          <Input
            id="deliveryLocation"
            type="text"
            name="deliveryLocation"
            value={formData.deliveryLocation}
            onChange={handleInputChange}
            placeholder="Enter delivery location"
            required
            aria-required="true"
            aria-describedby="deliveryLocation-help"
            className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          />
          <p id="deliveryLocation-help" className="text-xs text-gray-500 mt-1">
            City or specific address for delivery
          </p>
        </div>

        {/* Timeline */}
        <div>
          <label 
            htmlFor="timeline"
            className="block text-sm font-medium mb-2"
          >
            Timeline
          </label>
          <Input
            id="timeline"
            type="text"
            name="timeline"
            value={formData.timeline}
            onChange={handleInputChange}
            placeholder="e.g., 2 weeks, ASAP"
            aria-describedby="timeline-help"
            className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          />
          <p id="timeline-help" className="text-xs text-gray-500 mt-1">
            When do you need the items?
          </p>
        </div>

        {/* Compliance Requirements */}
        <div>
          <label 
            htmlFor="complianceRequirements"
            className="block text-sm font-medium mb-2"
          >
            Compliance Requirements
          </label>
          <textarea
            id="complianceRequirements"
            name="complianceRequirements"
            value={formData.complianceRequirements}
            onChange={handleInputChange}
            placeholder="Certifications, standards, or compliance requirements"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
            rows={3}
            aria-describedby="complianceRequirements-help"
          />
          <p id="complianceRequirements-help" className="text-xs text-gray-500 mt-1">
            Any certifications or standards required
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label 
            htmlFor="file-upload"
            className="block text-sm font-medium mb-2"
          >
            Reference Photos & Documents
          </label>
          <FileUploader
            onFilesSelected={handleFilesSelected}
            maxFiles={5}
            maxSizeMB={5}
            acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
          />
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Uploaded Files:</p>
              <ul className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            aria-label={isLoading ? 'Submitting sourcing request' : 'Submit sourcing request'}
          >
            {isLoading ? 'Submitting...' : 'Submit Sourcing Request'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
