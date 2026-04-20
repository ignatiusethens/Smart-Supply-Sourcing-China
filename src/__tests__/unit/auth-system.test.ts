import { hashPassword, verifyPassword, validatePassword } from '@/lib/auth/password';
import { generateToken, verifyToken } from '@/lib/auth/jwt';
import { User } from '@/types';

describe('Authentication System', () => {
  describe('Password Hashing', () => {
    it('should hash passwords securely', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should verify correct passwords', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('WrongPassword123', hash);
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
      
      // But both should verify correctly
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should accept valid passwords', () => {
      const result = validatePassword('ValidPass123');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Short1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('lowercase123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('NoNumbers');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('number');
    });
  });

  describe('JWT Tokens', () => {
    const mockUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'buyer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should generate JWT tokens', () => {
      const token = generateToken(mockUser);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify valid JWT tokens', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.userId).toBe(mockUser.id);
      expect(payload?.email).toBe(mockUser.email);
      expect(payload?.role).toBe(mockUser.role);
    });

    it('should reject invalid JWT tokens', () => {
      const payload = verifyToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should reject tampered JWT tokens', () => {
      const token = generateToken(mockUser);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      
      const payload = verifyToken(tamperedToken);
      expect(payload).toBeNull();
    });

    it('should include correct user information in token', () => {
      const adminUser: User = {
        ...mockUser,
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
      };

      const token = generateToken(adminUser);
      const payload = verifyToken(token);

      expect(payload?.userId).toBe('admin-id');
      expect(payload?.email).toBe('admin@example.com');
      expect(payload?.role).toBe('admin');
    });
  });

  describe('Token Extraction', () => {
    it('should extract token from valid Authorization header', () => {
      const { extractTokenFromHeader } = require('@/lib/auth/jwt');
      const token = 'test-token-123';
      const header = `Bearer ${token}`;

      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing Authorization header', () => {
      const { extractTokenFromHeader } = require('@/lib/auth/jwt');
      const extracted = extractTokenFromHeader(null);
      expect(extracted).toBeNull();
    });

    it('should return null for invalid Authorization header format', () => {
      const { extractTokenFromHeader } = require('@/lib/auth/jwt');
      
      expect(extractTokenFromHeader('InvalidFormat')).toBeNull();
      expect(extractTokenFromHeader('Basic token123')).toBeNull();
      expect(extractTokenFromHeader('Bearer')).toBeNull();
    });
  });
});
