'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUploader } from '@/components/buyer/FileUploader';
import { formatCurrency } from '@/lib/utils/formatting';
import { Order, Payment } from '@/types';
import { authFetch } from '@/lib/api/auth-client';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Download,
  FileText,
  Info,
} from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface TimelineStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
}

function BankTransferPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Bank transfer details
  const BANK_DETAILS = {
    bankName: 'Equity Bank Kenya',
    accountNumber: '0123456789',
    accountName: 'Smart Supply Sourcing Ltd',
    swiftCode: 'EQBLKENA',
    branchCode: '001',
  };

  // Fetch order and payment details
  useEffect(() => {
    const fetchOrderAndPayment = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setIsLoading(false);
        return;
      }

      try {
        const orderResponse = await authFetch(`/api/orders/${orderId}`);
        if (!orderResponse.ok) {
          throw new Error('Failed to fetch order');
        }

        const orderResult = await orderResponse.json();
        if (!orderResult.success) {
          throw new Error(orderResult.error || 'Failed to fetch order');
        }

        setOrder(orderResult.data);

        // Get payment details if available
        if (orderResult.data.payments && orderResult.data.payments.length > 0) {
          setPayment(orderResult.data.payments[0]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load order';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderAndPayment();
  }, [orderId]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setError(null);
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId || !order) {
      setError('Order information is missing');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploadStatus('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('orderId', orderId);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await authFetch('/api/payments/proof', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload payment proof');
      }

      setUploadStatus('success');
      setSelectedFiles([]);

      // Refresh payment data
      if (result.data) {
        setPayment({
          ...payment,
          ...result.data,
          status: 'pending-reconciliation',
        } as Payment);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload payment proof';
      setError(errorMessage);
      setUploadStatus('error');
    }
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getTimelineSteps = (): TimelineStep[] => {
    return [
      {
        id: 'placed',
        title: 'Order Placed',
        status: 'completed',
      },
      {
        id: 'proforma',
        title: 'Pro-forma Invoice Generated',
        status: 'completed',
      },
      {
        id: 'awaiting',
        title: 'Awaiting Bank Transfer',
        status:
          payment?.status === 'pending' || !payment ? 'current' : 'completed',
      },
      {
        id: 'reconciliation',
        title: 'Payment Reconciliation',
        status:
          payment?.status === 'pending-reconciliation' ||
          payment?.status === 'received'
            ? 'current'
            : payment?.status === 'reconciled'
              ? 'completed'
              : 'pending',
      },
      {
        id: 'dispatched',
        title: 'Order Dispatched',
        status: payment?.status === 'reconciled' ? 'current' : 'pending',
      },
    ];
  };

  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="max-w-5xl mx-auto py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading order details...</span>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  if (error && !order) {
    return (
      <BuyerLayout>
        <div className="max-w-5xl mx-auto py-12">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push('/orders')}
                  >
                    Back to Orders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </BuyerLayout>
    );
  }

  if (!order) {
    return (
      <BuyerLayout>
        <div className="max-w-5xl mx-auto py-12">
          <p className="text-center text-slate-600">Order not found</p>
        </div>
      </BuyerLayout>
    );
  }

  const timelineSteps = getTimelineSteps();
  const referenceCode = order.referenceCode || `ORD-${orderId}`;

  return (
    <BuyerLayout>
      {/* Blue Header Banner */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-1">Awaiting Bank Transfer</h1>
          <p className="text-blue-100 text-sm font-medium">
            Order Reference: {referenceCode}
          </p>
          <p className="text-blue-200 text-xs mt-1 uppercase tracking-wide font-semibold">
            ESTIMATED CLEARANCE: 1-3 Business Days
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Link */}
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transfer Instructions Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Transfer Instructions
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium text-xs">
                    Awaiting Bank Transfer
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Please use the{' '}
                    <span className="font-semibold">Reference Code</span> below
                    as the payment description when making your bank transfer.
                    This ensures your payment is matched to your order
                    automatically.
                  </p>
                </div>

                {/* Bank Transfer Details Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Bank Transfer Details
                    </h3>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(
                          `Account Name: ${BANK_DETAILS.accountName}\nBank: ${BANK_DETAILS.bankName}\nAccount No.: ${BANK_DETAILS.accountNumber}\nSWIFT: ${BANK_DETAILS.swiftCode}\nReference: ${referenceCode}`,
                          'all'
                        )
                      }
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedField === 'all' ? 'Copied!' : 'Copy All'}
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Account Name */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">
                          Account Name
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {BANK_DETAILS.accountName}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(
                            BANK_DETAILS.accountName,
                            'accountName'
                          )
                        }
                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                        title="Copy account name"
                      >
                        <Copy
                          className={`h-3.5 w-3.5 ${
                            copiedField === 'accountName'
                              ? 'text-green-600'
                              : 'text-slate-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Bank */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Bank</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {BANK_DETAILS.bankName}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(
                            BANK_DETAILS.bankName,
                            'bankName'
                          )
                        }
                        className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                        title="Copy bank name"
                      >
                        <Copy
                          className={`h-3.5 w-3.5 ${
                            copiedField === 'bankName'
                              ? 'text-green-600'
                              : 'text-slate-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Account No. */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">
                          Account No.
                        </p>
                        <p className="text-sm font-semibold text-slate-900 font-mono">
                          {BANK_DETAILS.accountNumber}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(
                            BANK_DETAILS.accountNumber,
                            'accountNumber'
                          )
                        }
                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                        title="Copy account number"
                      >
                        <Copy
                          className={`h-3.5 w-3.5 ${
                            copiedField === 'accountNumber'
                              ? 'text-green-600'
                              : 'text-slate-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* SWIFT */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">SWIFT</p>
                        <p className="text-sm font-semibold text-slate-900 font-mono">
                          {BANK_DETAILS.swiftCode}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(
                            BANK_DETAILS.swiftCode,
                            'swiftCode'
                          )
                        }
                        className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                        title="Copy SWIFT code"
                      >
                        <Copy
                          className={`h-3.5 w-3.5 ${
                            copiedField === 'swiftCode'
                              ? 'text-green-600'
                              : 'text-slate-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Reference Code */}
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b-0">
                      <div>
                        <p className="text-xs text-blue-600 mb-0.5 font-medium">
                          Reference Code
                        </p>
                        <p className="text-sm font-bold text-blue-700 font-mono">
                          {referenceCode}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(referenceCode, 'referenceCode')
                        }
                        className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                        title="Copy reference code"
                      >
                        <Copy
                          className={`h-3.5 w-3.5 ${
                            copiedField === 'referenceCode'
                              ? 'text-green-600'
                              : 'text-blue-500'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                    Order Timeline
                  </h3>
                  <div className="space-y-0">
                    {timelineSteps.map((step, index) => (
                      <div key={step.id} className="flex gap-3">
                        {/* Step indicator column */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              step.status === 'completed'
                                ? 'bg-green-500'
                                : step.status === 'current'
                                  ? 'bg-blue-600'
                                  : 'bg-slate-200'
                            }`}
                          >
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : step.status === 'current' ? (
                              <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            ) : (
                              <div className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                            )}
                          </div>
                          {index < timelineSteps.length - 1 && (
                            <div
                              className={`w-0.5 h-8 mt-1 ${
                                step.status === 'completed'
                                  ? 'bg-green-400'
                                  : 'bg-slate-200'
                              }`}
                            />
                          )}
                        </div>

                        {/* Step content */}
                        <div className="pb-6 pt-0.5">
                          <p
                            className={`text-sm font-medium ${
                              step.status === 'completed'
                                ? 'text-green-700'
                                : step.status === 'current'
                                  ? 'text-blue-700'
                                  : 'text-slate-400'
                            }`}
                          >
                            {step.title}
                            {step.status === 'current' && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                                Current
                              </span>
                            )}
                            {step.status === 'pending' && (
                              <span className="ml-2 text-xs text-slate-400 font-normal">
                                Pending
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                    Order Items
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between px-4 py-3 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        } ${index < order.items.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {(item as { productName?: string; name?: string })
                              .productName ||
                              (item as { productName?: string; name?: string })
                                .name ||
                              'Product'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 ml-4">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-t border-slate-200">
                      <p className="text-sm font-bold text-slate-900">
                        Total Amount
                      </p>
                      <p className="text-base font-bold text-blue-700">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Proof of Payment Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Proof of Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadStatus === 'success' ? (
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900 text-sm mb-1">
                        Proof Uploaded Successfully!
                      </p>
                      <p className="text-xs text-green-700">
                        Our team will verify and reconcile your payment shortly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUploadProof} className="space-y-4">
                    {/* Upload Area */}
                    <FileUploader
                      onFilesSelected={handleFilesSelected}
                      maxFiles={3}
                      maxSizeMB={5}
                      acceptedTypes={[
                        'image/jpeg',
                        'image/png',
                        'application/pdf',
                      ]}
                      disabled={uploadStatus === 'uploading'}
                    />

                    {uploadStatus === 'error' && error && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">{error}</p>
                      </div>
                    )}

                    {/* Confirmation Checkbox */}
                    {payment?.status !== 'reconciled' && (
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmChecked}
                          onChange={(e) => setConfirmChecked(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-600">
                          I have initiated the transfer and the details above
                          are correct
                        </span>
                      </label>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      disabled={
                        selectedFiles.length === 0 ||
                        uploadStatus === 'uploading' ||
                        !confirmChecked
                      }
                    >
                      {uploadStatus === 'uploading' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Submit Proof of Payment'
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                      <Shield className="h-3.5 w-3.5" />
                      <span>ENCRYPTED &amp; SECURE SUBMISSION</span>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Support & Documents */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Support &amp; Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-sm border-slate-200 hover:bg-slate-50"
                  onClick={() => router.push(`/orders/${orderId}`)}
                >
                  <Download className="h-4 w-4 text-slate-500" />
                  Download Bank Invoice
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-sm border-slate-200 hover:bg-slate-50"
                  onClick={() => router.push(`/orders/${orderId}`)}
                >
                  <FileText className="h-4 w-4 text-slate-500" />
                  View Pro-forma Copy
                </Button>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">
                IMPORTANT NOTICE
              </p>
              <ul className="space-y-1.5 text-xs text-amber-800">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  Use your order reference code as the transfer description
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  Transfer the exact amount shown above
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  Keep your payment receipt for verification
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  Clearance typically takes 1-3 business days
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}

export default function BankTransferPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <BankTransferPaymentContent />
    </Suspense>
  );
}
