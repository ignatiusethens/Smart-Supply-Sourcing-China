'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { FileUploader } from './FileUploader';
import { SourcingRequest } from '@/types';
import { authFetch } from '@/lib/api/auth-client';
import { useAuthStore } from '@/lib/stores/authStore';
import { ArrowRight, Lock, Phone } from 'lucide-react';

interface SourcingRequestFormProps {
  buyerId: string;
  onSuccess?: (request: SourcingRequest) => void;
  onError?: (error: string) => void;
}

interface ItemSpec {
  id: string;
  itemName: string;
  quantity: string;
  targetPrice: string;
  specifications: string;
}

const CERTIFICATIONS = [
  'CE Certification',
  'RoHS Compliant',
  'ISO 9001',
  'FCC Standard',
  'SGS Inspected',
  'PVOC Kenya',
];

const INCOTERMS = [
  { value: 'FOB', label: 'FOB (Free on Board)' },
  { value: 'FXW', label: 'FXW (Ex Works)' },
  { value: 'CIF', label: 'CIF (Cost, Ins, Freight)' },
];

export function SourcingRequestForm({
  buyerId,
  onSuccess,
  onError,
}: SourcingRequestFormProps) {
  const { token: storeToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [shippingMethod, setShippingMethod] = useState<'air' | 'sea'>('air');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'bank'>('mpesa');
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedIncoterms, setSelectedIncoterms] = useState<string[]>([]);
  const [destinationCity, setDestinationCity] = useState('');
  const [items, setItems] = useState<ItemSpec[]>([
    {
      id: '1',
      itemName: '',
      quantity: '',
      targetPrice: '',
      specifications: '',
    },
  ]);
  const [contactData, setContactData] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    email: '',
  });

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
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

  const toggleCert = (cert: string) => {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const toggleIncoterm = (term: string) => {
    setSelectedIncoterms((prev) =>
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term]
    );
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
        !destinationCity.trim()
      ) {
        onError?.('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      const itemDescription = items
        .filter((i) => i.itemName.trim())
        .map((i) => i.itemName)
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
      submitFormData.append('targetPrice', primaryItem.targetPrice || '');
      submitFormData.append('deliveryLocation', destinationCity);
      submitFormData.append(
        'timeline',
        shippingMethod === 'air' ? '7-14 days' : '35-40 days'
      );
      submitFormData.append('complianceRequirements', selectedCerts.join(', '));

      uploadedFiles.forEach((file) => {
        submitFormData.append('attachments', file);
      });

      const token =
        storeToken ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('auth-token')
          : null);

      if (token) submitFormData.append('_token', token);

      const response = await authFetch('/api/sourcing/requests', {
        method: 'POST',
        body: submitFormData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sourcing request');
      }

      const result = await response.json();
      onSuccess?.(result.data);

      // Reset
      setItems([
        {
          id: '1',
          itemName: '',
          quantity: '',
          targetPrice: '',
          specifications: '',
        },
      ]);
      setContactData({
        businessName: '',
        contactName: '',
        phone: '',
        email: '',
      });
      setUploadedFiles([]);
      setShippingMethod('air');
      setSelectedCerts([]);
      setSelectedIncoterms([]);
      setDestinationCity('');
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN: Form sections ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Item Specifications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Item Specifications
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Be as specific as possible to ensure accurate factory matching.
              </p>

              {items.map((item) => (
                <div key={item.id} className="space-y-4">
                  <div>
                    <label
                      htmlFor={`itemName-${item.id}`}
                      className="block text-xs font-semibold text-gray-600 mb-1.5"
                    >
                      Product Name or Type
                    </label>
                    <Input
                      id={`itemName-${item.id}`}
                      type="text"
                      value={item.itemName}
                      onChange={(e) =>
                        handleItemChange(item.id, 'itemName', e.target.value)
                      }
                      placeholder="e.g., Solar Inverter 5KW Hybrid"
                      required
                      className="border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor={`quantity-${item.id}`}
                        className="block text-xs font-semibold text-gray-600 mb-1.5"
                      >
                        Estimated Quantity
                      </label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, 'quantity', e.target.value)
                        }
                        placeholder="e.g., 100 Units"
                        required
                        className="border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`targetPrice-${item.id}`}
                        className="block text-xs font-semibold text-gray-600 mb-1.5"
                      >
                        Target Price per Unit (KES)
                      </label>
                      <Input
                        id={`targetPrice-${item.id}`}
                        type="text"
                        value={item.targetPrice}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'targetPrice',
                            e.target.value
                          )
                        }
                        placeholder="Optional"
                        className="border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`specs-${item.id}`}
                      className="block text-xs font-semibold text-gray-600 mb-1.5"
                    >
                      Technical Specifications
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
                      placeholder="Mention materials, dimensions, specific components, or functions required."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a6b50] focus:border-[#1a6b50] resize-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Reference Media */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Reference Media
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Upload photos or blueprints to help our agents find the exact
                match.
              </p>
              <FileUploader
                onFilesSelected={handleFilesSelected}
                maxFiles={5}
                maxSizeMB={5}
                acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
              />
            </div>

            {/* Logistics & Delivery */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Logistics &amp; Delivery
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                How would you like your goods to reach Kenya?
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Shipping Method
                    </p>
                    <div
                      className="grid grid-cols-2 gap-2"
                      role="radiogroup"
                      aria-label="Shipping method"
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={shippingMethod === 'air'}
                        onClick={() => setShippingMethod('air')}
                        className={`py-2.5 px-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                          shippingMethod === 'air'
                            ? 'border-[#1a6b50] bg-[#1a6b50] text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#1a6b50]'
                        }`}
                      >
                        Air Freight
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={shippingMethod === 'sea'}
                        onClick={() => setShippingMethod('sea')}
                        className={`py-2.5 px-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                          shippingMethod === 'sea'
                            ? 'border-[#1a6b50] bg-[#1a6b50] text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#1a6b50]'
                        }`}
                      >
                        Sea Freight
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="destinationCity"
                      className="block text-xs font-semibold text-gray-600 mb-2"
                    >
                      Destination City in Kenya
                    </label>
                    <Input
                      id="destinationCity"
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      placeholder="e.g., Nairobi, Mombasa, Kisumu"
                      required
                      className="border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Incoterms Required:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {INCOTERMS.map((term) => (
                      <label
                        key={term.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIncoterms.includes(term.value)}
                          onChange={() => toggleIncoterm(term.value)}
                          className="w-4 h-4 rounded border-gray-300 text-[#1a6b50] focus:ring-[#1a6b50] cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">
                          {term.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance & Quality */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Compliance &amp; Quality
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Specify mandatory certifications for the Chinese supplier.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CERTIFICATIONS.map((cert) => (
                  <label
                    key={cert}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCerts.includes(cert)}
                      onChange={() => toggleCert(cert)}
                      className="w-4 h-4 rounded border-gray-300 text-[#1a6b50] focus:ring-[#1a6b50] cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{cert}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact & Business Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Contact &amp; Business Info
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Who should we contact once the quote is ready?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                  >
                    Business/Company Name
                  </label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={contactData.businessName}
                    onChange={handleContactChange}
                    placeholder="Your Company Ltd"
                    className="border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contactName"
                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                  >
                    Contact Person Name
                  </label>
                  <Input
                    id="contactName"
                    name="contactName"
                    type="text"
                    value={contactData.contactName}
                    onChange={handleContactChange}
                    placeholder="Full Name"
                    className="border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                  >
                    Phone Number (WhatsApp Preferred)
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={contactData.phone}
                    onChange={handleContactChange}
                    placeholder="+254 700 XXX XXX"
                    className="border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-gray-600 mb-1.5"
                  >
                    Official Business Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={contactData.email}
                    onChange={handleContactChange}
                    placeholder="name@company.co.ke"
                    className="border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="flex items-start gap-3 bg-[#e8f4f0] border border-[#b2d8cc] rounded-xl px-4 py-3">
              <span className="text-[#1a6b50] text-base mt-0.5">💡</span>
              <p className="text-xs text-[#1a6b50] leading-relaxed">
                <span className="font-bold">Pro tip:</span> Providing a direct
                Alibaba or Made-in-China link in the specifications often speeds
                up the sourcing process by 40%.
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Summary Sidebar ── */}
          <aside className="lg:col-span-1" aria-label="Request Summary">
            <div className="sticky top-24 space-y-4">
              {/* Request Summary Card */}
              <div className="bg-[#1a6b50] rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-base font-bold text-white mb-1">
                  Request Summary
                </h2>
                <p className="text-xs text-[#a8d5c4] mb-5">
                  Review your sourcing terms before submission.
                </p>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#a8d5c4]">Estimated Items</span>
                    <span className="font-semibold text-white">
                      {totalItems} Product Line
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#a8d5c4]">
                      Estimated Processing Time
                    </span>
                    <span className="font-semibold text-white">
                      12 – 24 Hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#a8d5c4]">
                      Sourcing Consultation
                    </span>
                    <span className="font-semibold text-white">
                      Included Free
                    </span>
                  </div>
                  <div className="border-t border-[#2a8a65] pt-3 flex justify-between items-center">
                    <span className="text-[#a8d5c4] text-sm">Sourcing Fee</span>
                    <span className="font-black text-white text-xl">
                      KES 50
                    </span>
                  </div>
                </div>

                {/* Payment Pathway */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#a8d5c4] mb-3">
                    Payment Pathway
                  </p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === 'mpesa'
                          ? 'border-white bg-white/15'
                          : 'border-[#2a8a65] bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-black">M</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          M-PESA INSTANT
                        </p>
                        <p className="text-[10px] text-[#a8d5c4]">
                          Instant Confirmation
                        </p>
                      </div>
                      {paymentMethod === 'mpesa' && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-white flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#1a6b50]" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === 'bank'
                          ? 'border-white bg-white/15'
                          : 'border-[#2a8a65] bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-black">B</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          BANK TRANSFER
                        </p>
                        <p className="text-[10px] text-[#a8d5c4]">
                          1-3 Business Days
                        </p>
                      </div>
                      {paymentMethod === 'bank' && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-white flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#1a6b50]" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-white text-[#1a6b50] font-bold py-3.5 rounded-xl hover:bg-[#e8f4f0] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={
                    isLoading
                      ? 'Submitting sourcing request'
                      : 'Submit sourcing request'
                  }
                >
                  {isLoading ? 'Submitting…' : 'Submit Sourcing Request'}
                  {!isLoading && (
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>

                <p className="text-[10px] text-[#a8d5c4] text-center mt-3 leading-relaxed">
                  By submitting, you agree to our SSS Sourcing Terms &amp;
                  Conditions and Service Level Agreement.
                </p>

                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Lock className="w-3 h-3 text-[#a8d5c4]" aria-hidden="true" />
                  <span className="text-[10px] text-[#a8d5c4]">
                    Secure Payment via Pan-Africa Escrow
                  </span>
                </div>
              </div>

              {/* Need Help Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#e8f4f0] flex items-center justify-center flex-shrink-0">
                  <Phone
                    className="w-4 h-4 text-[#1a6b50]"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-0.5">
                    Need help filling this?
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Call our sourcing experts at{' '}
                    <a
                      href="tel:+254700000000"
                      className="text-[#1a6b50] font-semibold hover:underline"
                    >
                      +254 700 000 000
                    </a>{' '}
                    for immediate assistance.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
