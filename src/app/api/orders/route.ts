import { NextRequest, NextResponse } from 'next/server';
import { getUserOrders, createOrder, getAllOrders } from '@/lib/database/queries/orders';
import { createOrderSchema } from '@/lib/validation/schemas';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { Order } from '@/types';

// Get orders for current user or all orders (admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

    let orders: Order[];
    let total: number;

    if (isAdmin) {
      // Admin view - get all orders with filters
      const paymentStatus = searchParams.getAll('paymentStatus');
      const orderStatus = searchParams.getAll('orderStatus');
      const paymentMethod = searchParams.getAll('paymentMethod');

      const result = await getAllOrders(page, limit, {
        paymentStatus: paymentStatus.length > 0 ? paymentStatus : undefined,
        orderStatus: orderStatus.length > 0 ? orderStatus : undefined,
        paymentMethod: paymentMethod.length > 0 ? paymentMethod : undefined,
      });

      orders = result.orders;
      total = result.total;
    } else if (userId) {
      // User view - get their orders
      orders = await getUserOrders(userId);
      total = orders.length;
    } else {
      // Default: return all orders (for admin dashboard)
      const result = await getAllOrders(page, limit);
      orders = result.orders;
      total = result.total;
    }

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<PaginatedResponse<Order>> = {
      success: true,
      data: {
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: 'Unauthorized - user ID required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const orderData = createOrderSchema.parse(body);

    // Create order in database
    const order = await createOrder(orderData, userId);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: 'Order created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };

    return NextResponse.json(response, { status: 500 });
  }
}