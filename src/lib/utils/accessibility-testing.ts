/**
 * Accessibility Testing Utilities
 * Provides utilities for testing accessibility compliance
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */

/**
 * Color contrast testing utilities
 */
export class ColorContrastTester {
  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Calculate relative luminance
   */
  private static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) {
      throw new Error('Invalid color format. Use hex format (#RRGGBB)');
    }

    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if contrast ratio meets WCAG standards
   */
  static checkWCAGCompliance(
    foreground: string,
    background: string,
    fontSize: number = 16,
    fontWeight: number = 400
  ): {
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
    isLargeText: boolean;
  } {
    const ratio = this.getContrastRatio(foreground, background);
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

    // WCAG 2.1 requirements
    const aaThreshold = isLargeText ? 3 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7;

    return {
      ratio: Math.round(ratio * 100) / 100,
      passesAA: ratio >= aaThreshold,
      passesAAA: ratio >= aaaThreshold,
      isLargeText,
    };
  }
}

/**
 * Keyboard navigation testing utilities
 */
export class KeyboardNavigationTester {
  /**
   * Get all focusable elements in a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter((element) => {
        const el = element as HTMLElement;
        return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden;
      }) as HTMLElement[];
  }

  /**
   * Test tab order in a container
   */
  static testTabOrder(container: HTMLElement): {
    elements: HTMLElement[];
    tabOrder: number[];
    hasLogicalOrder: boolean;
  } {
    const focusableElements = this.getFocusableElements(container);
    const tabOrder = focusableElements.map(el => {
      const tabIndex = el.getAttribute('tabindex');
      return tabIndex ? parseInt(tabIndex, 10) : 0;
    });

    // Check if tab order is logical (sequential)
    const hasLogicalOrder = tabOrder.every((current, index) => {
      if (index === 0) return true;
      const previous = tabOrder[index - 1];
      return current >= previous;
    });

    return {
      elements: focusableElements,
      tabOrder,
      hasLogicalOrder,
    };
  }

  /**
   * Simulate keyboard navigation
   */
  static simulateKeyboardNavigation(
    container: HTMLElement,
    key: 'Tab' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Enter' | 'Space' | 'Escape'
  ): boolean {
    const activeElement = document.activeElement as HTMLElement;
    
    if (!container.contains(activeElement)) {
      return false;
    }

    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    });

    return activeElement.dispatchEvent(event);
  }
}

/**
 * ARIA attributes testing utilities
 */
