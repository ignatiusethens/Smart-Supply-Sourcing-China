'use client';

import React, { useState } from 'react';
import { SourcingRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface LineItem {
  description: string;
  specifications?: string;
  quantity: number;
  unitPrice: number;
}

interface ProFormaInvoiceGeneratorProps {
  sourcingRequest: SourcingRequest;
  onGenerate: (data: {
    lineItems: LineItem[];
    termsAndConditions?: string;
    paymentInstructions?: string;
    settlementInstructions?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function ProFormaInvoiceGenerator({
  sourcingRequest,
  onGenerate,
  isLoading = false,
}: ProFormaInvoiceGeneratorProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      description: sourcingRequest.itemDescription,
      specifications: sourcingRequest.specifications,
      quantity: sourcingRequest.quantity,
      unitPrice: 0,
    },
  ]);

  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [settlementInstructions, setSettlementInstructions] = useState('');

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        specifications: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.16; // 16% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleGenerate = async () => {
    if (lineItems.some((item) => !item.description || item.unitPrice === 0)) {
      alert('Please fill in all line items with description and unit price');
      return;
    }

    await onGenerate({
      lineItems,
      termsAndConditions: termsAndConditions || undefined,
      paymentInstructions: paymentInstructions || undefined,
      settlementInstructions: settlementInstructions || undefined,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Generate Pro-Forma Invoice</h2>
        <p className="text-gray-600 mt-2">Create an invoice for sourcing request {sourcingRequest.id}</p>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
          <Button
            onClick={addLineItem}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                    className="w-full"
                  />
                </div>
                {lineItems.length > 1 && (
                  <Button
                    onClick={() => removeLineItem(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications (Optional)
                </label>
                <Input
                  value={item.specifications || ''}
                  onChange={(e) => updateLineItem(index, 'specifications', e.target.value)}
                  placeholder="Technical specifications"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price (KES)
                  </label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtotal
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200 text-gray-900 font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Subtotal</span>
          <span className="text-gray-900 font-medium">{formatCurrency(calculateSubtotal())}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Tax (16% VAT)</span>
          <span className="text-gray-900 font-medium">{formatCurrency(calculateTax())}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Terms and Conditions
        </label>
        <textarea
          value={termsAndConditions}
          onChange={(e) => setTermsAndConditions(e.target.value)}
          placeholder="Enter terms and conditions for this invoice..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Payment Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Payment Instructions
        </label>
        <textarea
          value={paymentInstructions}
          onChange={(e) => setPaymentInstructions(e.target.value)}
          placeholder="Enter payment instructions..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Settlement Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Settlement Instructions
        </label>
        <textarea
          value={settlementInstructions}
          onChange={(e) => setSettlementInstructions(e.target.value)}
          placeholder="Enter settlement instructions (bank details, payment methods, etc.)..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Generating...' : 'Generate Invoice'}
        </Button>
      </div>
    </div>
  );
}
