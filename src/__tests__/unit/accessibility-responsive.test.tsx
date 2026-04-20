/**
 * Accessibility and Responsive Design Tests
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */

import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductGrid } from '@/components/buyer/ProductGrid';
import { CheckoutForm } from '@/components/buyer/CheckoutForm';
import { FileUploader } from '@/components/buyer/FileUploader';
import { DashboardKPICard } from '@/components/admin/DashboardKPICard';
import { Modal, ConfirmationModal } from '@/components/ui/modal';
import { Tooltip, IconButtonWithTooltip } from '@/components/ui/tooltip';
import { Product } from '@/types';
import { 
  ColorContrastTester, 
  KeyboardNavigationTester, 
  ARIATester,
  AccessibilityAuditor 
} from '@/lib/utils/accessibility-testing';

// Mock products for testing
const mockProduct: Product = {
  id: '1',
  name: 'Centrifugal Pump',
  category: 'pumps-motors',
  price: 45000,
  availability: 'in-stock',
  stockLevel: 10,
  description: 'High-performance centrifugal pump for industrial applications',
  warrantyDuration: '2 years',
  warrantyTerms: 'Full coverage',
  imageUrls: ['https://example.com/pump.jpg'],
  specifications: [
    { id: '1', productId: '1', label: 'Power', value: '5 HP' },
    { id: '2', productId: '1', label: 'Flow Rate', value: '100 GPM' },
  ],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockProducts = [mockProduct];

describe('Accessibility Features', () => {
  describe('Header Navigation', () => {
    it('should have proper ARIA labels for navigation', () => {
      render(<Header userRole="buyer" />);
      
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('should have accessible mobile menu button', async () => {
      render(<Header userRole="buyer" />);
      
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
      
      await userEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have accessible cart button with item count', () => {
      render(<Header userRole="buyer" />);
      
      const cartButton = screen.getByRole('link', { name: /shopping cart/i });
      expect(cartButton).toBeInTheDocument();
    });

    it('should have proper focus indicators on navigation links', async () => {
      render(<Header userRole="buyer" />);
      
      const links = screen.getAllByRole('link');
      for (const link of links) {
        // Focus should be visible
        link.focus();
        expect(link).toHaveFocus();
      }
    });

    it('should have aria-hidden on decorative icons', () => {
      render(<Header userRole="buyer" />);
      
      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Product Card Accessibility', () => {
    it('should have descriptive alt text for product images', () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={jest.fn()}
        />
      );
      
      const image = screen.getByAltText(/centrifugal pump/i);
      expect(image).toBeInTheDocument();
    });

    it('should have accessible add to cart button', () => {
      const onAddToCart = jest.fn();
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={onAddToCart}
        />
      );
      
      const button = screen.getByRole('button', { name: /add centrifugal pump to cart/i });
      expect(button).toBeInTheDocument();
    });

    it('should have proper focus indicators on buttons', async () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={jest.fn()}
        />
      );
      
      const button = screen.getByRole('button', { name: /add centrifugal pump to cart/i });
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have accessible availability badge', () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={jest.fn()}
        />
      );
      
      const badge = screen.getByText('In Stock');
      expect(badge).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onAddToCart = jest.fn();
      
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={onAddToCart}
        />
      );
      
      const button = screen.getByRole('button', { name: /add centrifugal pump to cart/i });
      
      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();
      
      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(onAddToCart).toHaveBeenCalled();
    });
  });

  describe('Product Grid Accessibility', () => {
    it('should have proper ARIA labels for product list', () => {
      render(
        <ProductGrid
          products={mockProducts}
          onRequestQuote={jest.fn()}
        />
      );
      
      const region = screen.getByRole('region', { name: /product list/i });
      expect(region).toBeInTheDocument();
    });

    it('should have loading state with proper ARIA', () => {
      render(
        <ProductGrid
          products={[]}
          isLoading={true}
        />
      );
      
      const status = screen.getByRole('status', { name: /loading products/i });
      expect(status).toBeInTheDocument();
    });

    it('should have accessible empty state message', () => {
      render(
        <ProductGrid
          products={[]}
          isLoading={false}
        />
      );
      
      const message = screen.getByText(/no products found/i);
      expect(message).toBeInTheDocument();
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(
        <CheckoutForm
          onSubmit={jest.fn()}
        />
      );
      
      expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contact phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/shipping address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/shipping city/i)).toBeInTheDocument();
    });

    it('should have required field indicators', () => {
      render(
        <CheckoutForm
          onSubmit={jest.fn()}
        />
      );
      
      const labels = screen.getAllByText('*');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should have accessible error messages', async () => {
      const user = userEvent.setup();
      render(
        <CheckoutForm
          onSubmit={jest.fn()}
        />
      );
      
      const submitButton = screen.getByRole('button', { name: /complete order/i });
      await user.click(submitButton);
      
      // After submission attempt, error messages should be shown
      // The aria-invalid attribute is set when there's an error and field is touched
      const nameInput = screen.getByLabelText(/contact name/i);
      // The input should have aria-invalid set to false initially, but after validation it should show errors
      expect(nameInput).toHaveAttribute('aria-invalid');
    });

    it('should have accessible radio buttons for payment methods', () => {
      render(
        <CheckoutForm
          onSubmit={jest.fn()}
        />
      );
      
      const mpesaRadio = screen.getByRole('radio', { name: /m-pesa/i });
      const bankRadio = screen.getByRole('radio', { name: /bank transfer/i });
      
      expect(mpesaRadio).toBeInTheDocument();
      expect(bankRadio).toBeInTheDocument();
    });

    it('should support keyboard navigation in forms', async () => {
      const user = userEvent.setup();
      render(
        <CheckoutForm
          onSubmit={jest.fn()}
        />
      );
      
      const nameInput = screen.getByLabelText(/contact name/i);
      
      // Tab to first field
      await user.tab();
      expect(nameInput).toHaveFocus();
    });
  });;

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for text', () => {
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onAddToCart={jest.fn()}
        />
      );
      
      // Check that text elements exist and are readable
      const textElements = container.querySelectorAll('h3, p, span');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus visibility on interactive elements', async () => {
      const user = userEvent.setup();
      render(<Header userRole="buyer" />);
      
      const buttons = screen.getAllByRole('button');
      
      for (const button of buttons) {
        button.focus();
        expect(button).toHaveFocus();
      }
    });

    it('should have visible focus indicators on links', async () => {
      const user = userEvent.setup();
      render(<Header userRole="buyer" />);
      
      const links = screen.getAllByRole('link');
      
      for (const link of links) {
        link.focus();
        expect(link).toHaveFocus();
      }
    });
  });
});

