'use client';

import React, { useState } from 'react';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Plus, Trash2 } from 'lucide-react';
import { VerificationGallery } from './VerificationGallery';

interface InvoiceDetailProps {
  invoice: Invoice;
  onSend?: (invoiceId: string) => Promise<void>;
  onMarkAsPaid?: (invoiceId: string) => Promise<void>;
  onAddLogisticsNotes?: (invoiceId: string, notes: string) => Promise<void>;
  onAddAdminComments?: (invoiceId: string, comments: string) => Promise<void>;
  onAddVerificationFile?: (invoiceId: string, file: File) => Promise<void>;
  onDeleteVerificationFile?: (invoiceId: string, fileId: string) => Promise<void>;
}

export function InvoiceDetail({
  invoice,
  onSend,
  onMarkAsPaid,
  onAddLogisticsNotes,
  onAddAdminComments,
  onAddVerificationFile,
  onDeleteVerificationFile,
}: InvoiceDetailProps) {
  const [isAddingNotes, setIsAddingNotes] = useState(false);
  const [logisticsNotes, setLogisticsNotes] = useState(invoice.logisticsNotes || '');
  const [adminComments, setAdminComments] = useState(invoice.adminComments || '');
  const [isSending, setIsSending] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const statusColors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'pending-payment': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
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

  const handleSend = async () => {
    setIsSending(true);
    try {
      if (onSend) {
        await onSend(invoice.id);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);
    try {
      if (onMarkAsPaid) {
        await onMarkAsPaid(invoice.id);
      }
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleSaveLogisticsNotes = async () => {
    setIsAddingNotes(true);
    try {
      if (onAddLogisticsNotes) {
        await onAddLogisticsNotes(invoice.id, logisticsNotes);
      }
    } finally {
      setIsAddingNotes(false);
    }
  };

  const handleSaveAdminComments = async () => {
    setIsAddingNotes(true);
    try {
      if (onAddAdminComments) {
        await onAddAdminComments(invoice.id, adminComments);
      }
    } finally {
      setIsAddingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-gray-600 mt-2">ID: {invoice.id}</p>
        </div>
        <Badge className={statusColors[invoice.status] || 'bg-gray-100 text-gray-800'}>
          {invoice.status.replace('-', ' ')}
        </Badge>
      </div>

      {/* Invoice Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Invoice Summary</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Invoice Date</p>
            <p className="text-gray-900 font-medium">{formatDate(invoice.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-gray-900 font-medium">{invoice.status}</p>
          </div>
        </div>

        {invoice.buyer && (
          <div>
            <p className="text-sm text-gray-600">Buyer</p>
            <p className="text-gray-900 font-medium">{invoice.buyer.name}</p>
            <p className="text-sm text-gray-600">{invoice.buyer.email}</p>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Line Items</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Specifications</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.specifications || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (16% VAT)</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-blue-600">
              <span>Total</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Instructions */}
      {invoice.settlementInstructions && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Settlement Instructions</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{invoice.settlementInstructions}</p>
        </div>
      )}

      {/* Payment Instructions */}
      {invoice.paymentInstructions && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Payment Instructions</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{invoice.paymentInstructions}</p>
        </div>
      )}

      {/* Terms and Conditions */}
      {invoice.termsAndConditions && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Terms and Conditions</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{invoice.termsAndConditions}</p>
        </div>
      )}

      {/* Verification Gallery */}
      {invoice.verificationGallery && invoice.verificationGallery.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Verification Gallery</h2>
          <VerificationGallery
            files={invoice.verificationGallery}
            onDelete={onDeleteVerificationFile ? (fileId) => onDeleteVerificationFile(invoice.id, fileId) : undefined}
          />
        </div>
      )}

      {/* Logistics Notes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Logistics Support Notes</h2>
        <textarea
          value={logisticsNotes}
          onChange={(e) => setLogisticsNotes(e.target.value)}
          placeholder="Add logistics support notes..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onClick={handleSaveLogisticsNotes}
          disabled={isAddingNotes}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAddingNotes ? 'Saving...' : 'Save Logistics Notes'}
        </Button>
      </div>

      {/* Admin Comments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Admin Comments</h2>
        <textarea
          value={adminComments}
          onChange={(e) => setAdminComments(e.target.value)}
          placeholder="Add admin comments..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onClick={handleSaveAdminComments}
          disabled={isAddingNotes}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAddingNotes ? 'Saving...' : 'Save Admin Comments'}
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {invoice.status === 'draft' && (
          <Button
            onClick={handleSend}
            disabled={isSending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSending ? 'Sending...' : 'Send Invoice'}
          </Button>
        )}

        {(invoice.status === 'sent' || invoice.status === 'pending-payment') && (
          <Button
            onClick={handleMarkAsPaid}
            disabled={isMarkingPaid}
            className="bg-green-600 hover:bg-green-700"
          >
            {isMarkingPaid ? 'Marking...' : 'Mark as Paid'}
          </Button>
        )}
      </div>
    </div>
  );
}
