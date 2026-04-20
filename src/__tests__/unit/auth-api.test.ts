/**
 * Authentication API Tests
 * Validates: Requirements 19.7, 30.1, 30.2, 30.3, 30.4, 30.5, 30.6
 */

import { ApiErrors, validateEmail, validatePassword, validatePhoneNumber } from '@/lib/utils/apiError';

describe('Authentication API', () => {
  describe('Error Handling', () => {
    it('should create invalid input error', () => {
      const error = ApiErrors.INVALID_INPUT('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('INVALID_INPUT');
    });

    it('should create missing required field error', () => {
      const error = ApiErrors.MISSING_REQUIRED_FIELD('email');
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('email');
      expect(error.code).toBe('MISSING_REQUIRED_FIELD');
    });

    it('should create invalid credentials error', () => {
      const error = ApiErrors.INVALID_CREDENTIALS();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid email or password');
      expect(error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should create unauthorized error', () => {
      const error = ApiErrors.UNAUTHORIZED();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create forbidden error', () => {
      const error = ApiErrors.FORBIDDEN();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should create not found error', () => {
      const error = ApiErrors.NOT_FOUND('User');
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('User');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create conflict error', () => {
      const error = ApiErrors.EMAIL_ALREADY_EXISTS();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Email already registered');
      expect(error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should create internal server error', () => {
      const error = ApiErrors.INTERNAL_ERROR();
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });

    it('should create database error', () => {
      const error = ApiErrors.DATABASE_ERROR();
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('Validation', () => {
    describe('Email Validation', () => {
      it('should validate correct email format', () => {
        expect(() => validateEmail('test@example.com')).not.toThrow();
      });

      it('should reject invalid email format', () => {
        expect(() => validateEmail('invalid-email')).toThrow();
        expect(() => validateEmail('test@')).toThrow();
        expect(() => validateEmail('@example.com')).toThrow();
      });

      it('should reject empty email', () => {
        expect(() => validateEmail('')).toThrow();
      });
    });

    describe('Password Validation', () => {
      it('should validate password with 6+ characters', () => {
        expect(() => validatePassword('password123')).not.toThrow();
        expect(() => validatePassword('123456')).not.toThrow();
      });

      it('should reject password with less than 6 characters', () => {
        expect(() => validatePassword('12345')).toThrow();
        expect(() => validatePassword('pass')).toThrow();
        expect(() => validatePassword('')).toThrow();
      });
    });

    describe('Phone Number Validation', () => {
      it('should validate Kenyan phone numbers', () => {
        expect(() => validatePhoneNumber('+254712345678')).not.toThrow();
        expect(() => validatePhoneNumber('0712345678')).not.toThrow();
      });

      it('should reject invalid phone numbers', () => {
        expect(() => validatePhoneNumber('1234567890')).toThrow();
        expect(() => validatePhoneNumber('+1234567890')).toThrow();
        expect(() => validatePhoneNumber('invalid')).toThrow();
      });

      it('should handle phone numbers with spaces', () => {
        expect(() => validatePhoneNumber('+254 712 345 678')).not.toThrow();
        expect(() => validatePhoneNumber('071 234 5678')).not.toThrow();
      });
    });
  });

  describe('Error Response Format', () => {
    it('should have correct error response structure', () => {
      const error = ApiErrors.INVALID_INPUT('Test');
      expect(error).toHaveProperty('statusCode');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('code');
    });

    it('should have correct status codes', () => {
      expect(ApiErrors.INVALID_INPUT().statusCode).toBe(400);
      expect(ApiErrors.UNAUTHORIZED().statusCode).toBe(401);
      expect(ApiErrors.FORBIDDEN().statusCode).toBe(403);
      expect(ApiErrors.NOT_FOUND('test').statusCode).toBe(404);
      expect(ApiErrors.CONFLICT('test').statusCode).toBe(409);
      expect(ApiErrors.INTERNAL_ERROR().statusCode).toBe(500);
    });
  });

  describe('Specific Error Cases', () => {
    it('should create invalid email error', () => {
      const error = ApiErrors.INVALID_EMAIL();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_EMAIL');
    });

    it('should create invalid phone error', () => {
      const error = ApiErrors.INVALID_PHONE();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_PHONE');
    });

    it('should create invalid password error', () => {
      const error = ApiErrors.INVALID_PASSWORD();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_PASSWORD');
    });

    it('should create session expired error', () => {
      const error = ApiErrors.SESSION_EXPIRED();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('SESSION_EXPIRED');
    });

    it('should create insufficient permissions error', () => {
      const error = ApiErrors.INSUFFICIENT_PERMISSIONS();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should create user not found error', () => {
      const error = ApiErrors.USER_NOT_FOUND();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('USER_NOT_FOUND');
    });

    it('should create product not found error', () => {
      const error = ApiErrors.PRODUCT_NOT_FOUND();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should create order not found error', () => {
      const error = ApiErrors.ORDER_NOT_FOUND();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('ORDER_NOT_FOUND');
    });

    it('should create duplicate reference code error', () => {
      const error = ApiErrors.DUPLICATE_REFERENCE_CODE();
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('DUPLICATE_REFERENCE_CODE');
    });

    it('should create file upload error', () => {
      const error = ApiErrors.FILE_UPLOAD_ERROR();
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('FILE_UPLOAD_ERROR');
    });
  });
});
