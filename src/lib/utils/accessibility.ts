/**
 * Accessibility Utilities
 * Provides helper functions for WCAG AA compliance
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */

/**
 * Announces a message to screen readers using ARIA live regions
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Traps focus within a modal or dialog
 * @param element - The container element to trap focus within
 * @returns Cleanup function to remove event listeners
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Manages focus restoration when closing modals
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;

  /**
   * Saves the currently focused element
   */
  saveFocus(): void {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  /**
   * Restores focus to the previously focused element
   */
  restoreFocus(): void {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }
}

/**
 * Checks if an element is keyboard accessible
 * @param element - The element to check
 * @returns true if the element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive =
    element.tagName === 'BUTTON' ||
    element.tagName === 'A' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA';

  return isInteractive || (tabIndex !== null && parseInt(tabIndex) >= 0);
}

/**
 * Generates a unique ID for ARIA attributes
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates color contrast ratio for WCAG AA compliance
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @returns Object with contrast ratio and compliance status
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passesAA: boolean; passesAAA: boolean } {
  const getLuminance = (hex: string): number => {
    // Remove # if present
    hex = hex.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Apply gamma correction
    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    // Calculate relative luminance
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5, // WCAG AA for normal text
    passesAAA: ratio >= 7, // WCAG AAA for normal text
  };
}

/**
 * Keyboard event handler for Enter and Space keys
 * Useful for making non-button elements keyboard accessible
 * @param callback - Function to call when Enter or Space is pressed
 * @returns Event handler function
 */
export function handleKeyboardActivation(
  callback: () => void
): (e: React.KeyboardEvent) => void {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };
}

/**
 * Escapes special characters in text for screen readers
 * @param text - Text to escape
 * @returns Escaped text
 */
export function escapeForScreenReader(text: string): string {
  return text
    .replace(/&/g, 'and')
    .replace(/</g, 'less than')
    .replace(/>/g, 'greater than')
    .replace(/@/g, 'at');
}

/**
 * Formats a number as a readable string for screen readers
 * @param value - Number to format
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatNumberForScreenReader(
  value: number,
  options?: { currency?: string; locale?: string }
): string {
  const locale = options?.locale || 'en-KE';

  if (options?.currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: options.currency,
    }).format(value);
  }

  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Creates a visually hidden element for screen readers only
 * @param text - Text content for screen readers
 * @returns HTMLElement that is visually hidden but accessible
 */
export function createScreenReaderOnly(text: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = text;
  return span;
}

/**
 * Checks if reduced motion is preferred by the user
 * @returns true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Validates that an interactive element has an accessible name
 * @param element - Element to validate
 * @returns true if element has an accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const title = element.getAttribute('title');
  const textContent = element.textContent?.trim();

  return !!(ariaLabel || ariaLabelledBy || title || textContent);
}

/**
 * Keyboard navigation helper for lists and grids
 */
export class KeyboardNavigationHelper {
  private items: HTMLElement[];
  private currentIndex: number = 0;
  private orientation: 'horizontal' | 'vertical' | 'grid';

  constructor(
    items: HTMLElement[],
    orientation: 'horizontal' | 'vertical' | 'grid' = 'vertical'
  ) {
    this.items = items;
    this.orientation = orientation;
  }

  handleKeyDown(e: KeyboardEvent): void {
    const { key } = e;

    switch (key) {
      case 'ArrowDown':
        if (this.orientation === 'vertical' || this.orientation === 'grid') {
          e.preventDefault();
          this.focusNext();
        }
        break;

      case 'ArrowUp':
        if (this.orientation === 'vertical' || this.orientation === 'grid') {
          e.preventDefault();
          this.focusPrevious();
        }
        break;

      case 'ArrowRight':
        if (this.orientation === 'horizontal' || this.orientation === 'grid') {
          e.preventDefault();
          this.focusNext();
        }
        break;

      case 'ArrowLeft':
        if (this.orientation === 'horizontal' || this.orientation === 'grid') {
          e.preventDefault();
          this.focusPrevious();
        }
        break;

      case 'Home':
        e.preventDefault();
        this.focusFirst();
        break;

      case 'End':
        e.preventDefault();
        this.focusLast();
        break;
    }
  }

  private focusNext(): void {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.items[this.currentIndex]?.focus();
  }

  private focusPrevious(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.items[this.currentIndex]?.focus();
  }

  private focusFirst(): void {
    this.currentIndex = 0;
    this.items[0]?.focus();
  }

  private focusLast(): void {
    this.currentIndex = this.items.length - 1;
    this.items[this.currentIndex]?.focus();
  }
}
