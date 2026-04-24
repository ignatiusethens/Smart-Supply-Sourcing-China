const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCatalogFilters() {
  console.log('\n=== Testing Catalog with Different Filters ===\n');

  // Test 1: No filters
  console.log('1. No filters (default):');
  let response = await fetch(`${BASE_URL}/api/products?limit=20`);
  let data = await response.json();
  console.log(`   Products: ${data.data?.data?.length || 0}`);
  console.log(`   Total: ${data.data?.pagination?.total || 0}`);

  // Test 2: With category filter
  console.log('\n2. With category filter (electrical):');
  response = await fetch(
    `${BASE_URL}/api/products?categories=electrical&limit=20`
  );
  data = await response.json();
  console.log(`   Products: ${data.data?.data?.length || 0}`);
  console.log(`   Total: ${data.data?.pagination?.total || 0}`);

  // Test 3: With price range
  console.log('\n3. With price range (0-10000):');
  response = await fetch(
    `${BASE_URL}/api/products?minPrice=0&maxPrice=10000&limit=20`
  );
  data = await response.json();
  console.log(`   Products: ${data.data?.data?.length || 0}`);
  console.log(`   Total: ${data.data?.pagination?.total || 0}`);

  // Test 4: With availability filter
  console.log('\n4. With availability filter (in-stock):');
  response = await fetch(
    `${BASE_URL}/api/products?availability=in-stock&limit=20`
  );
  data = await response.json();
  console.log(`   Products: ${data.data?.data?.length || 0}`);
  console.log(`   Total: ${data.data?.pagination?.total || 0}`);

  // Test 5: All products in database
  console.log('\n5. Checking database directly:');
  const { Pool } = require('pg');
  require('dotenv').config({ path: '.env.local' });

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const result = await pool.query(
    'SELECT id, name, category, price, availability, stock_level FROM products ORDER BY created_at DESC'
  );
  console.log(`   Total in database: ${result.rows.length}`);

  if (result.rows.length > 0) {
    console.log('\n   All products in database:');
    result.rows.forEach((p, i) => {
      console.log(
        `     ${i + 1}. ${p.name} - ${p.category} - KES ${p.price} - ${p.availability} - Stock: ${p.stock_level}`
      );
    });
  }

  await pool.end();
}

testCatalogFilters();
