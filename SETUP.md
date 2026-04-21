# Smart Supply Sourcing - Setup Guide

## ✅ Setup Complete!

Your application is now connected to:
- **Neon PostgreSQL Database** - Database successfully migrated with schema and seed data
- **Cloudinary** - Image and file storage configured and tested

## 📊 Database Information

### Connection Details
- **Provider**: Neon (PostgreSQL)
- **Database**: neondb
- **Region**: us-east-1 (AWS)
- **SSL**: Enabled

### Database Schema
The following tables have been created:
- `users` - User accounts (buyers and admins)
- `products` - Product catalog
- `product_specifications` - Product technical specifications
- `orders` - Customer orders
- `order_items` - Order line items
- `order_timeline` - Order status history
- `payments` - Payment records
- `payment_proofs` - Payment proof documents
- `sourcing_requests` - Custom sourcing requests
- `sourcing_attachments` - Sourcing request attachments
- `quotes` - Price quotes for sourcing requests
- `quote_line_items` - Quote line items
- `invoices` - Pro-forma invoices
- `invoice_line_items` - Invoice line items
- `invoice_verification_gallery` - Invoice verification files

### Seed Data
The database has been seeded with:
- **3 Users**:
  - Admin: `admin@smartsupply.co.ke` / `password`
  - Buyer 1: `buyer@example.com` / `password`
  - Buyer 2: `mary@manufacturing.co.ke` / `password`
- **5 Products** with specifications:
  - Centrifugal Pump 5HP (In Stock)
  - Solar Panel 300W (In Stock)
  - Industrial Generator 10KVA (Pre-order)
  - Ball Valve 2 inch (In Stock)
  - Electric Motor 3HP (Out of Stock)

## 🖼️ Cloudinary Information

### Connection Details
- **Cloud Name**: dagyy9jbn
- **Plan**: Free (25 credits/month)
- **Storage Used**: 164.45 MB
- **Credits Used**: 0.16 / 25

### Recommended Folder Structure
Create these folders in your Cloudinary dashboard for better organization:
- `/products` - Product images
- `/payment-proofs` - Payment proof documents
- `/sourcing-attachments` - Sourcing request attachments
- `/invoice-verification` - Invoice verification files

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at: http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## 🔐 Default Login Credentials

### Admin Account
- **Email**: admin@smartsupply.co.ke
- **Password**: password
- **Access**: Full admin dashboard, inventory management, order reconciliation

### Buyer Account
- **Email**: buyer@example.com
- **Password**: password
- **Access**: Product catalog, ordering, payment tracking

⚠️ **IMPORTANT**: Change these passwords before deploying to production!

## 📝 Available Scripts

### Database Management
- `npm run db:migrate` - Run database migration (create schema and seed data)
- `npm run db:test` - Test Cloudinary connection
- `npm run setup` - Run both migration and Cloudinary test

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🌐 Deploying to Vercel

### 1. Push to GitHub
Your code is already on GitHub at:
https://github.com/ignatiusethens/Smart-Supply-Sourcing-China

### 2. Connect to Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure environment variables

### 3. Environment Variables for Vercel
Add these environment variables in Vercel dashboard:

```
DATABASE_URL=postgresql://neondb_owner:npg_4t8JZNEpCmHf@ep-round-firefly-anyq1mlh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require

CLOUDINARY_CLOUD_NAME=dagyy9jbn
CLOUDINARY_API_KEY=939223875884168
CLOUDINARY_API_SECRET=ERMNmEx78ZxcmzejY6A2O55xHz4

NEXTAUTH_SECRET=your-production-secret-key-change-this
NEXTAUTH_URL=https://your-app.vercel.app

NEXT_PUBLIC_APP_NAME=Smart Supply Sourcing
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_MPESA_LIMIT=300000
NEXT_PUBLIC_SESSION_TIMEOUT=1800000
```

### 4. Deploy
Click "Deploy" and Vercel will build and deploy your application.

## 🔧 Troubleshooting

### Database Connection Issues
If you encounter database connection errors:
1. Check that DATABASE_URL is correct in .env.local
2. Verify your Neon database is active
3. Ensure SSL mode is set to 'require'
4. Check that your IP is not blocked by Neon

### Cloudinary Upload Issues
If file uploads fail:
1. Verify CLOUDINARY_CLOUD_NAME, API_KEY, and API_SECRET are correct
2. Check that your Cloudinary account has available credits
3. Ensure file sizes are within limits (Free plan: 10MB per file)
4. Verify folder permissions in Cloudinary dashboard

### Build Errors
If the build fails:
1. Run `npm run lint:fix` to fix linting errors
2. Run `npm run build` locally to test
3. Check that all environment variables are set
4. Verify all dependencies are installed

## 📚 Next Steps

1. **Update Passwords**: Change default user passwords
2. **Configure M-Pesa**: Add M-Pesa credentials for payment processing
3. **Upload Product Images**: Replace placeholder images with real product photos
4. **Customize Branding**: Update logo, colors, and branding
5. **Set Up Email**: Configure email service for notifications
6. **Enable Analytics**: Add Google Analytics or similar
7. **Security Review**: Review and update security settings
8. **Backup Strategy**: Set up automated database backups

## 🆘 Support

For issues or questions:
- Check the documentation in the `/docs` folder
- Review error logs in the console
- Check Neon dashboard for database issues
- Check Cloudinary dashboard for storage issues

## 📄 License

This project is proprietary software for Smart Supply Sourcing.
