import { NextRequest, NextResponse } from 'next/server';
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from '@/lib/database/queries/products';
import { updateProductSchema } from '@/lib/validation/schemas';
import { ApiResponse } from '@/types/api';
import { Product } from '@/types';
import { requireAdmin } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      const response: ApiResponse = {
        success: false,
        error: 'Product not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching product:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const updates = updateProductSchema.parse(body);
    const product = await updateProduct(id, updates);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update product',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete product',
      },
      { status: 500 }
    );
  }
}
