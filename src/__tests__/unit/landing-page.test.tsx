import { render, screen } from '@testing-library/react';
import { LandingPage } from '@/components/buyer/LandingPage';
import { Product, Quote } from '@/types';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

describe('LandingPage Component', () => {
  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Centrifugal Pump',
    category: 'pumps-motors',
    price: 45000,
    availability: 'in-stock',
    stockLevel: 10,
    description: 'High-performance centrifugal pump',
    warrantyDuration: '2 years',
    warrantyTerms: 'Full coverage',
    imageUrls: ['https://example.com/pump.jpg'],
    specifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockQuote: Quote = {
    id: 'quote-1',
    sourcingRequestId: 'req-1',
    buyerId: 'buyer-1',
    totalAmount: 150000,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    lineItems: [
      {
        id: 'item-1',
        quoteId: 'quote-1',
        description: 'Custom Motor',
        quantity: 2,
        unitPrice: 75000,
        subtotal: 150000,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  describe('Hero Section', () => {
    it('should render hero section with title and CTA buttons', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      expect(screen.getByText('Smart Supply Sourcing Platform')).toBeInTheDocument();
      expect(
        screen.getByText('Your trusted partner for industrial equipment sourcing in Kenya')
      ).toBeInTheDocument();
      expect(screen.getAllByText('Browse Catalog').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Request Custom Quote').length).toBeGreaterThan(0);
    });

    it('should have correct navigation links in hero', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      const browseLink = screen.getAllByText('Browse Catalog')[0].closest('a');
      const quoteLink = screen.getAllByText('Request Custom Quote')[0].closest('a');

      expect(browseLink).toHaveAttribute('href', '/catalog');
      expect(quoteLink).toHaveAttribute('href', '/sourcing/request');
    });
  });

  describe('Featured Products Section', () => {
    it('should render featured products section title', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      expect(screen.getByText('Featured Products')).toBeInTheDocument();
    });

    it('should display featured products', () => {
      render(<LandingPage featuredProducts={[mockProduct]} recentQuotes={[]} />);

      expect(screen.getByText('Centrifugal Pump')).toBeInTheDocument();
      expect(screen.getByText('High-performance centrifugal pump')).toBeInTheDocument();
      expect(screen.getByText('KES 45,000')).toBeInTheDocument();
      expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('should display multiple featured products', () => {
      const products = [
        mockProduct,
        { ...mockProduct, id: 'prod-2', name: 'Electric Motor' },
        { ...mockProduct, id: 'prod-3', name: 'Hydraulic Pump' },
      ];

      render(<LandingPage featuredProducts={products} recentQuotes={[]} />);

      expect(screen.getByText('Centrifugal Pump')).toBeInTheDocument();
      expect(screen.getByText('Electric Motor')).toBeInTheDocument();
      expect(screen.getByText('Hydraulic Pump')).toBeInTheDocument();
    });

    it('should show empty state when no products', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      expect(
        screen.getByText('No featured products available at the moment.')
      ).toBeInTheDocument();
    });

    it('should display correct availability badges', () => {
      const inStockProduct = { ...mockProduct, availability: 'in-stock' as const };
      const preOrderProduct = { ...mockProduct, id: 'prod-2', availability: 'pre-order' as const };
      const outOfStockProduct = {
        ...mockProduct,
        id: 'prod-3',
        availability: 'out-of-stock' as const,
      };

      render(
        <LandingPage
          featuredProducts={[inStockProduct, preOrderProduct, outOfStockProduct]}
          recentQuotes={[]}
        />
      );

      expect(screen.getByText('In Stock')).toBeInTheDocument();
      expect(screen.getByText('Pre-Order')).toBeInTheDocument();
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('should link to product detail page', () => {
      render(<LandingPage featuredProducts={[mockProduct]} recentQuotes={[]} />);

      const productLink = screen.getByText('Centrifugal Pump').closest('a');
      expect(productLink).toHaveAttribute('href', `/product/${mockProduct.id}`);
    });
  });

  describe('Recent Quotes Section', () => {
    it('should render recent quotes section when quotes exist', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[mockQuote]} />);

      expect(screen.getByText('Recent Quotes')).toBeInTheDocument();
    });

    it('should not render recent quotes section when no quotes', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      expect(screen.queryByText('Recent Quotes')).not.toBeInTheDocument();
    });

    it('should display quote information', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[mockQuote]} />);

      expect(screen.getByText('KES 150,000')).toBeInTheDocument();
      expect(screen.getByText('1 item')).toBeInTheDocument();
      expect(screen.getByText('Review Quote')).toBeInTheDocument();
    });

    it('should display days remaining for quote', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[mockQuote]} />);

      // Should show "7 days left" or similar
      const daysText = screen.getByText(/\d+ days left/);
      expect(daysText).toBeInTheDocument();
    });

    it('should link to quote review page', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[mockQuote]} />);

      const quoteLink = screen.getByText('Review Quote').closest('a');
      expect(quoteLink).toHaveAttribute('href', `/sourcing/quote/${mockQuote.id}`);
    });

    it('should display multiple line items count', () => {
      const quoteWithMultipleItems = {
        ...mockQuote,
        lineItems: [
          ...mockQuote.lineItems,
          {
            id: 'item-2',
            quoteId: 'quote-1',
            description: 'Another Item',
            quantity: 1,
            unitPrice: 50000,
            subtotal: 50000,
          },
        ],
      };

      render(<LandingPage featuredProducts={[]} recentQuotes={[quoteWithMultipleItems]} />);

      expect(screen.getByText('2 items')).toBeInTheDocument();
    });
  });

  describe('Settlement Options Section', () => {
    it('should render settlement options section', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      expect(screen.getByText('Flexible Settlement Options')).toBeInTheDocument();
    });

    it('should display M-Pesa option details', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      expect(screen.getByText('M-Pesa')).toBeInTheDocument();
      expect(screen.getByText('Instant payment processing')).toBeInTheDocument();
      expect(
        screen.getByText('Available for orders up to KES 300,000')
      ).toBeInTheDocument();
    });

    it('should display Bank Transfer option details', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
      expect(screen.getByText('Suitable for high-value orders')).toBeInTheDocument();
      expect(screen.getByText('No transaction limits')).toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    it('should render final CTA section', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
      expect(
        screen.getByText('Browse our catalog or submit a custom sourcing request today')
      ).toBeInTheDocument();
    });

    it('should have correct CTA links', () => {
      render(<LandingPage featuredProducts={[]} recentQuotes={[]} />);

      const ctaButtons = screen.getAllByText('Browse Catalog');
      const catalogLink = ctaButtons[ctaButtons.length - 1].closest('a');
      expect(catalogLink).toHaveAttribute('href', '/catalog');

      const quoteButtons = screen.getAllByText('Request Quote');
      const quoteLink = quoteButtons[quoteButtons.length - 1].closest('a');
      expect(quoteLink).toHaveAttribute('href', '/sourcing/request');
    });
  });

  describe('Responsive Design', () => {
    it('should render with proper grid layout for products', () => {
      const { container } = render(
        <LandingPage featuredProducts={[mockProduct]} recentQuotes={[]} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should render with proper grid layout for quotes', () => {
      const { container } = render(
        <LandingPage featuredProducts={[]} recentQuotes={[mockQuote]} />
      );

      const grids = container.querySelectorAll('.grid');
      expect(grids.length).toBeGreaterThan(0);
    });
  });
});
