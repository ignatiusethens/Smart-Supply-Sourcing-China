'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api/auth-client';
import {
  AlertTriangle,
  TrendingDown,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Download,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  price: number;
  availability: string;
  needsRestocking: boolean;
}

interface InventoryData {
  health: {
    healthScore: number;
    lowStockItems: InventoryItem[];
    outOfStockItems: InventoryItem[];
    totalProducts: number;
    healthyProducts: number;
  };
  report: {
    items: InventoryItem[];
    total: number;
  };
}

export default function InventoryReportPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const fetchInventoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authFetch(
        `/api/admin/inventory?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load inventory data');
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventoryData();
  }, [fetchInventoryData]);

  const handleExportCSV = () => {
    if (!data?.report.items) return;

    const headers = ['Name', 'Category', 'Stock Level', 'Price', 'Status'];
    const rows = data.report.items.map((item) => [
      item.name,
      item.category,
      item.stockLevel,
      item.price,
      item.needsRestocking ? 'Needs Restocking' : 'Healthy',
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n'
    );

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.stockLevel === 0) {
      return {
        label: 'Out of Stock',
        color: 'bg-red-100 text-red-800',
        icon: <TrendingDown className="h-4 w-4" />,
      };
    }
    if (item.stockLevel < 10) {
      return {
        label: 'Low Stock',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    }
    return {
      label: 'Healthy',
      color: 'bg-green-100 text-green-800',
      icon: null,
    };
  };

  const totalPages = data ? Math.ceil(data.report.total / limit) : 1;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Inventory Report
              </h1>
              <p className="text-gray-600 mt-1">
                Detailed inventory status and restocking recommendations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchInventoryData()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!data}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Health Summary */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {data.health.healthScore}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Overall Health
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {data.health.healthyProducts}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Healthy Products
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {data.health.lowStockItems.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Low Stock Items
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {data.health.outOfStockItems.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Out of Stock</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Products ({data?.report.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : data?.report.items && data.report.items.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Product Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Category
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">
                          Stock Level
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">
                          Price (KES)
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.report.items.map((item) => {
                        const status = getStockStatus(item);
                        return (
                          <tr
                            key={item.id}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {item.category}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {item.stockLevel}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {item.price.toLocaleString('en-KE')}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${status.color}`}
                              >
                                {status.icon}
                                {status.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.needsRestocking && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  Restock
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No inventory items found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
