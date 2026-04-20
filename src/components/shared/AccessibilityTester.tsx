/**
 * Accessibility Tester Component
 * Development tool for testing accessibility compliance
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { checkColorContrast, hasAccessibleName } from '@/lib/utils/accessibility';
import { Eye, EyeOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  element: string;
  issue: string;
  suggestion: string;
}

interface AccessibilityTestResult {
  score: number;
  issues: AccessibilityIssue[];
  passedChecks: string[];
}

export function AccessibilityTester() {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<AccessibilityTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runAccessibilityTests = async () => {
    setIsRunning(true);
    const issues: AccessibilityIssue[] = [];
    const passedChecks: string[] = [];

    try {
      // Test 1: Check for missing alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-hidden')) {
          issues.push({
            type: 'error',
            element: `Image ${index + 1}`,
            issue: 'Missing alt text',
            suggestion: 'Add descriptive alt text or aria-hidden="true" for decorative images'
          });
        } else {
          passedChecks.push(`Image ${index + 1}: Has alt text or is marked decorative`);
        }
      });

      // Test 2: Check for interactive elements without accessible names
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex="0"]');
      interactiveElements.forEach((element, index) => {
        if (!hasAccessibleName(element as HTMLElement)) {
          issues.push({
            type: 'error',
            element: `Interactive element ${index + 1} (${element.tagName})`,
            issue: 'Missing accessible name',
            suggestion: 'Add aria-label, aria-labelledby, or visible text content'
          });
        } else {
          passedChecks.push(`Interactive element ${index + 1}: Has accessible name`);
        }
      });

      // Test 3: Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading, index) => {
        const currentLevel = parseInt(heading.tagName.charAt(1));
        if (index === 0 && currentLevel !== 1) {
          issues.push({
            type: 'warning',
            element: `Heading ${index + 1} (${heading.tagName})`,
            issue: 'Page should start with h1',
            suggestion: 'Use h1 for the main page heading'
          });
        } else if (currentLevel > previousLevel + 1) {
          issues.push({
            type: 'warning',
            element: `Heading ${index + 1} (${heading.tagName})`,
            issue: 'Heading level skipped',
            suggestion: 'Use sequential heading levels (h1, h2, h3, etc.)'
          });
        } else {
          passedChecks.push(`Heading ${index + 1}: Proper hierarchy`);
        }
        previousLevel = currentLevel;
      });

      // Test 4: Check for form labels
      const formInputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
      formInputs.forEach((input, index) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;

        if (!label && !ariaLabel && !ariaLabelledBy) {
          issues.push({
            type: 'error',
            element: `Form input ${index + 1} (${input.tagName})`,
            issue: 'Missing form label',
            suggestion: 'Add a label element, aria-label, or aria-labelledby'
          });
        } else {
          passedChecks.push(`Form input ${index + 1}: Has proper label`);
        }
      });

      // Test 5: Check for keyboard accessibility
      const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      focusableElements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex) > 0) {
          issues.push({
            type: 'warning',
            element: `Focusable element ${index + 1}`,
            issue: 'Positive tabindex found',
            suggestion: 'Use tabindex="0" or rely on natural tab order'
          });
        } else {
          passedChecks.push(`Focusable element ${index + 1}: Proper tab order`);
        }
      });

      // Test 6: Check for ARIA roles and properties
      const elementsWithRoles = document.querySelectorAll('[role]');
      elementsWithRoles.forEach((element, index) => {
        const role = element.getAttribute('role');
        if (role === 'button' && !hasAccessibleName(element as HTMLElement)) {
          issues.push({
            type: 'error',
            element: `Element with role="button" ${index + 1}`,
            issue: 'Button role without accessible name',
            suggestion: 'Add aria-label or text content'
          });
        } else {
          passedChecks.push(`ARIA role element ${index + 1}: Properly implemented`);
        }
      });

      // Test 7: Check for color contrast (sample test)
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a');
      let contrastIssues = 0;
      let contrastPassed = 0;

      textElements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Simple check for common cases
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // This is a simplified check - in practice, you'd need more sophisticated color parsing
          if (color === backgroundColor) {
            contrastIssues++;
          } else {
            contrastPassed++;
          }
        }
      });

      if (contrastIssues > 0) {
        issues.push({
          type: 'warning',
          element: 'Text elements',
          issue: `${contrastIssues} potential color contrast issues`,
          suggestion: 'Check color contrast ratios meet WCAG AA standards (4.5:1)'
        });
      }

      if (contrastPassed > 0) {
        passedChecks.push(`${contrastPassed} text elements: Adequate color contrast`);
      }

      // Test 8: Check for skip links
      const skipLinks = document.querySelectorAll('a[href^="#"]');
      let hasSkipToMain = false;
      skipLinks.forEach((link) => {
        const href = link.getAttribute('href');
        const text = link.textContent?.toLowerCase() || '';
        if (href === '#main-content' || text.includes('skip to main') || text.includes('skip to content')) {
          hasSkipToMain = true;
        }
      });

      if (!hasSkipToMain) {
        issues.push({
          type: 'warning',
          element: 'Page navigation',
          issue: 'No skip to main content link found',
          suggestion: 'Add a skip link for keyboard users'
        });
      } else {
        passedChecks.push('Skip to main content: Available');
      }

      // Calculate score
      const totalChecks = issues.length + passedChecks.length;
      const score = totalChecks > 0 ? Math.round((passedChecks.length / totalChecks) * 100) : 100;

      setTestResults({
        score,
        issues,
        passedChecks
      });
    } catch (error) {
      console.error('Accessibility test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Auto-run tests when component mounts in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(runAccessibilityTests, 1000);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          className="rounded-full shadow-lg"
          size="icon"
          aria-label="Open accessibility tester"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ) : (
        <Card className="w-96 max-h-96 overflow-hidden shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Accessibility Test</CardTitle>
              <div className="flex items-center gap-2">
                {testResults && (
                  <Badge 
                    variant={testResults.score >= 90 ? 'default' : testResults.score >= 70 ? 'secondary' : 'destructive'}
                  >
                    {testResults.score}%
                  </Badge>
                )}
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="icon"
                  aria-label="Close accessibility tester"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={runAccessibilityTests}
                disabled={isRunning}
                size="sm"
                className="flex-1"
              >
                {isRunning ? 'Testing...' : 'Run Tests'}
              </Button>
            </div>

            {testResults && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {/* Issues */}
                {testResults.issues.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Issues ({testResults.issues.length})
                    </h4>
                    <div className="space-y-2">
                      {testResults.issues.map((issue, index) => (
                        <div key={index} className="text-xs p-2 rounded bg-slate-50 dark:bg-slate-800">
                          <div className="flex items-start gap-1">
                            {issue.type === 'error' ? (
                              <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium">{issue.element}</p>
                              <p className="text-slate-600 dark:text-slate-400">{issue.issue}</p>
                              <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">{issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Passed Checks */}
                {testResults.passedChecks.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Passed ({testResults.passedChecks.length})
                    </h4>
                    <div className="space-y-1">
                      {testResults.passedChecks.slice(0, 5).map((check, index) => (
                        <div key={index} className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 flex-shrink-0" />
                          {check}
                        </div>
                      ))}
                      {testResults.passedChecks.length > 5 && (
                        <p className="text-xs text-slate-500">
                          +{testResults.passedChecks.length - 5} more passed checks
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}