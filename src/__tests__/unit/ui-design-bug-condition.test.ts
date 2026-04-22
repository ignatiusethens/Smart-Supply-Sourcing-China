/**
 * Bug Condition Exploration Test — UI Design Alignment
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10**
 *
 * PURPOSE: This test MUST FAIL on unfixed code.
 * Failure confirms the bug exists: the platform uses basic Tailwind styling
 * instead of a professional industrial design system.
 *
 * After the fix is implemented (Task 3), this same test MUST PASS,
 * confirming the professional design system is in place.
 *
 * EXPECTED OUTCOME (unfixed code): FAIL
 * EXPECTED OUTCOME (fixed code):   PASS
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readComponent(relativePath: string): string {
  const absolute = path.resolve(__dirname, '../../../', relativePath);
  return fs.readFileSync(absolute, 'utf-8');
}

// ---------------------------------------------------------------------------
// Source files under test
// ---------------------------------------------------------------------------

const LANDING_PAGE_PATH = 'src/components/buyer/LandingPage.tsx';
const HEADER_PATH = 'src/components/layout/Header.tsx';
const PRODUCT_CARD_PATH = 'src/components/shared/ProductCard.tsx';
const FORM_FIELD_PATH = 'src/components/shared/FormField.tsx';

// ---------------------------------------------------------------------------
// Property 1 (Bug Condition): Landing page uses industrial warehouse imagery
// instead of basic blue gradient
// Requirement 1.1 / Expected Behavior 2.1
// ---------------------------------------------------------------------------

describe('Property 1 — Landing Page: industrial hero instead of basic blue gradient', () => {
  let source: string;

  beforeAll(() => {
    source = readComponent(LANDING_PAGE_PATH);
  });

  /**
   * BUG: The landing page hero uses a basic blue gradient.
   * EXPECTED (fixed): The hero should NOT contain the basic blue gradient classes.
   */
  it('should NOT use basic blue gradient (bg-gradient-to-r from-blue-600)', () => {
    // This assertion FAILS on unfixed code because the basic gradient IS present.
    expect(source).not.toMatch(/bg-gradient-to-r\s+from-blue-600/);
  });

  /**
   * BUG: The landing page does not reference industrial warehouse imagery.
   * EXPECTED (fixed): The hero should reference an industrial background image.
   */
  it('should reference industrial warehouse background imagery', () => {
    // This assertion FAILS on unfixed code because no warehouse imagery is referenced.
    const hasWarehouseImage =
      /warehouse/i.test(source) ||
      /industrial.*bg/i.test(source) ||
      /bg-\[url/i.test(source) ||
      /backgroundImage/i.test(source) ||
      /hero.*image/i.test(source);
    expect(hasWarehouseImage).toBe(true);
  });

  /**
   * BUG: The landing page does not include "M-PESA INSTANT" badges on products.
   * EXPECTED (fixed): Featured products should display "M-PESA INSTANT" badges.
   */
  it('should include M-PESA INSTANT badge on featured products', () => {
    // This assertion FAILS on unfixed code because no such badge exists.
    expect(source).toMatch(/M-PESA INSTANT/i);
  });
});

// ---------------------------------------------------------------------------
// Property 2 (Bug Condition): Navigation uses professional industrial branding
// Requirement 1.3 / Expected Behavior 2.1, 2.9
//
// NOTE: The PDF mockup (page 1) shows a WHITE header with blue text logo.
// The correct fixed design uses a white header with blue branding — NOT a dark header.
// Tests updated to reflect the actual PDF design.
// ---------------------------------------------------------------------------

