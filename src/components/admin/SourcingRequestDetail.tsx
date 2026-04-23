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
  ChevronRight,
  Clock,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SourcingRequestDetailProps {
  request: SourcingRequest;
  onGenerateInvoice?: (request: SourcingRequest) => void;
  onUpdateStatus?: (status: string, notes?: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800 border-blue-200',
  'under-review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  quoted: 'bg-purple-100 text-purple-800 border-purple-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: FileText },
  { key: 'under-review', label: 'Under Review', icon: Eye },
  { key: 'quoted', label: 'Quoted', icon: FileOutput },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle },
];

export function SourcingRequestDetail({
  request,
  onGenerateInvoice,
  onUpdateStatus,
}: SourcingRequestDetailProps) {
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false);
  const [moreInfoMessage, setMoreInfoMessage] = useState('');
  const [sendingMoreInfo, setSendingMoreInfo] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const refCode = `SRC-${request.id.slice(-4).toUpperCase()}`;
  const statusLabel = request.status
    .replace('-', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const currentStepIdx = STATUS_STEPS.findIndex(
    (s) => s.key === request.status
  );

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
    await onUpdateStatus?.('under-review', adminNotes);
    setSavingNotes(false);
    setActionSuccess('Notes saved and status updated to Under Review');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleMarkUnderReview = async () => {
    await onUpdateStatus?.('under-review');
    setActionSuccess('Status updated to Under Review');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleRequestMoreInfo = async () => {
    if (!moreInfoMessage.trim()) return;
    setSendingMoreInfo(true);
    // Send email to buyer via API
    try {
      await fetch('/api/sourcing/request-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          buyerEmail: request.buyer?.email,
          buyerName: request.buyer?.name,
          message: moreInfoMessage,
          itemDescription: request.itemDescription,
        }),
      });
      await onUpdateStatus?.('under-review');
      setShowMoreInfoModal(false);
      setMoreInfoMessage('');
      setActionSuccess(
        'Message sent to buyer and status updated to Under Review'
      );
      setTimeout(() => setActionSuccess(''), 4000);
    } catch {
      // ignore
    } finally {
      setSendingMoreInfo(false);
    }
  };

  return (
    <div className="space-y-0">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Link href="/admin/sourcing" className="hover:text-blue-600">
          Sourcing Management
        </Link>
        <ChevronRight className="w-3 h-3" />
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

      {/* ── Success message ── */}
      {actionSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
          ✓ {actionSuccess}
        </div>
      )}

      {/* ── Status timeline ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
          Workflow Status
        </h3>
        <div className="flex items-center gap-0">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : isCurrent
                          ? 'bg-blue-50 border-blue-600 text-blue-600'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-5 mx-1 ${idx < currentStepIdx ? 'bg-blue-600' : 'bg-gray-200'}`}
                  />
                )}
              </React.Fragment>
            );
          })}
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
                  🏢
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
                  ✉️
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
                  📞
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

          {/* Attached Images / Files */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
              Reference Media &amp; Attachments
              {request.attachments?.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400 normal-case">
                  ({request.attachments.length} file
                  {request.attachments.length !== 1 ? 's' : ''})
                </span>
              )}
            </h2>

            {!request.attachments || request.attachments.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-dashed border-gray-200">
                <ImageIcon className="w-5 h-5 text-gray-300 shrink-0" />
                <p className="text-sm text-gray-400">
                  No reference files were uploaded with this request.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {request.attachments.map((att) => {
                  const isImage =
                    att.fileType?.startsWith('image') ||
                    att.cloudinaryUrl?.match(/\.(jpg|jpeg|png|gif|webp)/i);
                  // Build a direct download URL via Cloudinary fl_attachment
                  const downloadUrl = att.cloudinaryUrl?.includes(
                    'cloudinary.com'
                  )
                    ? att.cloudinaryUrl.replace(
                        '/upload/',
                        '/upload/fl_attachment/'
                      )
                    : att.cloudinaryUrl;

                  return isImage ? (
                    <div
                      key={att.id}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-[#1a6b50] transition-colors bg-gray-100"
                    >
                      <Image
                        src={att.cloudinaryUrl}
                        alt={att.fileName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {/* Hover overlay with view + download */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <a
                          href={att.cloudinaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                          title="View full size"
                        >
                          <Eye className="w-4 h-4 text-gray-700" />
                        </a>
                        <a
                          href={downloadUrl}
                          download={att.fileName}
                          className="w-9 h-9 bg-[#1a6b50] rounded-full flex items-center justify-center hover:bg-[#155a42] transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </a>
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                        {att.fileName}
                      </p>
                    </div>
                  ) : (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#1a6b50] hover:bg-[#f0faf6] transition-colors"
                    >
                      <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {att.fileName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(att.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <a
                        href={downloadUrl}
                        download={att.fileName}
                        className="p-1.5 text-[#1a6b50] hover:bg-[#e8f4f0] rounded-lg transition-colors shrink-0"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
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

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
              Actions
            </h3>
            <div className="space-y-2">
              {/* Mark Under Review */}
              {request.status === 'submitted' && (
                <button
                  onClick={handleMarkUnderReview}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors border border-yellow-200"
                >
                  <Clock className="w-4 h-4 text-yellow-600" />
                  Mark as Under Review
                </button>
              )}

              {/* Generate Pro-Forma */}
              {(request.status === 'submitted' ||
                request.status === 'under-review') && (
                <button
                  onClick={() => onGenerateInvoice?.(request)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                >
                  <FileOutput className="w-4 h-4 text-blue-600" />
                  Generate Pro-Forma Invoice
                </button>
              )}

              {/* Request More Info */}
              {(request.status === 'submitted' ||
                request.status === 'under-review') && (
                <button
                  onClick={() => setShowMoreInfoModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  Request More Info from Buyer
                </button>
              )}

              {/* Reject */}
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

              {request.status === 'quoted' && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-sm text-purple-700 font-medium text-center">
                  ✓ Pro-forma invoice sent to buyer
                </div>
              )}

              {request.status === 'accepted' && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 font-medium text-center">
                  ✓ Quote accepted by buyer
                </div>
              )}

              {request.status === 'rejected' && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium text-center">
                  ✗ Request rejected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Request More Info Modal ── */}
      {showMoreInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Request More Information
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This message will be sent to{' '}
              <strong>{request.buyer?.name}</strong> ({request.buyer?.email})
              via email.
            </p>
            <textarea
              value={moreInfoMessage}
              onChange={(e) => setMoreInfoMessage(e.target.value)}
              rows={5}
              placeholder="e.g. Could you please provide the exact dimensions, material specifications, and any certifications required for this product?"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMoreInfoModal(false);
                  setMoreInfoMessage('');
                }}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestMoreInfo}
                disabled={sendingMoreInfo || !moreInfoMessage.trim()}
                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
              >
                {sendingMoreInfo ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
