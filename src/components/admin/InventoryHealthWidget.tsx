'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, TrendingDown } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  stockLevel?: number;
  category: string;
  price: number;
}

interface InventoryHealthWidgetProps {
  healthScore: number;
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  totalProducts: number;
  healthyProducts: number;
  isLoading?: boolean;
  error?: string;
  onViewDetails?: () => void;
}

export function InventoryHealthWidget({
  healthScore,
  lowStockItems,
  outOfStockItems,
  totalProducts,
  healthyProducts,
  isLoading = false,
  error,
  onViewDetails,
}: InventoryHealthWidgetProps) {
  const [expandedSection, setExpandedSection] = useState<'low' | 'out' | null>(null);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const totalAlerts = lowStockItems.length + outOfStockItems.length;

  return (
    <Card className={`${getHealthBgColor(healthScore)} border`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Inventory Health
          </CardTitle>
          <div className={`text-3xl font-bold ${getHealthColor(healthScore)}`}>
            {healthScore}%
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        ) : (
          <>
            {/* Health Summary */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Healthy</div>
                <div className="text-lg font-semibold">
                  {healthyProducts}/{totalProducts}
                </div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Alerts</div>
                <div className="text-lg font-semibold text-red-600">
                  {totalAlerts}
                </div>
              </div>
            </div>

            {/* Low Stock Items */}
            {lowStockItems.length > 0 && (
              <div className="border-t pt-3">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === 'low' ? null : 'low'
                    )
                  }
                  className="flex items-center gap-2 w-full text-left text-sm font-medium text-yellow-700 hover:text-yellow-800"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Low Stock ({lowStockItems.length})
                  </span>
                </button>

                {expandedSection === 'low' && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {lowStockItems.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded p-2 text-xs border border-yellow-100"
                      >
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-gray-600">
                          Stock: {item.stockLevel} units
                        </div>
                        <div className="text-gray-500">
                          {item.category} • KES {item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {lowStockItems.length > 5 && (
                      <div className="text-xs text-gray-600 text-center py-1">
                        +{lowStockItems.length - 5} more items
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Out of Stock Items */}
            {outOfStockItems.length > 0 && (
              <div className="border-t pt-3">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === 'out' ? null : 'out'
                    )
                  }
                  className="flex items-center gap-2 w-full text-left text-sm font-medium text-red-700 hover:text-red-800"
                >
                  <TrendingDown className="h-4 w-4" />
                  <span>
                    Out of Stock ({outOfStockItems.length})
                  </span>
                </button>

                {expandedSection === 'out' && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {outOfStockItems.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded p-2 text-xs border border-red-100"
                      >
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-gray-600">Out of Stock</div>
                        <div className="text-gray-500">
                          {item.category} • KES {item.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {outOfStockItems.length > 5 && (
                      <div className="text-xs text-gray-600 text-center py-1">
                        +{outOfStockItems.length - 5} more items
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* View Details Button */}
            {onViewDetails && (
              <div className="border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewDetails}
                  className="w-full"
                >
                  View Full Report
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
