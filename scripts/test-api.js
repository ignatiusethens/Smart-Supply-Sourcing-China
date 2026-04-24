const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testLogin() {
  console.log('\n=== Testing Login API ===\n');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'smartsupplysourcing@gmail.com',
        password: 'admin123',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✓ Login successful!');
      console.log(`  User: ${data.user.name} (${data.user.email})`);
      console.log(`  Role: ${data.user.role}`);
      console.log(`  Status: ${data.user.status}`);
      console.log(`  Token: ${data.token.substring(0, 20)}...`);
      return data.token;
    } else {
      console.log('✗ Login failed!');
      console.log(`  Status: ${response.status}`);
      console.log(`  Error: ${data.error}`);
      return null;
    }
  } catch (error) {
    console.log('✗ Login request failed!');
    console.log(`  Error: ${error.message}`);
    return null;
  }
}

async function testProducts() {
  console.log('\n=== Testing Products API ===\n');

  try {
    const response = await fetch(`${BASE_URL}/api/products?limit=10`);
    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✓ Products API working!');
      console.log(`  Total products: ${data.data.pagination.total}`);
      console.log(`  Products returned: ${data.data.data.length}`);

      if (data.data.data.length > 0) {
        console.log('\n  Sample products:');
        data.data.data.forEach((p, i) => {
          console.log(
            `    ${i + 1}. ${p.name} - KES ${p.price} - ${p.availability}`
          );
        });
      } else {
        console.log('\n  ⚠️  No products found!');
      }
    } else {
      console.log('✗ Products API failed!');
      console.log(`  Status: ${response.status}`);
      console.log(`  Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('✗ Products request failed!');
    console.log(`  Error: ${error.message}`);
  }
}

async function testCategories() {
  console.log('\n=== Testing Categories API ===\n');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/categories`);
    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✓ Categories API working!');
      console.log(`  Total categories: ${data.data.length}`);

      if (data.data.length > 0) {
        console.log('\n  Categories:');
        data.data.forEach((c, i) => {
          console.log(`    ${i + 1}. ${c.label} (${c.slug})`);
        });
      }
    } else {
      console.log('✗ Categories API failed!');
      console.log(`  Status: ${response.status}`);
    }
  } catch (error) {
    console.log('✗ Categories request failed!');
    console.log(`  Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('Testing Smart Supply Sourcing APIs...');
  console.log('=====================================');

  await testLogin();
  await testProducts();
  await testCategories();

  console.log('\n=====================================');
  console.log('Tests complete!\n');
}

runTests();
