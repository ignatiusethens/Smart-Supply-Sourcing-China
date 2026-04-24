'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  moq: number;
  image: string;
  trending?: boolean;
  featured?: boolean;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'High-Performance Smartphone X10',
    price: 15000,
    moq: 50,
    image: '/api/placeholder/300/200',
    trending: true,
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirts - Bulk',
    price: 500,
    moq: 200,
    image: '/api/placeholder/300/200',
    trending: true,
  },
  {
    id: '3',
    name: 'Industrial Cordless Drill Set',
    price: 8000,
    moq: 10,
    image: '/api/placeholder/300/200',
    trending: true,
  },
  {
    id: '4',
    name: 'Luxury Skincare Set - 5 Piece',
    price: 3200,
    moq: 100,
    image: '/api/placeholder/400/350',
    trending: true,
    featured: true,
  },
  {
    id: '5',
    name: 'Ceramic Brake Pads - Universal',
    price: 8000,
    moq: 10,
    image: '/api/placeholder/300/250',
  },
  {
    id: '6',
    name: 'Power Promoting Coverage',
    price: 6500,
    moq: 20,
    image: '/api/placeholder/300/200',
  },
  {
    id: '7',
    name: 'Cars & Parts - B Supply',
    price: 3200,
    moq: 100,
    image: '/api/placeholder/300/200',
  },
  {
    id: '8',
    name: 'Cosmetic Art Set - Piece',
    price: 3200,
    moq: 100,
    image: '/api/placeholder/300/200',
  },
];

