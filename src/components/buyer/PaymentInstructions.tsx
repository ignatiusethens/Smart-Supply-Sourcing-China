'use client';

import { Order, PaymentMethod } from '@/types';
import { formatCurrency } from '@/lib/utils/formatting';
import Link from 'next/link';

interface PaymentInstructionsProps {
  order: Order;
}

export function PaymentInstructions({ order }: PaymentInstructionsProps) {
  if (order.orderStatus !== 'pending-payment') {
    return null;
  }

  const bankTransferDetails = {
    bankName: 'Kenya Commercial Bank',
    accountName: 'Smart Supply Sourcing Ltd',
    accountNumber: '1234567890',
    swiftCode: 'KCBLKENA',
    branchCode: '001',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Instructions</h3>

      {/* Reference Code */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-600 uppercase tracking-wide font-semibold mb-1">
          Reference Code
        </p>
        <p className="text-2xl font-bold text-blue-900 font-mono">
          {order.referenceCode}
        </p>
        <p className="text-xs text-blue-700 mt-2">
          Use this code when making your payment to ensure proper reconciliation
        </p>
      </div>

      {/* Payment Amount */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">
          Amount Due
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(order.totalAmount)}
        </p>
        {order.depositAmount && (
          <p className="text-sm text-gray-600 mt-2">
            Deposit: {formatCurrency(order.depositAmount)}
          </p>
        )}
      </div>

      {/* Payment Method Instructions */}
      {order.paymentMethod === 'mpesa' ? (
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">M-Pesa Payment</h4>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
                <span>Go to M-Pesa menu on your phone</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
                <span>Select "Lipa na M-Pesa Online"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
                <span>Enter the amount: {formatCurrency(order.totalAmount)}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
                <span>Enter reference code: {order.referenceCode}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">5.</span>
                <span>Enter your M-Pesa PIN to confirm</span>
              </li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              ✓ M-Pesa payments are processed instantly. Your order will be updated automatically.
            </p>
          </div>

          <Link href={`/payment/mpesa?orderId=${order.id}`}>
            <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
              Pay with M-Pesa
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Bank Transfer Details</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Bank Name</p>
                <p className="font-semibold text-gray-900">{bankTransferDetails.bankName}</p>
              </div>
              <div>
                <p className="text-gray-600">Account Name</p>
                <p className="font-semibold text-gray-900">{bankTransferDetails.accountName}</p>
              </div>
              <div>
                <p className="text-gray-600">Account Number</p>
                <p className="font-semibold text-gray-900 font-mono">
                  {bankTransferDetails.accountNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-600">SWIFT Code</p>
                <p className="font-semibold text-gray-900 font-mono">
                  {bankTransferDetails.swiftCode}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Branch Code</p>
                <p className="font-semibold text-gray-900 font-mono">
                  {bankTransferDetails.branchCode}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Transfer Instructions</h4>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
                <span>Log in to your bank's online platform or visit a branch</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
                <span>Select "Send Money" or "Transfer"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
                <span>Enter the account details above</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
                <span>Amount: {formatCurrency(order.totalAmount)}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">5.</span>
                <span>Reference: {order.referenceCode}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">6.</span>
                <span>Complete the transfer</span>
              </li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-3">
              After transferring, please upload proof of payment:
            </p>
            <Link href={`/payment/bank-transfer?orderId=${order.id}`}>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Upload Payment Proof
              </button>
            </Link>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800">
              ⏱ Bank transfers typically take 1-3 business days to process. Your order status will be updated once payment is reconciled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
