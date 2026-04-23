'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { authFetch } from '@/lib/api/auth-client';
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
  Edit2,
  Package,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'pumps-motors', label: 'Pumps & Motors' },
  { value: 'energy-systems', label: 'Energy Systems' },
  { value: 'fluid-control', label: 'Fluid Control' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'storage', label: 'Storage' },
];

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  availability: string;
  stockLevel: number;
  description: string;
  imageUrls: string[];
}

interface ProductForm {
  name: string;
  category: string;
  price: string;
  availability: string;
  stockLevel: string;
  description: string;
  imageUrls: string[];
}

const EMPTY_FORM: ProductForm = {
  name: '',
  category: 'pumps-motors',
  price: '',
  availability: 'in-stock',
  stockLevel: '',
  description: '',
  imageUrls: [],
};

// ── Image carousel ────────────────────────────────────────────────────────────
function ImageCarousel({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) {
    return (
      <div className="h-40 bg-gray-100 flex items-center justify-center rounded-t-xl">
        <Package className="w-10 h-10 text-gray-300" />
      </div>
    );
  }
  return (
    <div className="relative h-40 bg-gray-100 rounded-t-xl overflow-hidden group">
      <Image
        src={images[idx]}
        alt={name}
        fill
        className="object-cover"
        unoptimized
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() =>
              setIdx((i) => (i - 1 + images.length) % images.length)
            }
            className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/products?limit=100');
      const data = await res.json();
      if (data.success) setProducts(data.data?.data || []);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 5 - form.imageUrls.length;
    if (remaining <= 0) {
      setError('Maximum 5 photos per product');
      return;
    }

    const toUpload = files.slice(0, remaining);
    setUploadingImages(true);
    setError('');

    try {
      const fd = new FormData();
      toUpload.forEach((f) => fd.append('files', f));
      fd.append('folder', 'smart-supply-sourcing/products');

      const res = await authFetch('/api/upload/cloudinary', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (data.success) {
        const urls = data.data.uploads.map(
          // Cloudinary returns snake_case secure_url
          (u: { secure_url?: string; secureUrl?: string }) =>
            u.secure_url || u.secureUrl || ''
        );
        setForm((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...urls],
        }));
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Image upload failed');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stockLevel) {
      setError('Name, price, and stock level are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        availability: form.availability,
        stockLevel: parseInt(form.stockLevel),
        description: form.description,
        imageUrls: form.imageUrls,
      };

      const res = await authFetch(
        editingId ? `/api/products/${editingId}` : '/api/products',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess(
          editingId ? 'Product updated!' : 'Product added to catalog!'
        );
        setForm(EMPTY_FORM);
        setShowForm(false);
        setEditingId(null);
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save product');
      }
    } catch {
      setError('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      availability: product.availability,
      stockLevel: String(product.stockLevel),
      description: product.description,
      imageUrls: product.imageUrls || [],
    });
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product from the catalog?')) return;
    try {
      await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch {
      setError('Failed to delete product');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Product Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add and manage products visible to buyers
          </p>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="text-base font-bold text-gray-900">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Centrifugal Pump 5HP"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, category: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Availability
                    </label>
                    <select
                      value={form.availability}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, availability: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="in-stock">In Stock</option>
                      <option value="pre-order">Pre-Order</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Price (KES) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.price}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, price: e.target.value }))
                      }
                      placeholder="85000"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Stock Level *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.stockLevel}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, stockLevel: e.target.value }))
                      }
                      placeholder="50"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Product description..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Right column — photos */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Product Photos ({form.imageUrls.length}/5)
                </label>

                {/* Upload area */}
                {form.imageUrls.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors mb-3">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-sm text-gray-500">
                      {uploadingImages
                        ? 'Uploading...'
                        : 'Click to upload photos'}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">
                      JPG, PNG up to 5MB each
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                    />
                  </label>
                )}

                {/* Preview grid */}
                {form.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {form.imageUrls.map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                      >
                        <Image
                          src={url}
                          alt={`Photo ${i + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImages}
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Product'
                    : 'Add to Catalog'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No products yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Click &quot;Add Product&quot; to add your first catalog item
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <ImageCarousel
                images={product.imageUrls || []}
                name={product.name}
              />

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                      product.availability === 'in-stock'
                        ? 'bg-green-100 text-green-700'
                        : product.availability === 'pre-order'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.availability === 'in-stock'
                      ? 'In Stock'
                      : product.availability === 'pre-order'
                        ? 'Pre-Order'
                        : 'Out'}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-2 capitalize">
                  {product.category.replace('-', ' ')}
                </p>
                <p className="text-base font-black text-blue-600 mb-3">
                  KES {product.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Stock: {product.stockLevel} units
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center justify-center w-8 h-8 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
