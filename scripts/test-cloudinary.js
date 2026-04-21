#!/usr/bin/env node

/**
 * Cloudinary Connection Test Script
 * This script tests the Cloudinary configuration
 */

const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinary() {
  console.log('🚀 Testing Cloudinary connection...\n');

  try {
    // Test API connection
    console.log('📡 Testing API connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary API connection successful!');
    console.log(`   Status: ${result.status}\n`);

    // Get account details
    console.log('📊 Fetching account details...');
    const usage = await cloudinary.api.usage();
    console.log('✅ Account details retrieved:');
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   Plan: ${usage.plan || 'Free'}`);
    console.log(`   Credits Used: ${usage.credits?.usage || 0} / ${usage.credits?.limit || 'Unlimited'}`);
    console.log(`   Storage: ${(usage.storage?.usage / 1024 / 1024).toFixed(2)} MB used\n`);

    // List folders
    console.log('📁 Checking folders...');
    const folders = await cloudinary.api.root_folders();
    console.log(`✅ Found ${folders.folders.length} root folders`);
    if (folders.folders.length > 0) {
      folders.folders.forEach(folder => {
        console.log(`   - ${folder.name}`);
      });
    }
    console.log();

    console.log('🎉 Cloudinary connection test completed successfully!\n');
    console.log('💡 Tip: You can now upload images to Cloudinary through your application.');
    console.log('   Recommended folder structure:');
    console.log('   - /products - Product images');
    console.log('   - /payment-proofs - Payment proof documents');
    console.log('   - /sourcing-attachments - Sourcing request attachments');
    console.log('   - /invoice-verification - Invoice verification files\n');

  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', error.message);
    console.error('\nError details:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check that your credentials are correct in .env.local');
    console.error('   2. Verify your Cloudinary account is active');
    console.error('   3. Ensure your API key has the necessary permissions\n');
    process.exit(1);
  }
}

// Run test
testCloudinary();