export class ARIATester {
  /**
   * Check if an element has proper ARIA labeling
   */
  static hasAccessibleName(element: HTMLElement): {
    hasName: boolean;
    nameSource: string | null;
    name: string | null;
  } {
    // Check aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return {
        hasName: true,
        nameSource: 'aria-label',
        name: ariaLabel,
      };
    }

    // Check aria-labelledby
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      return {
        hasName: !!labelElement,
        nameSource: 'aria-labelledby',
        name: labelElement?.textContent || null,
      };
    }

    // Check associated label
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      const id = element.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
          return {
            hasName: true,
            nameSource: 'label',
            name: label.textContent,
          };
        }
      }

      // Check if wrapped in label
      const parentLabel = element.closest('label');
      if (parentLabel) {
        return {
          hasName: true,
          nameSource: 'parent-label',
          name: parentLabel.textContent,
        };
      }
    }

    // Check title attribute
    const title = element.getAttribute('title');
    if (title) {
      return {
        hasName: true,
        nameSource: 'title',
        name: title,
      };
    }

    // Check text content for buttons and links
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      const textContent = element.textContent?.trim();
      if (textContent) {
        return {
          hasName: true,
          nameSource: 'text-content',
          name: textContent,
        };
      }
    }

    return {
      hasName: false,
      nameSource: null,
      name: null,
    };
  }

  /**
   * Validate ARIA attributes on an element
   */
  static validateARIAAttributes(element: HTMLElement): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for invalid ARIA attributes
    const attributes = Array.from(element.attributes);
    const ariaAttributes = attributes.filter(attr => attr.name.startsWith('aria-'));

    ariaAttributes.forEach(attr => {
      // Check for common typos
      const validARIAAttributes = [
        'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
        'aria-expanded', 'aria-controls', 'aria-current', 'aria-disabled',
        'aria-invalid', 'aria-required', 'aria-live', 'aria-atomic',
        'aria-busy', 'aria-checked', 'aria-selected', 'aria-pressed',
      ];

      if (!validARIAAttributes.includes(attr.name)) {
        warnings.push(`Unknown ARIA attribute: ${attr.name}`);
      }

      // Check for empty values
      if (!attr.value.trim()) {
        errors.push(`Empty ARIA attribute: ${attr.name}`);
      }
    });

    // Check role attribute
    const role = element.getAttribute('role');
    if (role) {
      const validRoles = [
        'button', 'link', 'menuitem', 'tab', 'tabpanel', 'dialog', 'alertdialog',
        'alert', 'status', 'log', 'marquee', 'timer', 'region', 'navigation',
        'main', 'banner', 'contentinfo', 'complementary', 'search', 'form',
        'article', 'section', 'list', 'listitem', 'table', 'row', 'cell',
        'columnheader', 'rowheader', 'grid', 'gridcell', 'tree', 'treeitem',
      ];

      if (!validRoles.includes(role)) {
        warnings.push(`Unknown role: ${role}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Screen reader testing utilities
 */
export class ScreenReaderTester {
  /**
   * Get the accessible text for an element
   */
  static getAccessibleText(element: HTMLElement): string {
    // Check aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent || '';
    }

    // Check associated label
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      const id = element.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) return label.textContent || '';
      }
    }

    // Return text content
    return element.textContent || '';
  }

  /**
   * Check if element is hidden from screen readers
   */
  static isHiddenFromScreenReaders(element: HTMLElement): boolean {
    // Check aria-hidden
    if (element.getAttribute('aria-hidden') === 'true') return true;

    // Check if element or parent has display: none or visibility: hidden
    let current: HTMLElement | null = element;
    while (current) {
      const styles = window.getComputedStyle(current);
      if (styles.display === 'none' || styles.visibility === 'hidden') {
        return true;
      }
      current = current.parentElement;
    }

    return false;
  }

  /**
   * Test live region announcements
   */
  static testLiveRegion(element: HTMLElement): {
    hasLiveRegion: boolean;
    politeness: string | null;
    atomic: boolean;
  } {
    const ariaLive = element.getAttribute('aria-live');
    const ariaAtomic = element.getAttribute('aria-atomic') === 'true';

    return {
      hasLiveRegion: !!ariaLive,
      politeness: ariaLive,
      atomic: ariaAtomic,
    };
  }
}

/**
 * Comprehensive accessibility audit
 */
export class AccessibilityAuditor {
  /**
   * Run a comprehensive accessibility audit on a container
   */
  static audit(container: HTMLElement): {
    score: number;
    issues: Array<{
      type: 'error' | 'warning';
      message: string;
      element: HTMLElement;
      rule: string;
    }>;
    summary: {
      totalElements: number;
      elementsWithIssues: number;
      colorContrastIssues: number;
      keyboardIssues: number;
      ariaIssues: number;
    };
  } {
    const issues: Array<{
      type: 'error' | 'warning';
      message: string;
      element: HTMLElement;
      rule: string;
    }> = [];

    const allElements = container.querySelectorAll('*') as NodeListOf<HTMLElement>;
    let elementsWithIssues = 0;
    let colorContrastIssues = 0;
    let keyboardIssues = 0;
    let ariaIssues = 0;

    allElements.forEach(element => {
      let elementHasIssues = false;

      // Check ARIA attributes
      const ariaValidation = ARIATester.validateARIAAttributes(element);
      if (!ariaValidation.isValid) {
        ariaValidation.errors.forEach(error => {
          issues.push({
            type: 'error',
            message: error,
            element,
            rule: 'aria-validation',
          });
        });
        elementHasIssues = true;
        ariaIssues++;
      }

      // Check accessible names for interactive elements
      const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
      if (interactiveTags.includes(element.tagName)) {
        const accessibleName = ARIATester.hasAccessibleName(element);
        if (!accessibleName.hasName) {
          issues.push({
            type: 'error',
            message: `Interactive element lacks accessible name`,
            element,
            rule: 'accessible-name',
          });
          elementHasIssues = true;
          ariaIssues++;
        }
      }

      // Check images for alt text
      if (element.tagName === 'IMG') {
        const alt = element.getAttribute('alt');
        if (alt === null) {
          issues.push({
            type: 'error',
            message: 'Image missing alt attribute',
            element,
            rule: 'img-alt',
          });
          elementHasIssues = true;
        }
      }

      if (elementHasIssues) {
        elementsWithIssues++;
      }
    });

    // Check keyboard navigation
    const keyboardTest = KeyboardNavigationTester.testTabOrder(container);
    if (!keyboardTest.hasLogicalOrder) {
      issues.push({
        type: 'warning',
        message: 'Tab order may not be logical',
        element: container,
        rule: 'tab-order',
      });
      keyboardIssues++;
    }

    // Calculate score (0-100)
    const totalIssues = issues.length;
    const maxPossibleIssues = allElements.length * 3; // Rough estimate
    const score = Math.max(0, Math.round((1 - totalIssues / maxPossibleIssues) * 100));

    return {
      score,
      issues,
      summary: {
        totalElements: allElements.length,
        elementsWithIssues,
        colorContrastIssues,
        keyboardIssues,
        ariaIssues,
      },
    };
  }
}