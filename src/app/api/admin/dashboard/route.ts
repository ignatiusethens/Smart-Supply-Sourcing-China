import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { query } from '@/lib/database/connection';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.success) return auth.response;

  try {
    // Get sourcing requests count
    const sourcingResult = await query(
      `SELECT COUNT(*) as count FROM sourcing_requests WHERE status IN ('submitted', 'under-review')`
    );
    const activeSourcingRequests = parseInt(sourcingResult.rows[0].count);

    // Get open sourcing requests (last 5)
    const openRequestsResult = await query(
      `SELECT sr.id, sr.item_description, sr.quantity, sr.status, sr.created_at,
              u.name as buyer_name
       FROM sourcing_requests sr
       LEFT JOIN users u ON sr.buyer_id = u.id
       WHERE sr.status IN ('submitted', 'under-review')
       ORDER BY sr.created_at DESC
       LIMIT 5`
    );

    const openRequests = openRequestsResult.rows.map((row) => ({
      id: row.id,
      itemDescription: row.item_description,
      quantity: row.quantity,
      buyerName: row.buyer_name || 'Unknown',
      submissionDate: row.created_at,
      status: row.status,
    }));

    // Get orders data for financial metrics
    const ordersResult = await query(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN payment_status IN ('pending', 'processing') THEN total_amount ELSE 0 END) as outstanding_transfers,
        SUM(CASE WHEN payment_status = 'pending-reconciliation' THEN 1 ELSE 0 END) as pending_reconciliations,
        SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END) as daily_volume
       FROM orders`
    );

    const ordersData = ordersResult.rows[0];

    // Get inventory health
    const inventoryResult = await query(
      `SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN stock_level > 10 THEN 1 ELSE 0 END) as healthy_products,
        SUM(CASE WHEN stock_level > 0 AND stock_level <= 10 THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN stock_level = 0 THEN 1 ELSE 0 END) as out_of_stock_count
       FROM products`
    );

    const inventoryData = inventoryResult.rows[0];
    const totalProducts = parseInt(inventoryData.total_products);
    const healthyProducts = parseInt(inventoryData.healthy_products);
    const healthScore =
      totalProducts > 0
        ? Math.round((healthyProducts / totalProducts) * 100)
        : 0;

    // Get low stock items
    const lowStockResult = await query(
      `SELECT id, name, stock_level, category, price
       FROM products
       WHERE stock_level > 0 AND stock_level <= 10
       ORDER BY stock_level ASC
       LIMIT 5`
    );

    const lowStockItems = lowStockResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      stockLevel: row.stock_level,
      category: row.category,
      price: parseFloat(row.price),
    }));

    // Get out of stock items
    const outOfStockResult = await query(
      `SELECT id, name, category, price
       FROM products
       WHERE stock_level = 0
       ORDER BY name ASC
       LIMIT 5`
    );

    const outOfStockItems = outOfStockResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: parseFloat(row.price),
    }));

    // Get recent activity (recent orders with payment info)
    const recentActivityResult = await query(
      `SELECT o.id, o.reference_code, o.total_amount, o.payment_status, o.created_at,
              u.name as buyer_name
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    const recentActivity = recentActivityResult.rows.map((row) => ({
      id: row.id,
      ref: row.reference_code || `ORD-${row.id.slice(0, 8).toUpperCase()}`,
      buyer: row.buyer_name || 'Unknown',
      amount: parseFloat(row.total_amount) || 0,
      status: row.payment_status || 'pending',
      date: row.created_at,
    }));

    // Generate priority tasks based on actual data
    const priorityTasks = [];

    const pendingReconCount = parseInt(ordersData.pending_reconciliations) || 0;
    if (pendingReconCount > 0) {
      priorityTasks.push({
        id: 1,
        label: `Reconcile ${pendingReconCount} pending bank transfer${pendingReconCount > 1 ? 's' : ''}`,
        done: false,
        urgent: pendingReconCount >= 3,
      });
    }

    if (activeSourcingRequests > 0) {
      priorityTasks.push({
        id: 2,
        label: `Review ${activeSourcingRequests} sourcing request${activeSourcingRequests > 1 ? 's' : ''}`,
        done: false,
        urgent: activeSourcingRequests >= 5,
      });
    }

    const lowStockCount = parseInt(inventoryData.low_stock_count) || 0;
    if (lowStockCount > 0) {
      priorityTasks.push({
        id: 3,
        label: `Update inventory for ${lowStockCount} low-stock item${lowStockCount > 1 ? 's' : ''}`,
        done: false,
        urgent: lowStockCount >= 5,
      });
    }

    const outOfStockCount = parseInt(inventoryData.out_of_stock_count) || 0;
    if (outOfStockCount > 0) {
      priorityTasks.push({
        id: 4,
        label: `Restock ${outOfStockCount} out-of-stock item${outOfStockCount > 1 ? 's' : ''}`,
        done: false,
        urgent: outOfStockCount >= 3,
      });
    }

    // Add a default task if no urgent items
    if (priorityTasks.length === 0) {
      priorityTasks.push({
        id: 5,
        label: 'All tasks completed - system running smoothly',
        done: true,
        urgent: false,
      });
    }

    const dashboardData = {
      kpis: {
        outstandingTransfers: parseFloat(ordersData.outstanding_transfers) || 0,
        pendingReconciliations:
          parseInt(ordersData.pending_reconciliations) || 0,
        activeSourcingRequests,
        dailyTransactionVolume: parseFloat(ordersData.daily_volume) || 0,
        ledgerHealthScore: 85, // Can be calculated based on reconciliation rate
      },
      inventoryHealth: {
        healthScore,
        lowStockItems,
        outOfStockItems,
        totalProducts,
        healthyProducts,
      },
      openRequests,
      recentActivity,
      priorityTasks,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
      },
      { status: 500 }
    );
  }
}
