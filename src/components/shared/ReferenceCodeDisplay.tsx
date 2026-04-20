'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatReferenceCode } from '@/lib/algorithms/referenceCode';
import { Copy, Check } from 'lucide-react';

interface ReferenceCodeDisplayProps {
  code: string;
  label?: string;
  copyable?: boolean;
}

export function ReferenceCodeDisplay({
  code,
  label = 'Reference Code',
  copyable = true,
}: ReferenceCodeDisplayProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formattedCode = formatReferenceCode(code);

  return (
    <Card className="bg-slate-50 dark:bg-slate-900">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <label 
            id="reference-code-label"
            className="text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            {label}
          </label>
          <div className="flex items-center gap-2">
            <code 
              className="flex-1 text-lg font-mono font-bold text-slate-900 dark:text-slate-50 break-all"
              aria-labelledby="reference-code-label"
            >
              {formattedCode}
            </code>
            {copyable && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label={copied ? "Reference code copied" : "Copy reference code to clipboard"}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use this code to track your order and payment
          </p>
        </div>
      </CardContent>
    </Card>
  );
}