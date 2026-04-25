'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api/auth-client';
import { Search, Filter, ChevronLeft, ChevronRight, Users } from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'admin';
  companyName?: string;
  createdAt: string;
  orderCount?: number;
  status: 'verified' | 'pending' | 'suspended';
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/api/users');
      const data = await response.json();

      if (data.success) {
        const transformedUsers: UserRecord[] = (data.data || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyName: user.companyName,
            createdAt: user.createdAt,
            orderCount: user.orderCount || 0,
            status: user.status || 'verified',
          })
        );
        setUsers(transformedUsers);
      } else {
        console.error('Failed to fetch users:', data.error);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      if (mounted) {
        await fetchUsers();
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    try {
      const response = await authFetch(`/api/users/${userId}/suspend`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert('Failed to suspend user: ' + data.error);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  const handleRestoreUser = async (userId: string) => {
    if (!confirm('Are you sure you want to restore this user?')) return;
    try {
      const response = await authFetch(`/api/users/${userId}/restore`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert('Failed to restore user: ' + data.error);
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      alert('Failed to restore user');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Admin User &amp; Client Directory
        </h1>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name, company, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#153e2a] focus:border-[#153e2a]"
            />
          </div>
          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-10">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#153e2a]"
                    >
                      <option value="">All Roles</option>
                      <option value="buyer">Client</option>
                      <option value="admin">Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#153e2a]"
                    >
                      <option value="">All Statuses</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setRoleFilter('');
                      setStatusFilter('');
                      setShowFilterMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-slate-600 hover:text-slate-800"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Name/Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#153e2a]" />
                      <span className="ml-3">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {searchQuery || roleFilter || statusFilter
                        ? 'Try adjusting your search or filters'
                        : 'Users will appear here'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-semibold">
                        {user.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        ({user.role === 'buyer' ? 'Client' : 'Staff'})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.role === 'admin' ? (
                        <span className="text-slate-400 font-medium italic">
                          N/A
                        </span>
                      ) : (
                        <span className="text-slate-900 font-semibold">
                          {user.orderCount || 0}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === 'verified' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Verified
                        </span>
                      )}
                      {user.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          Pending
                        </span>
                      )}
                      {user.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="bg-[#2D7A5D] hover:bg-[#235E48] text-white px-4 py-1.5 font-medium transition-colors rounded"
                        >
                          Edit User
                        </button>
                        {user.status === 'suspended' ? (
                          <button
                            onClick={() => handleRestoreUser(user.id)}
                            className="border border-slate-300 text-slate-700 px-4 py-1.5 font-medium hover:bg-slate-50 transition-colors rounded"
                          >
                            Restore Account
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="border border-slate-300 text-slate-700 px-4 py-1.5 font-medium hover:bg-slate-50 transition-colors rounded"
                          >
                            Suspend Account
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-center">
            <nav className="inline-flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      currentPage === page
                        ? 'border border-emerald-200 bg-emerald-50 text-slate-700 font-semibold'
                        : 'border border-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
