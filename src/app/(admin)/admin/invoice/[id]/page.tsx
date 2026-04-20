'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Invoice } from '@/types';
import { InvoiceDetail } from '@/components/admin/InvoiceDetail';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        const data = await response.json();

        if (data.success) {
          setInvoice(data.data);
        } else {
          console.error('Failed to fetch invoice:', data.error);
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleSend = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'send' }),
      });

      const data = await response.json();

      if (data.success) {
        setInvoice(data.data);
        alert('Invoice sent successfully!');
      } else {
        alert('Failed to send invoice: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Error sending invoice');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark-paid' }),
      });

      const data = await response.json();

      if (data.success) {
        setInvoice(data.data);
        alert('Invoice marked as paid!');
      } else {
        alert('Failed to mark invoice as paid: ' + data.error);
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Error marking invoice as paid');
    }
  };

  const handleAddLogisticsNotes = async (id: string, notes: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'add-logistics-notes', logisticsNotes: notes }),
      });

      const data = await response.json();

      if (data.success) {
        setInvoice(data.data);
        alert('Logistics notes saved!');
      } else {
        alert('Failed to save logistics notes: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving logistics notes:', error);
      alert('Error saving logistics notes');
    }
  };

  const handleAddAdminComments = async (id: string, comments: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'add-admin-comments', adminComments: comments }),
      });

      const data = await response.json();

      if (data.success) {
        setInvoice(data.data);
        alert('Admin comments saved!');
      } else {
        alert('Failed to save admin comments: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving admin comments:', error);
      alert('Error saving admin comments');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Invoice not found</div>
      </div>
    );
  }

  return (
    <InvoiceDetail
      invoice={invoice}
      onSend={handleSend}
      onMarkAsPaid={handleMarkAsPaid}
      onAddLogisticsNotes={handleAddLogisticsNotes}
      onAddAdminComments={handleAddAdminComments}
    />
  );
}
