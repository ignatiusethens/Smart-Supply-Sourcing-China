const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Checking database connection...');

    // Check users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n✓ Users table: ${usersResult.rows[0].count} users found`);

    // Check if status column exists
    const statusCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'status'
    `);
    console.log(
      `✓ Status column exists: ${statusCheck.rows.length > 0 ? 'YES' : 'NO'}`
    );

    // Check products
    const productsResult = await pool.query(
      'SELECT COUNT(*) as count FROM products'
    );
    console.log(
      `✓ Products table: ${productsResult.rows[0].count} products found`
    );

    // Show sample products
    const sampleProducts = await pool.query(
      'SELECT id, name, category, price, availability FROM products LIMIT 5'
    );
    if (sampleProducts.rows.length > 0) {
      console.log('\nSample products:');
      sampleProducts.rows.forEach((p, i) => {
        console.log(
          `  ${i + 1}. ${p.name} - ${p.category} - KES ${p.price} - ${p.availability}`
        );
      });
    } else {
      console.log('\n⚠️  No products found in database!');
    }

    // Check categories
    const categoriesResult = await pool.query(
      'SELECT DISTINCT category FROM products'
    );
    console.log(
      `\n✓ Categories: ${categoriesResult.rows.map((r) => r.category).join(', ')}`
    );

    // Check user details
    const userDetails = await pool.query(
      'SELECT email, role, status FROM users LIMIT 5'
    );
    console.log('\nUser details:');
    userDetails.rows.forEach((u, i) => {
      console.log(
        `  ${i + 1}. ${u.email} - ${u.role} - ${u.status || 'NO STATUS'}`
      );
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
