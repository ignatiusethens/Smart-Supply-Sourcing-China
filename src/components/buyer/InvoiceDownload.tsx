'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import Link from 'next/link';

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface InvoiceBuyer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  companyName?: string;
}

interface Invoice {
  id: string;
  referenceCode: string;
  totalAmount: number;
  depositAmount?: number;
  paymentMethod: 'mpesa' | 'bank-transfer';
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: string;
  shippingCity: string;
  contactName: string;
  contactPhone: string;
  buyer: InvoiceBuyer;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceDownloadProps {
  invoiceId: string;
}

export function InvoiceDownload({ invoiceId }: InvoiceDownloadProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/invoices/${invoiceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }

        const data = await response.json();
        if (data.success && data.data) {
          setInvoice(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleDownloadPDF = () => {
    if (!invoice) return;

    // Create a simple HTML representation for printing
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const subtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.16; // 16% VAT
    const total = subtotal + tax;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.referenceCode}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              border-bottom: 2px solid #007bff;
              padding-bottom: 20px;
            }
            .company-info h1 {
              margin: 0;
              color: #007bff;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section h3 {
              margin: 0 0 10px 0;
              color: #007bff;
              font-size: 14px;
              text-transform: uppercase;
            }
            .section p {
              margin: 5px 0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f0f0f0;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #007bff;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            .text-right {
              text-align: right;
            }
            .totals {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 30px;
            }
            .totals-table {
              width: 300px;
            }
            .totals-table tr td {
              padding: 8px;
              border: none;
            }
            .totals-table .total-row {
              background-color: #f0f0f0;
              font-weight: bold;
              border-top: 2px solid #007bff;
              border-bottom: 2px solid #007bff;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-info">
                <h1>Smart Supply Sourcing</h1>
                <p>Industrial Equipment Supplier</p>
              </div>
              <div class="section">
                <h3>Invoice</h3>
                <p><strong>${invoice.referenceCode}</strong></p>
                <p>Date: ${formatDate(invoice.createdAt)}</p>
              </div>
            </div>

            <div class="invoice-details">
              <div class="section">
                <h3>Bill To</h3>
                <p><strong>${invoice.buyer.companyName || invoice.buyer.name}</strong></p>
                <p>${invoice.contactName}</p>
                <p>${invoice.shippingAddress}</p>
                <p>${invoice.shippingCity}</p>
                <p>Phone: ${invoice.contactPhone}</p>
                <p>Email: ${invoice.buyer.email}</p>
              </div>
              <div class="section">
                <h3>Payment Details</h3>
                <p>Payment Method: ${invoice.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}</p>
                <p>Payment Status: ${invoice.paymentStatus}</p>
                <p>Order Status: ${invoice.orderStatus}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right">${formatCurrency(item.subtotal)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="totals">
              <table class="totals-table">
                <tr>
                  <td>Subtotal:</td>
                  <td class="text-right">${formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td>VAT (16%):</td>
                  <td class="text-right">${formatCurrency(tax)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total:</td>
                  <td class="text-right">${formatCurrency(total)}</td>
                </tr>
              </table>
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Smart Supply Sourcing Ltd | Kenya | www.smartsupply.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error || 'Invoice not found'}</p>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + tax;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
          <p className="text-gray-600 mt-1">Reference: {invoice.referenceCode}</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Download PDF
        </button>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Bill To */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Bill To
          </h3>
          <p className="font-semibold text-gray-900">
            {invoice.buyer.companyName || invoice.buyer.name}
          </p>
          <p className="text-sm text-gray-600 mt-1">{invoice.contactName}</p>
          <p className="text-sm text-gray-600">{invoice.shippingAddress}</p>
          <p className="text-sm text-gray-600">{invoice.shippingCity}</p>
          <p className="text-sm text-gray-600 mt-2">Phone: {invoice.contactPhone}</p>
          <p className="text-sm text-gray-600">Email: {invoice.buyer.email}</p>
        </div>

        {/* Invoice Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Invoice Details
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-600">Invoice Date</p>
              <p className="font-semibold text-gray-900">{formatDate(invoice.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method</p>
              <p className="font-semibold text-gray-900">
                {invoice.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Status
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-600">Payment Status</p>
              <p className="font-semibold text-gray-900 capitalize">
                {invoice.paymentStatus.replace('-', ' ')}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Order Status</p>
              <p className="font-semibold text-gray-900 capitalize">
                {invoice.orderStatus.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Product
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Unit Price
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-gray-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-gray-900">{item.productName}</td>
                <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-full md:w-80">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>VAT (16%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>Thank you for your business!</p>
        <p className="mt-1">Smart Supply Sourcing Ltd | Kenya</p>
      </div>
    </div>
  );
}
