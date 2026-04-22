'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUploader } from './FileUploader';
import { SourcingRequest } from '@/types';
import { Plus, Plane, Ship } from 'lucide-react';

interface SourcingRequestFormProps {
  buyerId: string;
  onSuccess?: (request: SourcingRequest) => void;
  onError?: (error: string) => void;
}

interface ItemSpec {
  id: string;
  itemName: string;
  quantity: string;
  unit: string;
  specifications: string;
}

export function SourcingRequestForm({
  buyerId,
  onSuccess,
  onError,
}: SourcingRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [shippingMethod, setShippingMethod] = useState<'air' | 'sea'>('air');
  const [requestProForma, setRequestProForma] = useState(false);
  const [items, setItems] = useState<ItemSpec[]>([
    { id: '1', itemName: '', quantity: '', unit: '', specifications: '' },
  ]);
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    requiredCertifications: '',
    complianceNote: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    id: string,
    field: keyof ItemSpec,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        itemName: '',
        quantity: '',
        unit: '',
        specifications: '',
      },
    ]);
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const primaryItem = items[0];
      if (
        !primaryItem?.itemName.trim() ||
        !primaryItem?.quantity ||
        !formData.deliveryAddress.trim()
      ) {
        onError?.('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Build combined description from all items
      const itemDescription = items
        .filter((i) => i.itemName.trim())
        .map((i) => `${i.itemName}${i.unit ? ` (${i.unit})` : ''}`)
        .join(', ');

      const combinedSpecs = items
        .filter((i) => i.specifications.trim())
        .map((i) => i.specifications)
        .join('\n');

      const submitFormData = new FormData();
      submitFormData.append('buyerId', buyerId);
      submitFormData.append('itemDescription', itemDescription);
      submitFormData.append('specifications', combinedSpecs);
      submitFormData.append('quantity', primaryItem.quantity);
      submitFormData.append('targetPrice', '');
      submitFormData.append('deliveryLocation', formData.deliveryAddress);
      submitFormData.append(
        'timeline',
        shippingMethod === 'air' ? '7-14 days' : '35-40 days'
      );
      submitFormData.append(
        'complianceRequirements',
        formData.requiredCertifications
      );

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
      setItems([
        { id: '1', itemName: '', quantity: '', unit: '', specifications: '' },
      ]);
      setFormData({
        deliveryAddress: '',
        requiredCertifications: '',
        complianceNote: '',
      });
      setUploadedFiles([]);
      setShippingMethod('air');
      setRequestProForma(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create sourcing request';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = items.filter((i) => i.itemName.trim()).length || 1;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-xl overflow-hidden shadow-lg border border-slate-200">
          {/* ── LEFT COLUMN: Form ── */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 space-y-8">
            {/* ── Item Specifications ── */}
            <section aria-labelledby="item-specs-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="item-specs-heading"
                  className="text-base font-semibold text-slate-800 uppercase tracking-wide"
                >
                  Item Specifications
                </h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  aria-label="Add another item"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add Another Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50"
                  >
                    {items.length > 1 && (
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Item {index + 1}
                      </p>
                    )}

                    {/* Item Name + Quantity + Unit */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label
                          htmlFor={`itemName-${item.id}`}
                          className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
                        >
                          Item Name / Description{' '}
                          {index === 0 && (
                            <span
                              aria-label="required"
                              className="text-red-500"
                            >
                              *
                            </span>
                          )}
                        </label>
                        <Input
                          id={`itemName-${item.id}`}
                          type="text"
                          value={item.itemName}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'itemName',
                              e.target.value
                            )
                          }
                          placeholder="e.g. Industrial Pump"
                          required={index === 0}
                          aria-required={index === 0}
                          className="bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`quantity-${item.id}`}
                          className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
                        >
                          Quantity{' '}
                          {index === 0 && (
                            <span
                              aria-label="required"
                              className="text-red-500"
                            >
                              *
                            </span>
                          )}
                        </label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'quantity',
                              e.target.value
                            )
                          }
                          placeholder="0"
                          min="1"
                          required={index === 0}
                          aria-required={index === 0}
                          className="bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`unit-${item.id}`}
                          className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
                        >
                          Unit
                        </label>
                        <Input
                          id={`unit-${item.id}`}
                          type="text"
                          value={item.unit}
                          onChange={(e) =>
                            handleItemChange(item.id, 'unit', e.target.value)
                          }
                          placeholder="pcs / kg / m"
                          className="bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Specifications textarea */}
                    <div>
                      <label
                        htmlFor={`specs-${item.id}`}
                        className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
                      >
                        Specifications &amp; Requirements
                      </label>
                      <textarea
                        id={`specs-${item.id}`}
                        value={item.specifications}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'specifications',
                            e.target.value
                          )
                        }
                        placeholder="Technical specifications, dimensions, materials, standards…"
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Product Photos */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Product Photos
                </p>
                <FileUploader
                  onFilesSelected={handleFilesSelected}
                  maxFiles={5}
                  maxSizeMB={5}
                  acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                />
              </div>
            </section>

            {/* ── Logistics & Delivery ── */}
            <section aria-labelledby="logistics-heading">
              <h2
                id="logistics-heading"
                className="text-base font-semibold text-slate-800 uppercase tracking-wide mb-4"
              >
                Logistics &amp; Delivery
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="deliveryAddress"
                    className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
                  >
                    Delivery Address{' '}
                    <span aria-label="required" className="text-red-500">
                      *
                    </span>
                  </label>
                  <Input
                    id="deliveryAddress"
                    type="text"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="Street, City, Country"
                    required
                    aria-required="true"
                    className="border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>

                {/* Shipping Method */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Requested Shipping Method
                  </p>
                  <div
                    className="grid grid-cols-2 gap-3"
                    role="radiogroup"
                    aria-label="Shipping method"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={shippingMethod === 'air'}
                      onClick={() => setShippingMethod('air')}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        shippingMethod === 'air'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Plane
                        className={`w-5 h-5 flex-shrink-0 ${
                          shippingMethod === 'air'
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            shippingMethod === 'air'
                              ? 'text-blue-700'
                              : 'text-slate-700'
                          }`}
                        >
                          Air
                        </p>
                        <p className="text-xs text-slate-500">7–14 days</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={shippingMethod === 'sea'}
                      onClick={() => setShippingMethod('sea')}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        shippingMethod === 'sea'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Ship
                        className={`w-5 h-5 flex-shrink-0 ${
                          shippingMethod === 'sea'
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            shippingMethod === 'sea'
                              ? 'text-blue-700'
                              : 'text-slate-700'
                          }`}
                        >
                          Sea
                        </p>
                        <p className="text-xs text-slate-500">35–40 days</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Compliance & Quality ── */}
            <section aria-labelledby="compliance-heading">
              <h2
                id="compliance-heading"
                className="text-base font-semibold text-slate-800 uppercase tracking-wide mb-4"
              >
                Compliance &amp; Quality
              </h2>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="requiredCertifications"
                    className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
                  >
                    Required Certifications
                  </label>
                  <Input
                    id="requiredCertifications"
                    type="text"
                    name="requiredCertifications"
                    value={formData.requiredCertifications}
                    onChange={handleInputChange}
                    placeholder="e.g. ISO 9001, CE, RoHS"
                    className="border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  All sourced products are subject to quality verification.
                  Compliance documentation will be provided upon request.
                </p>
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN: Dark Sidebar ── */}
          <aside
            className="bg-slate-900 text-white p-6 md:p-8 flex flex-col gap-6"
            aria-label="Request Summary"
          >
            <h2 className="text-lg font-bold text-white">Request Summary</h2>

            {/* Summary details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Items for Sourcing</span>
                <span className="font-semibold text-white">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Estimated Processing</span>
                <span className="font-semibold text-white">24–48 Hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Sourcing Fee</span>
                <span className="font-semibold text-white">50.00</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-slate-400">Estimated Total</span>
                <span className="font-bold text-blue-400 text-base">TBD</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Final price will be confirmed after our team verifies availability
              and provides a formal quote.
            </p>

            {/* Pro-forma invoice checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={requestProForma}
                onChange={(e) => setRequestProForma(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                aria-label="Request a formal pro forma invoice with bank details"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                Request a formal pro forma invoice with bank details
              </span>
            </label>
            <p className="text-xs text-slate-500 -mt-4">
              Invoice will be sent to your email upon verification.
            </p>

            {/* Payment pathways */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Preferred Payment Pathways
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-900/60 border border-green-700 text-green-300 text-xs font-semibold">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
                    aria-hidden="true"
                  />
                  M-Pesa (Instant Pay)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-700 border border-slate-600 text-slate-300 text-xs font-semibold">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"
                    aria-hidden="true"
                  />
                  Bank Transfer (1–3 Bus. Days)
                </span>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 focus-visible:ring-offset-slate-900 mt-auto"
              aria-label={
                isLoading
                  ? 'Submitting sourcing request'
                  : 'Submit sourcing request'
              }
            >
              {isLoading ? 'Submitting…' : 'Submit Sourcing Request +'}
            </Button>

            {/* Footer links */}
            <div className="flex justify-center gap-4 text-xs text-slate-500">
              <button
                type="button"
                className="hover:text-slate-300 transition-colors underline underline-offset-2"
              >
                Need Bulk Assistance?
              </button>
              <button
                type="button"
                className="hover:text-slate-300 transition-colors underline underline-offset-2"
              >
                View Samples
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
