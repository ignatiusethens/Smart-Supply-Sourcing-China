import { NextRequest, NextResponse } from 'next/server';
import {
  getInvoiceById,
  updateInvoiceStatus,
  sendInvoice,
  markInvoiceAsPaid,
  addLogisticsNotes,
  addAdminComments,
  addInvoiceVerificationFile,
  deleteInvoiceVerificationFile,
} from '@/lib/database/queries/invoices';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch invoice',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, logisticsNotes, adminComments } = body;

    let updated;

    if (action === 'send') {
      updated = await sendInvoice(id);
    } else if (action === 'mark-paid') {
      updated = await markInvoiceAsPaid(id);
    } else if (action === 'update-status') {
      updated = await updateInvoiceStatus(id, status);
    } else if (action === 'add-logistics-notes') {
      updated = await addLogisticsNotes(id, logisticsNotes);
    } else if (action === 'add-admin-comments') {
      updated = await addAdminComments(id, adminComments);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action',
        },
        { status: 400 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update invoice',
      },
      { status: 500 }
    );
  }
}
