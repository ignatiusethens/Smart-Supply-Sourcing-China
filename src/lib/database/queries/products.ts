import { query, transaction } from '../connection';
import { Product, ProductFilters, Specification } from '@/types';

// Get products with filtering and pagination
export async function getProducts(
  filters: ProductFilters,
  page: number = 1,
  limit: number = 20
): Promise<{ products: Product[]; total: number }> {
  const offset = (page - 1) * limit;
  
  // Build WHERE clause dynamically
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.categories.length > 0) {
    conditions.push(`p.category = ANY($${paramIndex})`);
    params.push(filters.categories);
    paramIndex++;
  }

  if (filters.availability.length > 0) {
    conditions.push(`p.availability = ANY($${paramIndex})`);
    params.push(filters.availability);
    paramIndex++;
  }

  conditions.push(`p.price >= $${paramIndex}`);
  params.push(filters.priceRange.min);
  paramIndex++;

  conditions.push(`p.price <= $${paramIndex}`);
  params.push(filters.priceRange.max);
  paramIndex++;

  if (filters.searchQuery) {
    conditions.push(`(
      p.name ILIKE $${paramIndex} OR 
      p.description ILIKE $${paramIndex} OR
      EXISTS (
        SELECT 1 FROM product_specifications ps 
        WHERE ps.product_id = p.id 
        AND (ps.label ILIKE $${paramIndex} OR ps.value ILIKE $${paramIndex})
      )
    )`);
    params.push(`%${filters.searchQuery}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    ${whereClause}
  `;
  
  const countResult = await query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);

  // Get products with specifications
  const productsQuery = `
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', ps.id,
            'productId', ps.product_id,
            'label', ps.label,
            'value', ps.value
          )
        ) FILTER (WHERE ps.id IS NOT NULL),
        '[]'::json
      ) as specifications
    FROM products p
    LEFT JOIN product_specifications ps ON p.id = ps.product_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);
  
  const result = await query(productsQuery, params);
  
  const products: Product[] = result.rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price),
    availability: row.availability,
    stockLevel: row.stock_level,
    description: row.description,
    warrantyDuration: row.warranty_duration,
    warrantyTerms: row.warranty_terms,
    depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
    depositPercentage: row.deposit_percentage,
    batchArrivalDate: row.batch_arrival_date,
    escrowDetails: row.escrow_details,
    imageUrls: row.image_urls || [],
    specifications: row.specifications || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { products, total };
}

// Get single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const productQuery = `
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', ps.id,
            'productId', ps.product_id,
            'label', ps.label,
            'value', ps.value
          )
        ) FILTER (WHERE ps.id IS NOT NULL),
        '[]'::json
      ) as specifications
    FROM products p
    LEFT JOIN product_specifications ps ON p.id = ps.product_id
    WHERE p.id = $1
    GROUP BY p.id
  `;

  const result = await query(productQuery, [id]);
  
  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price),
    availability: row.availability,
    stockLevel: row.stock_level,
    description: row.description,
    warrantyDuration: row.warranty_duration,
    warrantyTerms: row.warranty_terms,
    depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
    depositPercentage: row.deposit_percentage,
    batchArrivalDate: row.batch_arrival_date,
    escrowDetails: row.escrow_details,
    imageUrls: row.image_urls || [],
    specifications: row.specifications || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Create new product (Admin only)
export async function createProduct(productData: {
  name: string;
  category: string;
  price: number;
  availability: string;
  stockLevel: number;
  description: string;
  warrantyDuration?: string;
  warrantyTerms?: string;
  depositAmount?: number;
  depositPercentage?: number;
  batchArrivalDate?: string;
  escrowDetails?: string;
  imageUrls?: string[];
  specifications?: { label: string; value: string }[];
}): Promise<Product> {
  return await transaction(async (client) => {
    // Insert product
    const productQuery = `
      INSERT INTO products (
        name, category, price, availability, stock_level, description,
        warranty_duration, warranty_terms, deposit_amount, deposit_percentage,
        batch_arrival_date, escrow_details, image_urls
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const productResult = await client.query(productQuery, [
      productData.name,
      productData.category,
      productData.price,
      productData.availability,
      productData.stockLevel,
      productData.description,
      productData.warrantyDuration,
      productData.warrantyTerms,
      productData.depositAmount,
      productData.depositPercentage,
      productData.batchArrivalDate,
      productData.escrowDetails,
      productData.imageUrls || [],
    ]);

    const product = productResult.rows[0];

    // Insert specifications if provided
    const specifications: Specification[] = [];
    if (productData.specifications && productData.specifications.length > 0) {
      for (const spec of productData.specifications) {
        const specQuery = `
          INSERT INTO product_specifications (product_id, label, value)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        
        const specResult = await client.query(specQuery, [
          product.id,
          spec.label,
          spec.value,
        ]);
        
        specifications.push({
          id: specResult.rows[0].id,
          productId: specResult.rows[0].product_id,
          label: specResult.rows[0].label,
          value: specResult.rows[0].value,
        });
      }
    }

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      availability: product.availability,
      stockLevel: product.stock_level,
      description: product.description,
      warrantyDuration: product.warranty_duration,
      warrantyTerms: product.warranty_terms,
      depositAmount: product.deposit_amount ? parseFloat(product.deposit_amount) : undefined,
      depositPercentage: product.deposit_percentage,
      batchArrivalDate: product.batch_arrival_date,
      escrowDetails: product.escrow_details,
      imageUrls: product.image_urls || [],
      specifications,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };
  });
}

// Update product (Admin only)
export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string;
    category: string;
    price: number;
    availability: string;
    stockLevel: number;
    description: string;
    warrantyDuration: string;
    warrantyTerms: string;
    depositAmount: number;
    depositPercentage: number;
    batchArrivalDate: string;
    escrowDetails: string;
    imageUrls: string[];
  }>
): Promise<Product | null> {
  const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
  
  if (fields.length === 0) {
    return getProductById(id);
  }

  const setClause = fields.map((field, index) => {
    const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
    return `${dbField} = $${index + 2}`;
  }).join(', ');

  const values = [id, ...fields.map(field => updates[field as keyof typeof updates])];

  const updateQuery = `
    UPDATE products 
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(updateQuery, values);
  
  if (result.rows.length === 0) {
    return null;
  }

  return getProductById(id);
}

// Delete product (Admin only)
export async function deleteProduct(id: string): Promise<boolean> {
  const deleteQuery = 'DELETE FROM products WHERE id = $1';
  const result = await query(deleteQuery, [id]);
  return (result.rowCount ?? 0) > 0;
}

// Update stock level
export async function updateStockLevel(id: string, newLevel: number): Promise<boolean> {
  const updateQuery = `
    UPDATE products 
    SET stock_level = $2, updated_at = NOW()
    WHERE id = $1
  `;
  
  const result = await query(updateQuery, [id, newLevel]);
  return (result.rowCount ?? 0) > 0;
}