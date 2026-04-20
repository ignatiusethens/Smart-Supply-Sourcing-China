# Smart Supply Sourcing Platform

A full-stack B2B industrial equipment e-commerce platform designed for the Kenyan market. Built with Next.js 14+, TypeScript, PostgreSQL, and Cloudinary.

## Features

- **Product Catalog**: Browse and search industrial equipment with advanced filtering
- **Shopping Cart**: Add products to cart with quantity management
- **Payment Processing**: M-Pesa integration and bank transfer support
- **Order Tracking**: Real-time order status and payment reconciliation
- **Sourcing Requests**: Custom equipment sourcing with quote management
- **Admin Dashboard**: Order management, payment reconciliation, and analytics
- **File Management**: Cloudinary integration for images and documents

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL
- **File Storage**: Cloudinary
- **State Management**: Zustand
- **UI Components**: Radix UI primitives
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL database
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-supply-sourcing
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `CLOUDINARY_*`: Your Cloudinary credentials
- `MPESA_*`: M-Pesa Daraja API credentials (for production)

4. Set up the database:
```bash
# Run the schema creation script on your Neon database
psql $DATABASE_URL -f database/schema.sql

# Optionally, add seed data for development
psql $DATABASE_URL -f database/seed.sql
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── (buyer)/           # Buyer-facing routes
│   ├── (admin)/           # Admin-facing routes
│   ├── api/               # Backend API routes
│   └── payment/           # Payment flow pages
├── components/            # React components
│   ├── buyer/            # Buyer-specific components
│   ├── admin/            # Admin-specific components
│   ├── shared/           # Shared UI components
│   └── ui/               # Base UI primitives
├── lib/                  # Utilities and configurations
│   ├── database/         # Database connection and queries
│   ├── cloudinary/       # Cloudinary integration
│   ├── stores/           # Zustand stores
│   └── utils/            # Helper functions
└── types/                # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

The database schema is defined in `database/schema.sql` and includes tables for:
- Users (buyers and admins)
- Products and specifications
- Orders and order items
- Payments and payment proofs
- Sourcing requests and quotes
- File attachments

## API Routes

The platform provides RESTful API endpoints for:
- `/api/products` - Product management
- `/api/orders` - Order processing
- `/api/payments` - Payment handling
- `/api/quotes` - Quote management
- `/api/sourcing` - Sourcing requests
- `/api/upload` - File uploads to Cloudinary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is proprietary software. All rights reserved.
