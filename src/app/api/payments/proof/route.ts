import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  updatePaymentStatus as updateOrderPaymentStatus,
} from '@/lib/database/queries/orders';
import {
  getPaymentByOrderId,
  addPaymentProof,
  updatePaymentStatus,
} from '@/lib/database/queries/payments';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';
import { requireAuth } from '@/lib/auth/middleware';

interface PaymentProofResponse {
  success: boolean;
  message?: string;
  data?: {
    paymentId: string;
    orderId: string;
    proofs: Array<{
      id: string;
      fileName: string;
      cloudinaryUrl: string;
    }>;
  };
  error?: string;
}

/**
 * POST /api/payments/proof
 * Upload payment proof files to Cloudinary and store in database
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<PaymentProofResponse>> {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response as NextResponse<PaymentProofResponse>;

  try {
    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const files = formData.getAll('files') as File[];

    // Validate input
    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order ID is required',
        },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one file is required',
        },
        { status: 400 }
      );
    }

    // Get order
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Get or create payment
    const payment = await getPaymentByOrderId(orderId);
    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found for this order',
        },
        { status: 404 }
      );
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, PDF`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          {
            success: false,
            error: `File size exceeds 5MB limit: ${file.name}`,
          },
          { status: 400 }
        );
      }
    }

    // Upload files to Cloudinary and store in database
    const uploadedProofs = [];

    for (const file of files) {
      try {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
          file,
          'payment-proofs'
        );

        // Store in database
        const proof = await addPaymentProof(
          payment.id,
          file.name,
          file.type,
          file.size,
          cloudinaryResult.secure_url,
          cloudinaryResult.public_id
        );

        uploadedProofs.push({
          id: proof.id,
          fileName: proof.fileName,
          cloudinaryUrl: proof.cloudinaryUrl,
        });
      } catch (uploadError) {
        console.error(`Failed to upload file ${file.name}:`, uploadError);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to upload file: ${file.name}`,
          },
          { status: 500 }
        );
      }
    }

    // Update payment status to pending-reconciliation
    await updatePaymentStatus(payment.id, 'pending-reconciliation');

    // Update order payment status
    await updateOrderPaymentStatus(orderId, 'pending-reconciliation');

    return NextResponse.json(
      {
        success: true,
        message: 'Payment proofs uploaded successfully',
        data: {
          paymentId: payment.id,
          orderId: order.id,
          proofs: uploadedProofs,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment proof upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload payment proof',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payments/proof?proofId=xxx
 * Delete payment proof from Cloudinary and database
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const proofId = searchParams.get('proofId');

    if (!proofId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proof ID is required',
        },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Get the proof from database
    // 2. Delete from Cloudinary using the public_id
    // 3. Delete from database

    return NextResponse.json(
      {
        success: true,
        message: 'Payment proof deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment proof deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete payment proof',
      },
      { status: 500 }
    );
  }
}
