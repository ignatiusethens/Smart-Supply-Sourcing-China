'use client';

import React, { useState } from 'react';
import { SourcingRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

interface SourcingRequestDetailProps {
  request: SourcingRequest;
  onGenerateInvoice?: (request: SourcingRequest) => void;
  onUpdateStatus?: (status: string) => void;
}

export function SourcingRequestDetail({
  request,
  onGenerateInvoice,
  onUpdateStatus,
}: SourcingRequestDetailProps) {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const statusColors: Record<string, string> = {
    'submitted': 'bg-blue-100 text-blue-800',
    'under-review': 'bg-yellow-100 text-yellow-800',
    'quoted': 'bg-purple-100 text-purple-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      if (onGenerateInvoice) {
        onGenerateInvoice(request);
      }
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const downloadAttachment = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sourcing Request</h1>
          <p className="text-gray-600 mt-2">ID: {request.id}</p>
        </div>
        <Badge className={statusColors[request.status] || 'bg-gray-100 text-gray-800'}>
          {request.status.replace('-', ' ')}
        </Badge>
      </div>

      {/* Request Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Item Description</p>
            <p className="text-gray-900 font-medium">{request.itemDescription}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quantity</p>
            <p className="text-gray-900 font-medium">{request.quantity} units</p>
          </div>
        </div>

        {request.specifications && (
          <div>
            <p className="text-sm text-gray-600">Specifications</p>
            <p className="text-gray-900 font-medium">{request.specifications}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Target Price</p>
            <p className="text-gray-900 font-medium">
              {request.targetPrice ? formatCurrency(request.targetPrice) : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Delivery Location</p>
            <p className="text-gray-900 font-medium">{request.deliveryLocation}</p>
          </div>
        </div>

        {request.timeline && (
          <div>
            <p className="text-sm text-gray-600">Timeline</p>
            <p className="text-gray-900 font-medium">{request.timeline}</p>
          </div>
        )}

        {request.complianceRequirements && (
          <div>
            <p className="text-sm text-gray-600">Compliance Requirements</p>
            <p className="text-gray-900 font-medium">{request.complianceRequirements}</p>
          </div>
        )}
      </div>

      {/* Buyer Information */}
      {request.buyer && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Buyer Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-gray-900 font-medium">{request.buyer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900 font-medium">{request.buyer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900 font-medium">{request.buyer.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="text-gray-900 font-medium">{request.buyer.companyName || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attachments */}
      {request.attachments && request.attachments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Attachments</h2>

          <div className="space-y-2">
            {request.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  {attachment.fileType.startsWith('image') ? (
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-gray-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                    <p className="text-xs text-gray-600">
                      {(attachment.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadAttachment(attachment.cloudinaryUrl, attachment.fileName)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>

        <div className="space-y-3">
          <div className="flex gap-4">
            <div className="text-sm text-gray-600 w-32">Submitted</div>
            <div className="text-gray-900 font-medium">{formatDate(request.createdAt)}</div>
          </div>

          {request.status !== 'submitted' && (
            <div className="flex gap-4">
              <div className="text-sm text-gray-600 w-32">Status Updated</div>
              <div className="text-gray-900 font-medium">{formatDate(request.updatedAt)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Notes */}
      {request.adminNotes && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Admin Notes</h2>
          <p className="text-gray-900">{request.adminNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {request.status === 'submitted' && (
          <Button
            onClick={() => onUpdateStatus?.('under-review')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Mark as Under Review
          </Button>
        )}

        {request.status === 'under-review' && (
          <Button
            onClick={handleGenerateInvoice}
            disabled={isGeneratingInvoice}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGeneratingInvoice ? 'Generating...' : 'Generate Pro-Forma Invoice'}
          </Button>
        )}

        {request.status === 'quoted' && (
          <Button
            onClick={() => onUpdateStatus?.('accepted')}
            className="bg-green-600 hover:bg-green-700"
          >
            Mark as Accepted
          </Button>
        )}

        {(request.status === 'submitted' || request.status === 'under-review') && (
          <Button
            onClick={() => onUpdateStatus?.('rejected')}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Reject Request
          </Button>
        )}
      </div>
    </div>
  );
}
