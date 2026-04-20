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
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Clock,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
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
        const orderResponse = await fetch(`/api/orders/${orderId}`);
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
        const errorMessage = err instanceof Error ? err.message : 'Failed to load order';
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

      const response = await fetch('/api/payments/proof', {
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload payment proof';
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
    const steps: TimelineStep[] = [
      {
        id: 'transfer',
        title: 'Make Transfer',
        description: 'Transfer funds to the bank account details provided',
        status: payment?.status === 'pending' ? 'current' : 'completed',
        icon: <Clock className="h-5 w-5" />,
      },
      {
        id: 'upload',
        title: 'Upload Proof',
        description: 'Upload payment proof (receipt or screenshot)',
        status:
          payment?.status === 'pending-reconciliation' || payment?.status === 'received'
            ? 'current'
            : payment?.status === 'pending'
              ? 'pending'
              : 'completed',
        icon: <FileCheck className="h-5 w-5" />,
      },
      {
        id: 'reconcile',
        title: 'Reconciliation',
        description: 'Admin verifies and reconciles the payment',
        status:
          payment?.status === 'reconciled' ? 'completed' : payment?.status === 'received' ? 'current' : 'pending',
        icon: <CheckCircle2 className="h-5 w-5" />,
      },
    ];

    return steps;
  };

  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="max-w-4xl mx-auto py-12">
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
        <div className="max-w-4xl mx-auto py-12">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">{error}</p>
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
        <div className="max-w-4xl mx-auto py-12">
          <p className="text-center text-slate-600">Order not found</p>
        </div>
      </BuyerLayout>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <BuyerLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Bank Transfer Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Order Reference</span>
                  <span className="font-semibold">{order.referenceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Items</span>
                  <span className="font-semibold">{order.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Payment Status</span>
                  <Badge
                    variant={
                      payment?.status === 'reconciled'
                        ? 'default'
                        : payment?.status === 'pending-reconciliation'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {payment?.status || 'pending'}
                  </Badge>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Transfer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Please transfer exactly <span className="font-bold">{formatCurrency(order.totalAmount)}</span> to
                    the account details below. Include your order reference code in the transfer description.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Bank Name */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Bank Name</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {BANK_DETAILS.bankName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(BANK_DETAILS.bankName, 'bankName')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                      title="Copy bank name"
                    >
                      <Copy
                        className={`h-4 w-4 ${
                          copiedField === 'bankName'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Account Number</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50 font-mono">
                        {BANK_DETAILS.accountNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(BANK_DETAILS.accountNumber, 'accountNumber')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                      title="Copy account number"
                    >
                      <Copy
                        className={`h-4 w-4 ${
                          copiedField === 'accountNumber'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Account Name */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Account Name</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {BANK_DETAILS.accountName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(BANK_DETAILS.accountName, 'accountName')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                      title="Copy account name"
                    >
                      <Copy
                        className={`h-4 w-4 ${
                          copiedField === 'accountName'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Swift Code */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">SWIFT Code</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50 font-mono">
                        {BANK_DETAILS.swiftCode}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(BANK_DETAILS.swiftCode, 'swiftCode')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                      title="Copy SWIFT code"
                    >
                      <Copy
                        className={`h-4 w-4 ${
                          copiedField === 'swiftCode'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use your order reference code as the transfer description</li>
                    <li>Transfer the exact amount shown above</li>
                    <li>Keep your payment receipt for verification</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status Messages */}
            {uploadStatus === 'success' && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Payment Proof Uploaded Successfully!
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Your payment proof has been received. Our team will verify and reconcile your payment shortly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {uploadStatus === 'error' && error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 dark:text-red-100 mb-2">Upload Failed</p>
                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Upload Section */}
            {payment?.status !== 'reconciled' && uploadStatus !== 'success' && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Payment Proof</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUploadProof} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Payment Proof *
                      </label>
                      <FileUploader
                        onFilesSelected={handleFilesSelected}
                        maxFiles={3}
                        maxSizeMB={5}
                        acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                        disabled={uploadStatus === 'uploading'}
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Upload a screenshot or receipt of your bank transfer. Accepted formats: JPEG, PNG, PDF
                      </p>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={selectedFiles.length === 0 || uploadStatus === 'uploading'}
                    >
                      {uploadStatus === 'uploading' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload Payment Proof'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Timeline Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelineSteps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {/* Connector Line */}
                      {index < timelineSteps.length - 1 && (
                        <div
                          className={`absolute left-2.5 top-10 w-0.5 h-8 ${
                            step.status === 'completed'
                              ? 'bg-green-500'
                              : step.status === 'current'
                                ? 'bg-blue-500'
                                : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        />
                      )}

                      {/* Step */}
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold relative z-10 ${
                            step.status === 'completed'
                              ? 'bg-green-500'
                              : step.status === 'current'
                                ? 'bg-blue-500'
                                : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <p
                            className={`font-semibold text-sm ${
                              step.status === 'completed'
                                ? 'text-green-700 dark:text-green-400'
                                : step.status === 'current'
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {step.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/orders/${orderId}`)}
              >
                View Order Details
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/orders')}
              >
                Back to Orders
              </Button>
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