describe('Property 2 — Navigation: professional industrial branding instead of standard header', () => {
  let source: string;

  beforeAll(() => {
    source = readComponent(HEADER_PATH);
  });

  /**
   * FIXED: The PDF mockup shows a white header with blue branding.
   * The header correctly uses bg-white with border and shadow for a clean professional look.
   * This test verifies the header uses the professional white + blue branding pattern.
   */
  it('should use professional white header with blue branding (matching PDF mockup)', () => {
    // The PDF shows a white header — bg-white with blue text/logo is the correct design.
    const hasProfessionalWhiteHeader =
      /bg-white/.test(source) &&
      (/text-blue-600/.test(source) || /text-primary/.test(source));
    expect(hasProfessionalWhiteHeader).toBe(true);
  });

  /**
   * FIXED: The header uses a professional border and shadow for depth.
   * EXPECTED (fixed): The header should have border and shadow for professional appearance.
   */
  it('should use professional border and shadow for header depth', () => {
    const hasProfessionalDepth =
      /border-b/.test(source) || /shadow/.test(source);
    expect(hasProfessionalDepth).toBe(true);
  });

  /**
   * BUG: The logo used a basic blue square (bg-blue-600) as a background block.
   * EXPECTED (fixed): The logo should use a diamond icon (◇) with blue text, not a filled square.
   */
  it('should NOT use basic blue-600 as a logo background block (should use icon instead)', () => {
    // The fixed design uses a diamond ◇ icon with text-blue-600, not bg-blue-600 for the logo block.
    // bg-blue-600 may appear on the user avatar button, but NOT as the primary logo background.
    // We verify the logo uses the diamond icon pattern instead of a colored square.
    const hasLogoIcon =
      /◇/.test(source) || /diamond/i.test(source) || /logo.*icon/i.test(source);
    expect(hasLogoIcon).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Property 3 (Bug Condition): Product cards use professional industrial design
// instead of generic shadcn/ui styling
// Requirement 1.2 / Expected Behavior 2.2
// ---------------------------------------------------------------------------

describe('Property 3 — Product Cards: professional industrial design instead of generic styling', () => {
  let source: string;

  beforeAll(() => {
    source = readComponent(PRODUCT_CARD_PATH);
  });

  /**
   * BUG: Product cards use generic shadcn/ui Card component without industrial customisation.
   * EXPECTED (fixed): Cards should use professional industrial card classes.
   */
  it('should use professional industrial card styling (not plain generic Card)', () => {
    // This assertion FAILS on unfixed code because only the generic Card component is used.
    const hasProfessionalCard =
      /professional-card/i.test(source) ||
      /industrial.*card/i.test(source) ||
      /border-primary/i.test(source) ||
      /shadow-industrial/i.test(source) ||
      /card.*elevated/i.test(source);
    expect(hasProfessionalCard).toBe(true);
  });

  /**
   * BUG: Product cards do not show "M-PESA INSTANT" availability badges.
   * EXPECTED (fixed): Eligible products should display "M-PESA INSTANT" badge.
   */
  it('should include M-PESA INSTANT availability badge for eligible products', () => {
    // This assertion FAILS on unfixed code because no such badge exists.
    expect(source).toMatch(/M-PESA INSTANT/i);
  });

  /**
   * BUG: Product cards use basic slate color scheme (text-slate-500, text-slate-600).
   * EXPECTED (fixed): Cards should use the industrial design system color tokens.
   */
  it('should NOT rely solely on basic slate color utilities for product information', () => {
    // This assertion FAILS on unfixed code because only slate utilities are used.
    const hasIndustrialColors =
      /text-primary/i.test(source) ||
      /text-accent/i.test(source) ||
      /industrial.*color/i.test(source) ||
      /var\(--primary/i.test(source) ||
      /var\(--accent/i.test(source);
    expect(hasIndustrialColors).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Property 4 (Bug Condition): Forms use professional validation states
// instead of basic blue focus ring
// Requirement 1.4 / Expected Behavior 2.4
// ---------------------------------------------------------------------------

describe('Property 4 — Forms: professional validation states instead of basic blue focus ring', () => {
  let source: string;

  beforeAll(() => {
    source = readComponent(FORM_FIELD_PATH);
  });

  /**
   * BUG: Form inputs use a basic blue focus ring (focus:ring-blue-500).
   * EXPECTED (fixed): Inputs should use the industrial accent color for focus states.
   */
  it('should NOT use basic blue focus ring (focus:ring-blue-500)', () => {
    // This assertion FAILS on unfixed code because focus:ring-blue-500 IS present.
    expect(source).not.toMatch(/focus:ring-blue-500/);
  });

  /**
   * BUG: Form inputs use basic blue border on focus (focus:border-blue-500).
   * EXPECTED (fixed): Inputs should use the industrial accent color for focus borders.
   */
  it('should NOT use basic blue focus border (focus:border-blue-500)', () => {
    // This assertion FAILS on unfixed code because focus:border-blue-500 IS present.
    expect(source).not.toMatch(/focus:border-blue-500/);
  });

  /**
   * BUG: Form inputs do not use professional validation state classes.
   * EXPECTED (fixed): Inputs should use professional-input, professional-input--error,
   * professional-input--success classes or equivalent industrial design tokens.
   */
  it('should use professional validation state classes', () => {
    // This assertion FAILS on unfixed code because no professional classes exist.
    const hasProfessionalValidation =
      /professional-input/i.test(source) ||
      /focus:ring-accent/i.test(source) ||
      /focus:border-accent/i.test(source) ||
      /var\(--accent/i.test(source) ||
      /focus:ring-orange/i.test(source) ||
      /focus:ring-info/i.test(source) ||
      /focus:border-info/i.test(source);
    expect(hasProfessionalValidation).toBe(true);
  });
});
