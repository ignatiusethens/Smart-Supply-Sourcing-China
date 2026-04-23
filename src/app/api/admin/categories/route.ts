import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getPool } from '@/lib/database/connection';

// GET /api/admin/categories — list all categories
export async function GET() {
  try {
    const db = getPool();
    const result = await db.query(
      'SELECT id, slug, label, sort_order FROM product_categories ORDER BY sort_order ASC, label ASC'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch {
    // Fallback to hardcoded list if table doesn't exist yet
    return NextResponse.json({
      success: true,
      data: [
        {
          id: '1',
          slug: 'pumps-motors',
          label: 'Pumps & Motors',
          sort_order: 1,
        },
        {
          id: '2',
          slug: 'energy-systems',
          label: 'Energy Systems',
          sort_order: 2,
        },
        {
          id: '3',
          slug: 'fluid-control',
          label: 'Fluid Control',
          sort_order: 3,
        },
        { id: '4', slug: 'electrical', label: 'Electrical', sort_order: 4 },
        { id: '5', slug: 'storage', label: 'Storage', sort_order: 5 },
      ],
    });
  }
}

// POST /api/admin/categories — create a new category
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { label } = await request.json();
    if (!label?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Label is required' },
        { status: 400 }
      );
    }

    const slug = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const db = getPool();

    const result = await db.query(
      `INSERT INTO product_categories (slug, label, sort_order)
       VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM product_categories))
       ON CONFLICT (slug) DO NOTHING
       RETURNING id, slug, label, sort_order`,
      [slug, label.trim()]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
