import { query } from '../database/connection';

const REFERENCE_CODE_PREFIX = 'SSS';
const REFERENCE_CODE_LENGTH = 6;

export function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const randomPart = generateRandomAlphanumeric(REFERENCE_CODE_LENGTH);
  return `${REFERENCE_CODE_PREFIX}-${year}-${randomPart}`;
}

function generateRandomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function validateReferenceCodeFormat(code: string): boolean {
  const pattern = /^SSS-\d{4}-[A-Z0-9]{6}$/;
  return pattern.test(code);
}

// Ensure uniqueness by checking against existing codes in database
export async function generateUniqueReferenceCode(): Promise<string> {
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    code = generateReferenceCode();
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique reference code after maximum attempts');
    }

    // Check if code exists in database
    const existsQuery = 'SELECT id FROM orders WHERE reference_code = $1';
    const result = await query(existsQuery, [code]);
    
    if (result.rows.length === 0) {
      // Code is unique
      break;
    }
  } while (true);

  return code;
}

// Format reference code for display (add dashes if needed)
export function formatReferenceCode(code: string): string {
  // If code doesn't have dashes, add them: SSS2024ABC123 -> SSS-2024-ABC123
  if (code.length === 13 && !code.includes('-')) {
    return `${code.slice(0, 3)}-${code.slice(3, 7)}-${code.slice(7)}`;
  }
  return code;
}

// Parse reference code to extract components
export function parseReferenceCode(code: string): {
  prefix: string;
  year: string;
  identifier: string;
} | null {
  const match = code.match(/^([A-Z]+)-(\d{4})-([A-Z0-9]+)$/);
  
  if (!match) {
    return null;
  }

  return {
    prefix: match[1],
    year: match[2],
    identifier: match[3],
  };
}