'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SourcingRequest } from '@/types';
import { authFetch } from '@/lib/api/auth-client';
import { SourcingRequestDetail } from '@/components/admin/SourcingRequestDetail';
import { ProFormaInvoiceGenerator } from '@/components/admin/ProFormaInvoiceGenerator';

export default function SourcingRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<SourcingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/sourcing/requests/${requestId}`);
        const data = await response.json();

        if (data.success) {
          setRequest(data.data);
        } else {
          console.error('Failed to fetch sourcing request:', data.error);
        }
      } catch (error) {
        console.error('Error fetching sourcing request:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const handleUpdateStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/sourcing/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        setRequest(data.data);
        if (status === 'under-review') {
          setShowInvoiceGenerator(true);
        }
      } else {
        alert('Failed to update status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handleGenerateInvoice = async (
    lineItemsData: Record<string, unknown>
  ) => {
    setIsGeneratingInvoice(true);
    try {
      const response = await authFetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerId: request?.buyerId,
          sourcingRequestId: requestId,
          lineItems: lineItemsData.lineItems,
          termsAndConditions: lineItemsData.termsAndConditions,
          paymentInstructions: lineItemsData.paymentInstructions,
          settlementInstructions: lineItemsData.settlementInstructions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Invoice generated successfully!');
        setShowInvoiceGenerator(false);
        // Refresh the request to show updated status
        const refreshResponse = await fetch(
          `/api/sourcing/requests/${requestId}`
        );
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setRequest(refreshData.data);
        }
      } else {
        alert('Failed to generate invoice: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Sourcing request not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showInvoiceGenerator ? (
        <SourcingRequestDetail
          request={request}
          onUpdateStatus={handleUpdateStatus}
          onGenerateInvoice={() => setShowInvoiceGenerator(true)}
        />
      ) : (
        <ProFormaInvoiceGenerator
          sourcingRequest={request}
          onGenerate={handleGenerateInvoice}
          isLoading={isGeneratingInvoice}
        />
      )}
    </div>
  );
}
