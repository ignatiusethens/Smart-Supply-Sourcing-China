'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authFetch } from '@/lib/api/auth-client';
import {
  ArrowLeft,
  Save,
  Package,
  FileText,
  ShoppingCart,
  Users,
  DollarSign,
  FolderOpen,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  companyName?: string;
  role: 'buyer' | 'admin';
  status: 'verified' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
  orderCount: number;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<'buyer' | 'admin'>('buyer');
  const [status, setStatus] = useState<'verified' | 'pending' | 'suspended'>('verified');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUser = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authFetch(`/api/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        const userData = data.data;
        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
        setPhone(userData.phone || '');
        setCompanyName(userData.companyName || '');
        setRole(userData.role);
        setStatus(userData.status);
      } else {
        setError(data.error || 'Failed to fetch user');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);

    try {
      const updateData: {
        name: string;
        email: string;
        phone: string | null;
        companyName: string | null;
        role: 'buyer' | 'admin';
        status: 'verified' | 'pending' | 'suspended';
        password?: string;
      } = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        companyName: companyName.trim() || null,
        role,
        status,
      };

      // Only include password if it's being changed
      if (password) {
        updateData.password = password;
      }

      const response = await authFetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('User updated successfully!');
        setPassword('');
        setConfirmPassword('');
        // Refresh user data
        fetchUser();
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/admin/users');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#153e2a] text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div className="leading-none">
              <span className="block font-bold text-sm tracking-tight">SMART SUPPLY</span>
              <span className="block text-[10px] tracking-widest opacity-80 uppercase">
                Sourcing China
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <a
            href="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/15 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a
            href="/admin/sourcing"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/15 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">Requests</span>
          </a>
          <a
            href="/admin/orders"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/15 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm font-medium">Orders</span>
          </a>
          <a
            href="/admin/users"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/15 text-white"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Users (Active)</span>
          </a>
          <a
            href="/admin/financials"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/15 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Financials</span>
          </a>
          <a
            href="/admin/catalog"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/15 transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-sm font-medium">Content Inventory</span>
          </a>
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 bg-slate-300 rounded-full flex-shrink-0 flex items-center justify-center text-slate-700 font-semibold">
              JD
            </div>
            <div className="truncate">
              <p className="text-xs text-slate-300">Admin: John Doe</p>
            </div>
          </div>
          <a
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/15 transition-colors mb-2"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/15 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <button
          onClick={() => router.push('/admin/users')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#153e2a]" />
            <span className="ml-3 text-slate-600">Loading user details...</span>
          </div>
        ) : error && !user ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Edit User</h1>
              <p className="text-sm text-slate-500 mb-6">
                Update user information and account settings
              </p>

              {/* User Info Summary */}
              {user && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      User ID
                    </p>
                    <p className="text-sm font-mono text-slate-900">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Total Orders
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.role === 'admin' ? 'N/A' : user.orderCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Created
                    </p>
                    <p className="text-sm text-slate-900">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Last Updated
                    </p>
                    <p className="text-sm text-slate-900">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Edit Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#153e2a] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#153e2a] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#153e2a] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#153e2a] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Account Settings
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'buyer' | 'admin')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#153e2a] focus:border-transparent"
                      >
                        <option value="buyer">Client</option>
                        <option value="admin">Staff/Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) =>
                          setStatus(e.target.value as 'verified' | 'pending' | 'suspended')
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#153e2a] focus:border-transparent"
                      >
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Change Password
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Leave blank to keep the current password
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#153e2a] focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#153e2a] focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#2D7A5D] hover:bg-[#235E48] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/admin/users')}
                    className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
