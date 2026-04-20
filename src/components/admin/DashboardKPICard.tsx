'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, TrendingUp, AlertCircle } from 'lucide-react';
import { useAnnouncer } from '@/lib/hooks/useAccessibility';

interface DashboardKPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  onClick?: () => void;
  isLoading?: boolean;
  error?: string;
  variant?: 'default' | 'warning' | 'success';
  description?: string;
}

export function DashboardKPICard({
  title,
  value,
  unit,
  icon,
  trend,
  onClick,
  isLoading = false,
  error,
  variant = 'default',
  description,
}: DashboardKPICardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { announce } = useAnnouncer();

  const variantStyles = {
    default: 'border-gray-200 hover:border-gray-300',
    warning: 'border-yellow-200 bg-yellow-50 hover:border-yellow-300',
    success: 'border-green-200 bg-green-50 hover:border-green-300',
  };

  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    // Announce state change to screen readers
    announce(
      `${title} card ${newExpanded ? 'expanded' : 'collapsed'}`,
      'polite'
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  const trendDescription = trend 
    ? `${trend.direction === 'up' ? 'increased' : trend.direction === 'down' ? 'decreased' : 'unchanged'} by ${trend.percentage}%`
    : '';

  return (
    <Card
      className={`transition-all ${variantStyles[variant]} ${
        isLoading ? 'opacity-50' : ''
      } ${onClick ? 'cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2' : ''}`}
      onClick={onClick ? handleCardClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'region'}
      aria-expanded={onClick ? isExpanded : undefined}
      aria-label={`${title}: ${formattedValue}${unit ? ` ${unit}` : ''}${trendDescription ? `. ${trendDescription}` : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="text-2xl" aria-hidden="true">
                {icon}
              </div>
            )}
            <CardTitle className="text-sm font-medium text-gray-600">
              {title}
            </CardTitle>
          </div>
          {onClick && (
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div 
            className="flex items-center gap-2 text-red-600"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">{error}</span>
          </div>
        ) : isLoading ? (
          <div 
            className="h-8 bg-gray-200 rounded animate-pulse"
            role="status"
            aria-label="Loading KPI data"
          />
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span 
                className="text-3xl font-bold text-gray-900"
                aria-label={`${formattedValue}${unit ? ` ${unit}` : ''}`}
              >
                {formattedValue}
              </span>
              {unit && (
                <span className="text-sm text-gray-600" aria-hidden="true">
                  {unit}
                </span>
              )}
            </div>

            {trend && (
              <div 
                className={`flex items-center gap-1 mt-2 text-sm ${trendColor[trend.direction]}`}
                aria-label={trendDescription}
              >
                <TrendingUp
                  className={`h-4 w-4 ${
                    trend.direction === 'down' ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
                <span aria-hidden="true">
                  {trend.direction === 'up' ? '+' : ''}
                  {trend.percentage}%
                </span>
              </div>
            )}

            {description && (
              <p className="text-xs text-gray-500 mt-2">{description}</p>
            )}
          </>
        )}
      </CardContent>

      {isExpanded && onClick && (
        <div className="border-t px-4 py-3 bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            aria-label={`View details for ${title}`}
          >
            View Details
          </Button>
        </div>
      )}
    </Card>
  );
}