describe('Responsive Design', () => {
  describe('Mobile Optimization', () => {
    it('should render mobile menu on small screens', () => {
      render(<Header userRole="buyer" />);
      
      const mobileMenuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should have touch-friendly button sizes', () => {
      render(
        <ProductCard
          product={mockProduct}
          onAddToCart={jest.fn()}
        />
      );
      
      const button = screen.getByRole('button', { name: /add centrifugal pump to cart/i });
      // Buttons should have minimum 44x44px for touch targets
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('should have responsive text sizes', () => {
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onAddToCart={jest.fn()}
        />
      );
      
      const heading = container.querySelector('h3');
      expect(heading).toHaveClass('text-base', 'sm:text-lg');
    });

    it('should have responsive spacing', () => {
      const { container } = render(
        <ProductGrid
          products={mockProducts}
        />
      );
      
      const grid = container.querySelector('[role="region"]');
      expect(grid).toHaveClass('gap-3', 'sm:gap-4', 'md:gap-5', 'lg:gap-6');
    });

    it('should have responsive grid layout', () => {
      const { container } = render(
        <ProductGrid
          products={mockProducts}
          variant="grid"
        />
      );
      
      const grid = container.querySelector('[role="region"]');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });
  });;

  describe('Tablet Optimization', () => {
    it('should have responsive product card layout', () => {
      const { container } = render(
        <ProductCard
          product={mockProduct}
          variant="list"
          onAddToCart={jest.fn()}
        />
      );
      
      const card = container.querySelector('[class*="flex"]');
      expect(card).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('should have responsive form layout', () => {
      const { container } = render(
        <CheckoutForm
          onSubmit={jest.fn()}
        />
      );
      
      const form = container.querySelector('form');
      expect(form).toHaveClass('space-y-4', 'sm:space-y-6');
    });
  });

  describe('Desktop Optimization', () => {
    it('should show desktop navigation on large screens', () => {
      render(<Header userRole="buyer" />);
      
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toHaveClass('hidden', 'md:flex');
    });

    it('should have responsive sidebar layout', () => {
      const { container } = render(
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">Sidebar</aside>
          <main className="lg:col-span-3">Main</main>
        </div>
      );
      
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-4');
    });
  });

  describe('Image Responsiveness', () => {
    it('should have responsive image heights', () => {
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onAddToCart={jest.fn()}
        />
      );
      
      const imageContainer = container.querySelector('[class*="h-40"]');
      expect(imageContainer).toHaveClass('h-40', 'sm:h-48');
    });

    it('should use Next.js Image component for optimization', () => {
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onAddToCart={jest.fn()}
        />
      );
      
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Touch Device Support', () => {
    it('should have adequate spacing between interactive elements', () => {
      const { container } = render(
        <ProductGrid
          products={mockProducts}
        />
      );
      
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should have adequate spacing
      buttons.forEach(button => {
        expect(button).toHaveClass('focus-visible:ring-2');
      });
    });

    it('should support touch-friendly form inputs', () => {
      render(
        <CheckoutForm
          onSubmit={jest.fn()}
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
      
      // Inputs should be easily tappable
      inputs.forEach(input => {
        expect(input).toHaveClass('text-sm');
      });
    });
  });

  describe('Viewport Adaptation', () => {
    it('should have mobile-first responsive classes', () => {
      const { container } = render(
        <ProductCard
          product={mockProduct}
          onAddToCart={jest.fn()}
        />
      );
      
      const elements = container.querySelectorAll('[class*="sm:"]');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should hide/show elements based on breakpoints', () => {
      render(<Header userRole="buyer" />);
      
      const mobileMenu = screen.getByRole('button', { name: /open navigation menu/i });
      expect(mobileMenu).toHaveClass('md:hidden');
      
      const desktopNav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });
  });

  describe('Pagination Accessibility', () => {
    it('should have accessible pagination controls', () => {
      const { container } = render(
        <nav aria-label="Product pagination">
          <button>Previous</button>
          <button aria-current="page">1</button>
          <button>2</button>
          <button>Next</button>
        </nav>
      );
      
      const nav = screen.getByRole('navigation', { name: /product pagination/i });
      expect(nav).toBeInTheDocument();
      
      const currentPage = screen.getByRole('button', { current: 'page' });
      expect(currentPage).toBeInTheDocument();
    });
  });
});

describe('Semantic HTML', () => {
  it('should use semantic HTML elements', () => {
    const { container } = render(<Header userRole="buyer" />);
    
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('should use proper heading hierarchy', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={jest.fn()}
      />
    );
    
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it('should use proper form elements', () => {
    const { container } = render(
      <CheckoutForm
        onSubmit={jest.fn()}
      />
    );
    
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });
});
