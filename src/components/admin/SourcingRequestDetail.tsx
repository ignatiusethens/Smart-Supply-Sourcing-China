'use client';

import React, { useState } from 'react';
import { SourcingRequest } from '@/types';
import {
  Download,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  MessageSquare,
  XCircle,
  FileOutput,
} from 'lucide-react';
import Link from 'next/link';

interface SourcingRequestDetailProps {
  request: SourcingRequest;
  onGenerateInvoice?: (request: SourcingRequest) => void;
  onUpdateStatus?: (status: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800 border-blue-200',
  'under-review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  quoted: 'bg-purple-100 text-purple-800 border-purple-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

export function SourcingRequestDetail({
  request,
  onGenerateInvoice,
  onUpdateStatus,
}: SourcingRequestDetailProps) {
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const refCode = `SRC-${request.id.slice(-4).toUpperCase()}`;
  const statusLabel = request.status
    .replace('-', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await onUpdateStatus?.('under-review');
    setSavingNotes(false);
  };

  return (
    <div className="space-y-0">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Link href="/admin/sourcing" className="hover:text-blue-600">
          Sourcing Management
        </Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">Request Details</span>
      </div>

      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-gray-900">
              Request {refCode}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Submitted on {formatDate(request.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          {(request.status === 'submitted' ||
            request.status === 'under-review') && (
            <button
              onClick={() => onGenerateInvoice?.(request)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <FileOutput className="w-4 h-4" />
              Generate Pro-Forma
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Main content ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Requester Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
              Requester Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-sm">🏢</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Company
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {request.buyer?.companyName || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-sm">✉️</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Contact Email
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {request.buyer?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-sm">📞</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Phone Number
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {request.buyer?.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requested Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
              Requested Items
            </h2>
            <div className="space-y-4">
              {/* Parse items from itemDescription */}
              {request.itemDescription.split(', ').map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                    <span className="text-2xl opacity-40">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900">{item}</p>
                      <span className="text-xs font-mono text-gray-400 shrink-0">
                        ID: #ITEM-{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-400">Quantity</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {request.quantity} units
                        </p>
                      </div>
                      {request.targetPrice && (
                        <div>
                          <p className="text-xs text-gray-400">Target Price</p>
                          <p className="text-sm font-bold text-green-600">
                            KES {request.targetPrice.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Specs */}
            {request.specifications && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">
                  Specifications
                </p>
                <p className="text-sm text-blue-900 whitespace-pre-line">
                  {request.specifications}
                </p>
              </div>
            )}

            {/* Logistics */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {request.deliveryLocation && (
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">
                    Delivery Location
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {request.deliveryLocation}
                  </p>
                </div>
              )}
              {request.timeline && (
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Timeline</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {request.timeline}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
              Admin Internal Notes
            </h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about lead times, supplier availability, or special shipping requirements..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-4 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-60"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="space-y-5">
          {/* Request Summary */}
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-4">
              Request Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Items</span>
                <span className="text-sm font-bold text-white">
                  {request.itemDescription.split(', ').length} Varieties
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Combined Volume</span>
                <span className="text-sm font-bold text-white">
                  {request.quantity} Units
                </span>
              </div>
              {request.targetPrice && (
                <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                  <span className="text-sm text-gray-400">Estimated Value</span>
                  <span className="text-sm font-black text-green-400">
                    KES {request.targetPrice.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            {(request.status === 'submitted' ||
              request.status === 'under-review') && (
              <button
                onClick={() => onGenerateInvoice?.(request)}
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-900 bg-white hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FileOutput className="w-4 h-4" />
                Generate Pro-Forma
              </button>
            )}
          </div>

          {/* Attached Documents */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                Attached Documents
              </h3>
              <div className="space-y-2">
                {request.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {att.fileType.startsWith('image') ? (
                        <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {att.fileName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(att.fileSize / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <a
                      href={att.cloudinaryUrl}
                      download={att.fileName}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
              Actions
            </h3>
            <div className="space-y-2">
              {request.status === 'submitted' && (
                <button
                  onClick={() => onUpdateStatus?.('under-review')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Match to Existing Order
                </button>
              )}
              <button
                onClick={() => onUpdateStatus?.('under-review')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <MessageSquare className="w-4 h-4 text-gray-500" />
                Request More Info
              </button>
              {(request.status === 'submitted' ||
                request.status === 'under-review') && (
                <button
                  onClick={() => onUpdateStatus?.('rejected')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  Reject Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
