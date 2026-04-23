import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getPool } from '@/lib/database/connection';

// PUT /api/admin/categories/[id] — rename a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const { label } = await request.json();
    if (!label?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Label is required' },
        { status: 400 }
      );
    }

    const db = getPool();
    const result = await db.query(
      'UPDATE product_categories SET label = $1 WHERE id = $2 RETURNING id, slug, label, sort_order',
      [label.trim(), id]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] — remove a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const db = getPool();

    const cat = await db.query(
      'SELECT slug FROM product_categories WHERE id = $1',
      [id]
    );
    if (cat.rows.length) {
      await db.query(
        "UPDATE products SET category = 'uncategorised' WHERE category = $1",
        [cat.rows[0].slug]
      );
    }

    await db.query('DELETE FROM product_categories WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
