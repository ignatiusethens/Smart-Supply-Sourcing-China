'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileUploader } from './FileUploader';
import { SourcingRequest } from '@/types';
import { authFetch } from '@/lib/api/auth-client';
import { useAuthStore } from '@/lib/stores/authStore';
import { Check, ArrowRight } from 'lucide-react';

interface WizardProps {
  buyerId: string;
  onSuccess?: (request: SourcingRequest) => void;
  onError?: (error: string) => void;
  errorMessage?: string;
}

export function SourcingRequestWizard({
  buyerId,
  onSuccess,
  onError,
  errorMessage,
}: WizardProps) {
  const { token: storeToken } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Form data
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [specification, setSpecification] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'air' | 'sea'>('air');
  const [destinationCity, setDestinationCity] = useState('');

  const handleSubmit = async () => {
    if (!productName.trim() || !quantity || !specification.trim()) {
      onError?.('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append('buyerId', buyerId);
      submitFormData.append('itemDescription', productName);
      submitFormData.append('specifications', specification);
      submitFormData.append('quantity', quantity);
      submitFormData.append('targetPrice', '');
      submitFormData.append('deliveryLocation', destinationCity || 'Kenya');
      submitFormData.append(
        'timeline',
        shippingMethod === 'air' ? '7-14 days' : '35-40 days'
      );
      submitFormData.append('complianceRequirements', category);

      uploadedFiles.forEach((file) =>
        submitFormData.append('attachments', file)
      );

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
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : 'Failed to create sourcing request'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToStep2 =
    productName.trim() && category && quantity && specification.trim();
  const canProceedToStep3 = canProceedToStep2 && destinationCity.trim();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-[#053018] text-white py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <div className="font-bold text-base leading-tight">
            Smart Supply
            <br />
            <span className="font-semibold text-sm">Sourcing China</span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-orange-400 transition-colors">
            Home
          </Link>
          <Link
            href="/catalog"
            className="hover:text-orange-400 transition-colors"
          >
            Services
          </Link>
          <Link href="/" className="hover:text-orange-400 transition-colors">
            About Us
          </Link>
          <Link href="/" className="hover:text-orange-400 transition-colors">
            Contact Us
          </Link>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── SIDEBAR: Progress ── */}
        <aside className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">
            Sourcing Progress
          </h2>
          <div className="relative flex flex-col gap-12">
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-300 -z-0" />

            {[
              { num: 1, label: 'Product Details' },
              { num: 2, label: 'Logistics' },
              { num: 3, label: 'Review' },
            ].map((s) => (
              <div
                key={s.num}
                className="relative z-10 flex items-center gap-4"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                    step > s.num
                      ? 'bg-[#053018] text-white'
                      : step === s.num
                        ? 'bg-[#053018] text-white'
                        : 'bg-transparent border border-gray-400'
                  }`}
                >
                  {step > s.num ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span
                      className={step === s.num ? 'font-bold' : 'text-gray-400'}
                    >
                      {s.num}
                    </span>
                  )}
                </div>
                <span
                  className={`font-semibold ${step >= s.num ? 'text-[#053018]' : 'text-gray-500'}`}
                >
                  {s.num}. {s.label}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── FORM CARD ── */}
        <section className="lg:col-span-9 bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: Product Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Product Details
              </h1>

              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Product Name<span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Category<span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="apparel">Apparel</option>
                  <option value="machinery">Machinery</option>
                  <option value="home-goods">Home Goods</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  e.g. Electronics, Apparel, Machinery, Home Goods
                </p>
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Target Quantity<span className="text-red-500">*</span>
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="specification"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Item Specification<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="specification"
                  required
                  rows={8}
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  placeholder="Describe your product specs, materials, dimensions, and any specific requirements."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <FileUploader
                onFilesSelected={setUploadedFiles}
                maxFiles={5}
                maxSizeMB={10}
                acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
              />

              <button
                type="button"
                disabled={!canProceedToStep2}
                onClick={() => setStep(2)}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
              >
                Continue to Logistics <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: Logistics */}
          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Logistics & Delivery
              </h1>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Shipping Method<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'air', label: 'Air Freight', time: '7-14 Days' },
                    { value: 'sea', label: 'Sea Freight', time: '30-45 Days' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setShippingMethod(opt.value as 'air' | 'sea')
                      }
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        shippingMethod === opt.value
                          ? 'border-[#053018] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Destination City<span className="text-red-500">*</span>
                </label>
                <input
                  id="destination"
                  type="text"
                  required
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  placeholder="e.g. Nairobi, Mombasa, Kisumu"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canProceedToStep3}
                  onClick={() => setStep(3)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                >
                  Continue to Review <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Review Your Request
              </h1>

              <div className="space-y-4 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Product Name:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {productName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {category}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {quantity} units
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Shipping:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {shippingMethod === 'air'
                        ? 'Air Freight (7-14 Days)'
                        : 'Sea Freight (30-45 Days)'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Destination:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {destinationCity || 'Not specified'}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Specifications:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {specification}
                  </p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">
                      Attached Files: {uploadedFiles.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.map((f, i) => (
                        <span
                          key={i}
                          className="text-xs bg-white border border-gray-200 px-2 py-1 rounded"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-4 px-8 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}{' '}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#042512] text-white py-12 px-6 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">S</span>
              </div>
              <div className="font-bold text-base leading-tight">
                Smart Supply
                <br />
                <span className="font-semibold text-sm">Sourcing China</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              Kenya&apos;s most trusted delivery connecting quality verified
              suppliers from China. Fast, secure, and logistics-ready.
            </p>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <span className="text-orange-500">📍</span>
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-500">✉️</span>
                <span>hello@smartsupply.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-500">📞</span>
                <span>+254 700 000 000</span>
              </div>
            </div>
          </div>
          {[
            {
              title: 'Services',
              links: [
                'Product Catalog',
                'Custom Sourcing',
                'Order Management',
                'Payment Solutions',
              ],
            },
            {
              title: 'Support',
              links: [
                'Help Center',
                'Contact Us',
                'Shipping Info',
                'Returns Policy',
              ],
            },
            {
              title: 'Legal',
              links: [
                'Privacy Policy',
                'Terms of Service',
                'Compliance',
                'Security',
              ],
            },
          ].map((col) => (
            <div key={col.title} className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                {col.title}
              </h3>
              <ul className="text-sm space-y-2 text-gray-300">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="/"
                      className="hover:text-white transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              Follow Us
            </h3>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'twitter', 'youtube'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <span className="sr-only">{s}</span>
                  <span className="text-xs">•</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest gap-2">
          <p>
            © {new Date().getFullYear()} Smart Supply Sourcing China - All
            rights reserved.
          </p>
          <p>Connecting Kenyan businesses with global suppliers</p>
        </div>
      </footer>
    </div>
  );
}