const categories = [
  'Electronics',
  'Textiles & Apparel',
  'Machinery & Tools',
  'Home & Garden',
  'Beauty & Personal Care',
  'Automotive Parts',
  'Office Supplies',
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [moqRange, setMoqRange] = useState({ min: '', max: '' });
  const [shippingFilters, setShippingFilters] = useState<string[]>([]);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleShippingFilter = (filter: string) => {
    setShippingFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="bg-[#002d1a] text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex flex-col leading-tight min-w-max">
            <span className="text-2xl font-bold tracking-tight">
              Smart Supply
            </span>
            <span className="text-[10px] uppercase opacity-80 tracking-widest">
              Sourcing China
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-grow max-w-2xl">
            <div className="relative flex">
              <input
                className="w-full py-2 px-4 rounded-l text-gray-800 focus:outline-none focus:ring-0 border-none"
                placeholder="Search for products, suppliers, categories..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="bg-gray-800 px-4 py-2 rounded-r flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/login" className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Log In / Sign Up
            </Link>
            <Link href="/cart" className="bg-[#f47a20] p-2 rounded relative">
              <ShoppingCart className="w-5 h-5" fill="white" />
            </Link>
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <nav className="bg-[#002d1a] border-t border-green-900 text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex gap-8">
          <Link href="/" className="hover:text-gray-300 transition-colors">
            Home
          </Link>
          <Link
            href="/services"
            className="hover:text-gray-300 transition-colors"
          >
            Services
          </Link>
          <Link href="/about" className="hover:text-gray-300 transition-colors">
            About Us
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-gray-300 transition-colors"
          >
            Sourcing Dashboard
          </Link>
          <div className="flex items-center gap-1 cursor-pointer">
            <span>Categories</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer">
            <span>Textiles & Apparel</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer">
            <span>Beauty & Health</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            {/* Categories Section */}
            <div className="mb-8">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4">
                Categories
              </h3>
              <ul className="space-y-2 text-sm text-gray-500">
                {categories.map((category, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200"></div>
                    {category}
                  </li>
                ))}
              </ul>
            </div>

            {/* Filters Section */}
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 border-t pt-4">
                Filters
              </h3>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2">
                  Price Range
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    className="w-1/2 text-xs border-gray-300 rounded p-1"
                    placeholder="KES 0"
                    type="text"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-1/2 text-xs border-gray-300 rounded p-1"
                    placeholder="KES 50,000+"
                    type="text"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="h-1 bg-gray-200 rounded relative">
                  <div className="absolute inset-y-0 left-0 right-1/4 bg-[#f47a20] rounded"></div>
                  <div className="absolute -top-1 right-1/4 w-3 h-3 bg-white border-2 border-orange-500 rounded-full"></div>
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6 space-y-2">
                <button className="text-xs text-gray-600 flex items-center justify-between w-full hover:text-gray-800">
                  Price: Low to High
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button className="text-xs text-gray-600 flex items-center justify-between w-full hover:text-gray-800">
                  Price: High to Low
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              {/* Shipping Time */}
              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2">
                  Shipping Time
                </label>
                <div className="space-y-1">
                  {[
                    'Express (1-5 Days)',
                    'Standard (7-14 Days)',
                    'Sea Freight (30-45 Days)',
                  ].map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <input
                        className="rounded text-orange-500 focus:ring-orange-500 w-3 h-3"
                        type="checkbox"
                        checked={shippingFilters.includes(option)}
                        onChange={() => handleShippingFilter(option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* MOQ */}
              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2">MOQ</label>
                <div className="flex gap-2">
                  <input
                    className="w-1/2 text-xs border-gray-300 rounded p-1"
                    placeholder="MIN"
                    type="text"
                    value={moqRange.min}
                    onChange={(e) =>
                      setMoqRange((prev) => ({ ...prev, min: e.target.value }))
                    }
                  />
                  <input
                    className="w-1/2 text-xs border-gray-300 rounded p-1"
                    placeholder="MAX"
                    type="text"
                    value={moqRange.max}
                    onChange={(e) =>
                      setMoqRange((prev) => ({ ...prev, max: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Shipping Origins */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold">
                    Shipping Origins
                  </label>
                  <button className="text-[10px] text-gray-400 hover:text-gray-600">
                    Show on Map
                  </button>
                </div>
                <div className="rounded overflow-hidden">
                  <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Section */}
          <section className="flex-grow">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {mockProducts.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 border border-gray-100 flex flex-col h-full hover:shadow-lg transition-shadow"
                >
                  <label className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                    <input
                      className="w-3 h-3 rounded border-gray-300"
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelect(product.id)}
                    />
                    Compare
                  </label>
                  <div className="bg-gray-100 flex-grow mb-4 relative min-h-[200px] flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        Product Image
                      </span>
                    </div>
                    {product.trending && (
                      <span className="absolute bottom-2 left-2 bg-[#f47a20] text-[9px] text-white px-2 py-0.5 font-bold italic">
                        TRENDING NOW
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm mb-1">{product.name}</h4>
                  <div className="text-xs font-bold mb-1">
                    KES {product.price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400 mb-2">
                    MOQ: {product.moq} UNITS
                  </div>
                  <div className="h-2 w-15 bg-gradient-to-r from-[#f47a20] to-orange-400 rounded-full mb-4 mx-auto"></div>
                  <button className="bg-[#f47a20] text-white text-xs font-bold py-2 w-full rounded hover:bg-orange-600 transition-colors">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {/* Row 2 (Featured Wide Item) */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Featured Large Card (Spans 2 columns) */}
              <div className="bg-white p-4 border border-gray-100 flex flex-col col-span-2 h-full hover:shadow-lg transition-shadow">
                <label className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                  <input
                    className="w-3 h-3 rounded border-gray-300"
                    type="checkbox"
                    checked={selectedProducts.includes(mockProducts[3].id)}
                    onChange={() => handleProductSelect(mockProducts[3].id)}
                  />
                  Compare
                </label>
                <div className="bg-gray-100 flex-grow mb-4 relative flex items-center justify-center p-8 min-h-[350px]">
                  <div className="w-full h-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center rounded">
                    <span className="text-pink-700 text-lg font-semibold">
                      Luxury Skincare
                    </span>
                  </div>
                  <span className="absolute top-4 right-4 bg-[#f47a20] text-[9px] text-white px-3 py-1 font-bold italic tracking-wider">
                    TRENDING NOW
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <h4 className="font-bold text-base mb-1">
                    {mockProducts[3].name}
                  </h4>
                  <div className="text-lg font-bold mb-1">
                    KES {mockProducts[3].price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400 mb-4 uppercase">
                    MOQ: {mockProducts[3].moq} Units
                  </div>
                  <div className="h-2 w-15 bg-gradient-to-r from-[#f47a20] to-orange-400 rounded-full mb-4"></div>
                  <button className="bg-[#f47a20] text-white text-sm font-bold py-3 w-full rounded hover:bg-orange-600 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product 4 */}
              <div className="bg-white p-4 border border-gray-100 flex flex-col h-full hover:shadow-lg transition-shadow">
                <label className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                  <input
                    className="w-3 h-3 rounded border-gray-300"
                    type="checkbox"
                    checked={selectedProducts.includes(mockProducts[4].id)}
                    onChange={() => handleProductSelect(mockProducts[4].id)}
                  />
                  Compare
                </label>
                <div className="bg-gray-100 flex-grow mb-4 relative min-h-[250px] flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Brake Pads</span>
                  </div>
                </div>
                <h4 className="font-bold text-sm mb-1">
                  {mockProducts[4].name}
                </h4>
                <div className="text-xs font-bold mb-1">
                  KES {mockProducts[4].price.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 mb-2">
                  MOQ: {mockProducts[4].moq} UNITS
                </div>
                <div className="h-2 w-15 bg-gradient-to-r from-[#f47a20] to-orange-400 rounded-full mb-4 mx-auto"></div>
                <button className="bg-[#f47a20] text-white text-xs font-bold py-2 w-full rounded hover:bg-orange-600 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              {mockProducts.slice(5, 8).map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 border border-gray-100 flex flex-col h-full hover:shadow-lg transition-shadow"
                >
                  <label className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                    <input
                      className="w-3 h-3 rounded border-gray-300"
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelect(product.id)}
                    />
                    Compare
                  </label>
                  <div className="bg-gray-100 flex-grow mb-4 min-h-[200px] flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Product</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm mb-1">{product.name}</h4>
                  <div className="text-xs font-bold mb-1">
                    KES {product.price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400 mb-2">
                    MOQ: {product.moq} UNITS
                  </div>
                  <div className="h-2 w-15 bg-gradient-to-r from-[#f47a20] to-orange-400 rounded-full mb-4 mx-auto"></div>
                  <button className="bg-[#f47a20] text-white text-xs font-bold py-2 w-full rounded hover:bg-orange-600 transition-colors">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 text-xs font-medium text-gray-500">
              <button className="hover:text-gray-800 transition-colors">
                Previous
              </button>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded bg-[#002d1a] text-white flex items-center justify-center">
                  1
                </button>
                <button className="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center transition-colors">
                  2
                </button>
                <button className="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center transition-colors">
                  3
                </button>
              </div>
              <button className="hover:text-gray-800 transition-colors">
                Next
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#002d1a] text-white py-12 mt-12 border-t-4 border-orange-500">
        <div className="container mx-auto px-4 grid grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex flex-col leading-tight mb-6">
              <span className="text-xl font-bold">Smart Supply Sourcing</span>
              <span className="text-xl font-bold">China</span>
            </div>
            <div className="text-xs text-gray-400 space-y-4">
              <p>
                Garden Ravens Street, Mong Pang,
                <br />
                China, Guangdong, H1, 41200
              </p>
              <p className="flex items-center gap-2">
                <span>📞</span>
                +81 0284601230
              </p>
              <p className="flex items-center gap-2">
                <span>✉️</span>
                support@smartsupply.com
              </p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-sm mb-6">Services</h4>
            <ul className="text-xs text-gray-400 space-y-3">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Electronics Online
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Textiles & Apparel
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Machinery & Tools
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Home & Garden
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm mb-6">Support</h4>
            <ul className="text-xs text-gray-400 space-y-3">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Get Support
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-sm mb-6">Legal</h4>
            <ul className="text-xs text-gray-400 space-y-3">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Statement
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500">
          <p>Copyright @ Smart Supply Sourcing China</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Legal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
