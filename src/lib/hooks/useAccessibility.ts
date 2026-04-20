/**
 * Accessibility Hooks
 * Custom hooks for managing accessibility features
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { announceToScreenReader, trapFocus, FocusManager } from '@/lib/utils/accessibility';

/**
 * Hook for managing focus trap in modals and dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      cleanupRef.current = trapFocus(containerRef.current);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestore() {
  const focusManagerRef = useRef(new FocusManager());

  const saveFocus = useCallback(() => {
    focusManagerRef.current.saveFocus();
  }, []);

  const restoreFocus = useCallback(() => {
    focusManagerRef.current.restoreFocus();
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Hook for announcing messages to screen readers
 */
export function useAnnouncer() {
  const announce = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    announceToScreenReader(message, priority);
  }, []);

  return { announce };
}

/**
 * Hook for managing keyboard navigation in lists
 */
export function useKeyboardNavigation(
  items: HTMLElement[],
  orientation: 'horizontal' | 'vertical' | 'grid' = 'vertical'
) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { key } = e;
    let newIndex = currentIndex;

    switch (key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'grid') {
          e.preventDefault();
          newIndex = (currentIndex + 1) % items.length;
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'grid') {
          e.preventDefault();
          newIndex = (currentIndex - 1 + items.length) % items.length;
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'grid') {
          e.preventDefault();
          newIndex = (currentIndex + 1) % items.length;
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'grid') {
          e.preventDefault();
          newIndex = (currentIndex - 1 + items.length) % items.length;
        }
        break;

      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;

      default:
        return;
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      items[newIndex]?.focus();
    }
  }, [currentIndex, items, orientation]);

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
}

/**
 * Hook for managing ARIA live regions
 */
export function useAriaLive() {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((
    text: string,
    announcePriority: 'polite' | 'assertive' = 'polite'
  ) => {
    setMessage(text);
    setPriority(announcePriority);

    // Clear message after announcement
    setTimeout(() => {
      setMessage('');
    }, 1000);
  }, []);

  return {
    message,
    priority,
    announce,
  };
}

/**
 * Hook for managing reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for managing skip links
 */
export function useSkipLinks() {
  const skipToContent = useCallback((targetId: string = 'main-content') => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return { skipToContent };
}

/**
 * Hook for managing roving tabindex in component groups
 */
export function useRovingTabIndex(items: HTMLElement[], activeIndex: number = 0) {
  useEffect(() => {
    items.forEach((item, index) => {
      if (item) {
        item.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
      }
    });
  }, [items, activeIndex]);

  const setActiveIndex = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < items.length) {
      items.forEach((item, index) => {
        if (item) {
          item.setAttribute('tabindex', index === newIndex ? '0' : '-1');
        }
      });
      items[newIndex]?.focus();
    }
  }, [items]);

  return { setActiveIndex };
}

/**
 * Hook for managing form accessibility
 */
export function useFormAccessibility() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldTouched = useCallback((field: string, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const getFieldProps = useCallback((field: string) => {
    const hasError = errors[field] && touched[field];
    return {
      'aria-invalid': hasError ? 'true' : 'false',
      'aria-describedby': hasError ? `${field}-error` : undefined,
    };
  }, [errors, touched]);

  const getErrorProps = useCallback((field: string) => {
    const hasError = errors[field] && touched[field];
    return hasError ? {
      id: `${field}-error`,
      role: 'alert',
      'aria-live': 'polite' as const,
    } : {};
  }, [errors, touched]);

  return {
    errors,
    touched,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    getFieldProps,
    getErrorProps,
    hasError: (field: string) => !!(errors[field] && touched[field]),
  };
}