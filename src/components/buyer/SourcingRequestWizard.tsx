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

    // Check total file size
    const totalFileSize = uploadedFiles.reduce(
      (sum, file) => sum + file.size,
      0
    );
    const maxTotalSize = 10 * 1024 * 1024; // 10MB total
    if (totalFileSize > maxTotalSize) {
      onError?.('Total file size exceeds 10MB. Please remove some files.');
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

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error(
          'Server returned an invalid response. Please try again.'
        );
      }

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
    <div className="bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-[#053018] text-white py-3 sm:py-4 px-4 sm:px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <div className="font-bold text-sm sm:text-lg leading-tight">
            <span className="block sm:inline">Smart Supply</span>
            <br className="hidden sm:block" />
            <span className="font-semibold text-xs sm:text-sm ml-1 sm:ml-0">
              Sourcing China
            </span>
          </div>
        </div>
        <div className="hidden md:flex gap-6 lg:gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-orange-400 transition-colors">
            Home
          </Link>
          <Link
            href="/catalog"
            className="hover:text-orange-400 transition-colors"
          >
            Services
          </Link>
          <Link href="#" className="hover:text-orange-400 transition-colors">
            About Us
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-orange-400 transition-colors"
          >
            Sourcing Dashboard
          </Link>
        </div>
        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-1">
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* ── SIDEBAR: Progress ── */}
        <aside className="lg:col-span-3 mb-8 lg:mb-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900">
            Sourcing Progress
          </h2>
          <div className="relative flex flex-row lg:flex-col gap-8 lg:gap-12 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
            {/* Vertical Progress Line - hidden on mobile */}
            <div className="hidden lg:block absolute left-[15px] top-4 bottom-4 w-px bg-gray-400 -z-0" />
            {/* Horizontal Progress Line - visible on mobile */}
            <div className="lg:hidden absolute top-[15px] left-4 right-4 h-px bg-gray-400 -z-0" />

            {[
              { num: 1, label: 'Product Details' },
              { num: 2, label: 'Logistics' },
              { num: 3, label: 'Review' },
            ].map((s) => (
              <div
                key={s.num}
                className="relative z-10 flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 min-w-max lg:min-w-0"
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
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={step === s.num ? 'font-bold' : 'text-gray-400'}
                    >
                      {s.num}
                    </span>
                  )}
                </div>
                <span
                  className={`font-semibold text-sm lg:text-base text-center lg:text-left ${step >= s.num ? 'text-[#053018]' : 'text-gray-500'}`}
                >
                  <span className="lg:hidden">{s.num}.</span>
                  <span className="hidden lg:inline">{s.num}. </span>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── FORM CARD ── */}
        <section className="lg:col-span-9 bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: Product Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
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
                  rows={6}
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  placeholder="Describe your product specs, materials, dimensions, and any specific requirements."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
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
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg"
              >
                Continue to Logistics{' '}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: Logistics */}
          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                Logistics & Delivery
              </h1>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Shipping Method<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                        shippingMethod === opt.value
                          ? 'border-[#053018] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        {opt.label}
                      </p>
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:flex-1 border border-gray-300 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canProceedToStep3}
                  onClick={() => setStep(3)}
                  className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform"
                >
                  Continue to Review{' '}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                Review Your Request
              </h1>

              <div className="space-y-4 bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Product Name:</span>{' '}
                    <span className="font-semibold text-gray-900 break-words">
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
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Destination:</span>{' '}
                    <span className="font-semibold text-gray-900">
                      {destinationCity || 'Not specified'}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Specifications:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line break-words">
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
                          className="text-xs bg-white border border-gray-200 px-2 py-1 rounded break-all"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:flex-1 border border-gray-300 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}{' '}
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#042512] text-white py-8 sm:py-12 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Company Info Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">S</span>
              </div>
              <div className="font-bold text-lg leading-tight">
                Smart Supply
                <br />
                <span className="font-semibold text-sm">Sourcing China</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              Kenya&apos;s most trusted delivery connecting quality verified
              suppliers from China. Fast, secure, and logistics-ready.
            </p>
            <div className="space-y-3 text-xs">
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

          {/* Services Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              Services
            </h3>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>
                <Link
                  href="/catalog"
                  className="hover:text-white transition-colors"
                >
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/sourcing/request"
                  className="hover:text-white transition-colors"
                >
                  Custom Sourcing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-white transition-colors"
                >
                  Order Management
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Payment Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              Support
            </h3>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              Legal
            </h3>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Compliance
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              Follow Us
            </h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <span className="text-xs">f</span>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <span className="text-xs">i</span>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <span className="text-xs">t</span>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <span className="sr-only">YouTube</span>
                <span className="text-xs">y</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest gap-2 sm:gap-4">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Smart Supply Sourcing China - All
            rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Connecting Kenyan businesses with global suppliers
          </p>
        </div>
      </footer>
    </div>
  );
}
