import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/database/queries/products';
import { productFiltersSchema, createProductSchema } from '@/lib/validation/schemas';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const categories = searchParams.getAll('categories');
    const availability = searchParams.getAll('availability');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : Number.MAX_SAFE_INTEGER;
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

    // Validate filters
    const filters = productFiltersSchema.parse({
      categories,
      availability,
      priceRange: { min: minPrice, max: maxPrice },
      searchQuery: search,
    });

    // Get products from database
    const { products, total } = await getProducts(filters, page, limit);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<PaginatedResponse<Product>> = {
      success: true,
      data: {
        data: products,
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
    console.error('Error fetching products:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication (TODO: implement proper auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const response: ApiResponse = {
        success: false,
        error: 'Unauthorized',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const productData = createProductSchema.parse(body);

    // Create product in database
    const product = await createProduct(productData);

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
      message: 'Product created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };

    return NextResponse.json(response, { status: 500 });
  }
}