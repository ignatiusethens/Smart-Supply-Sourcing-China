# Error Handling and User Feedback Documentation

## Overview

The Smart Supply Sourcing platform implements comprehensive error handling with:
- **Error Boundaries**: React error boundaries for component failure isolation
- **Form Validation**: Client-side validation with clear error messages
- **Loading States**: Progress indicators for async operations
- **Database Error Handling**: Retry mechanisms and graceful degradation
- **API Error Handling**: Proper HTTP status codes and user-friendly messages

## Components

### 1. Error Boundaries (`src/components/shared/ErrorBoundary.tsx`)

React error boundary component that catches and handles component errors gracefully.

**Features:**
- Catches JavaScript errors in component tree
- Displays user-friendly error message
- Provides "Try again" and "Go home" actions
- Logs errors to console for debugging
- Accessible with ARIA labels

**Usage:**
```typescript
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Custom Fallback:**
```typescript
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h1>Custom Error UI</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

### 2. Error Handler Utilities (`src/lib/utils/error-handler.ts`)

Centralized error handling utilities for consistent error management.

**Key Functions:**

#### `withDatabaseRetry()`
Retry database operations with exponential backoff.

```typescript
import { withDatabaseRetry } from '@/lib/utils/error-handler';

const result = await withDatabaseRetry(
  async () => {
    return await pool.query('SELECT * FROM products');
  },
  3, // max retries
  1000 // initial delay in ms
);
```

#### `parseApiError()`
Parse errors into consistent format.

```typescript
import { parseApiError } from '@/lib/utils/error-handler';

try {
  // operation
} catch (error) {
  const apiError = parseApiError(error);
  console.log(apiError.message, apiError.code, apiError.statusCode);
}
```

#### `getUserFriendlyErrorMessage()`
Convert technical errors to user-friendly messages.

```typescript
import { getUserFriendlyErrorMessage } from '@/lib/utils/error-handler';

try {
  // operation
} catch (error) {
  const message = getUserFriendlyErrorMessage(error);
  // Display to user
}
```

#### `handleDatabaseError()`
Handle database-specific errors.

```typescript
import { handleDatabaseError } from '@/lib/utils/error-handler';

try {
  await pool.query('...');
} catch (error) {
  handleDatabaseError(error); // Throws AppError with appropriate code
}
```

#### `withTimeout()`
Add timeout to async operations.

```typescript
import { withTimeout } from '@/lib/utils/error-handler';

const result = await withTimeout(
  fetch('/api/data'),
  5000, // 5 second timeout
  'Request took too long'
);
```

### 3. Form Validation (`src/lib/utils/form-validation.ts`)

Reusable validation functions with clear error messages.

**Available Validators:**
- `validateEmail()` - Email format validation
- `validatePhone()` - Kenyan phone number validation
- `validateRequired()` - Required field validation
- `validateMinLength()` - Minimum length validation
- `validateMaxLength()` - Maximum length validation
- `validateNumber()` - Number validation
- `validatePositiveNumber()` - Positive number validation
- `validateRange()` - Range validation
- `validateAddress()` - Address validation
- `validateQuantity()` - Quantity validation
- `validatePrice()` - Price validation
- `validateFile()` - File validation
- `validateFiles()` - Multiple files validation
- `validateForm()` - Generic form validation
- `validateCheckoutForm()` - Checkout form validation
- `validateSourcingRequestForm()` - Sourcing request validation

**Usage Example:**
```typescript
import { validateEmail, validatePhone, validateForm } from '@/lib/utils/form-validation';

// Single field validation
const emailResult = validateEmail('user@example.com');
if (!emailResult.valid) {
  console.error(emailResult.error);
}

// Form validation
const formData = {
  email: 'user@example.com',
  phone: '+254712345678',
  name: 'John Doe'
};

const { valid, errors } = validateForm(formData, {
  email: validateEmail,
  phone: validatePhone,
  name: (value) => validateRequired(value, 'Name')
});

if (!valid) {
  console.log(errors); // { email: 'error message', ... }
}
```

### 4. Loading States (`src/components/shared/LoadingSpinner.tsx`)

Consistent loading indicators throughout the application.

**Components:**

#### `LoadingSpinner`
General purpose loading spinner.

```typescript
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

<LoadingSpinner size="md" message="Loading products..." />
<LoadingSpinner size="lg" message="Processing..." fullScreen />
```

#### `ButtonSpinner`
Inline spinner for buttons.

```typescript
import { ButtonSpinner } from '@/components/shared/LoadingSpinner';

<button disabled={isLoading}>
  {isLoading && <ButtonSpinner />}
  Submit
</button>
```

#### `SkeletonLoader`
Content placeholder skeleton.

```typescript
import { SkeletonLoader } from '@/components/shared/LoadingSpinner';

<SkeletonLoader className="h-20 w-full" />
```

#### `ProgressBar`
Progress indicator for uploads/downloads.

```typescript
import { ProgressBar } from '@/components/shared/LoadingSpinner';

<ProgressBar progress={uploadProgress} message="Uploading files..." />
```

### 5. Form Fields (`src/components/shared/FormField.tsx`)

Consistent form fields with validation and error display.

**Components:**

#### `FormField`
Input field with label and error display.

```typescript
import { FormField } from '@/components/shared/FormField';

<FormField
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
  helpText="We'll never share your email"
/>
```

#### `TextareaField`
Textarea field with label and error display.

```typescript
import { TextareaField } from '@/components/shared/FormField';

<TextareaField
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  error={errors.description}
  rows={4}
  required
/>
```

#### `SelectField`
Select field with label and error display.

```typescript
import { SelectField } from '@/components/shared/FormField';

<SelectField
  label="Category"
  value={category}
  onChange={setCategory}
  options={[
    { value: 'pumps', label: 'Pumps & Motors' },
    { value: 'electrical', label: 'Electrical' }
  ]}
  error={errors.category}
  required
/>
```

### 6. API Wrapper (`src/lib/api/api-wrapper.ts`)

Consistent API error handling and retry logic.

**Functions:**

#### `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()`
HTTP methods with error handling.

```typescript
import { apiGet, apiPost } from '@/lib/api/api-wrapper';

// GET request
const response = await apiGet('/api/products');
if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}

// POST request
const response = await apiPost('/api/orders', {
  items: [...],
  shippingAddress: '...'
});
```

#### `apiUpload()`
File upload with progress tracking.

```typescript
import { apiUpload } from '@/lib/api/api-wrapper';

const formData = new FormData();
formData.append('file', file);

const response = await apiUpload(
  '/api/upload',
  formData,
  (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
);
```

## Error Codes

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `DATABASE_ERROR` | Database operation failed | 503 |
| `DATABASE_CONNECTION_ERROR` | Cannot connect to database | 503 |
| `DATABASE_TIMEOUT` | Database query timeout | 504 |
| `DUPLICATE_RECORD` | Record already exists | 409 |
| `NETWORK_ERROR` | Network connection issue | 0 |
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `TIMEOUT` | Request timeout | 504 |
| `RATE_LIMIT` | Too many requests | 429 |
| `INTERNAL_ERROR` | Internal server error | 500 |

## Best Practices

### 1. Always Use Error Boundaries

Wrap major sections of your app with error boundaries:

```typescript
<ErrorBoundary>
  <ProductCatalog />
</ErrorBoundary>

<ErrorBoundary>
  <CheckoutFlow />
</ErrorBoundary>
```

### 2. Validate Forms Before Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate form
  const { valid, errors } = validateCheckoutForm(formData);
  if (!valid) {
    setFormErrors(errors);
    return;
  }

  // Submit form
  setIsLoading(true);
  try {
    const response = await apiPost('/api/orders', formData);
    if (response.success) {
      // Handle success
    } else {
      setError(response.error);
    }
  } catch (error) {
    setError(getUserFriendlyErrorMessage(error));
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Show Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

if (isLoading) {
  return <LoadingSpinner message="Loading products..." />;
}

return <ProductList products={products} />;
```

### 4. Handle Database Errors with Retry

```typescript
import { withDatabaseRetry, handleDatabaseError } from '@/lib/utils/error-handler';

export async function getProducts() {
  try {
    return await withDatabaseRetry(async () => {
      const result = await pool.query('SELECT * FROM products');
      return result.rows;
    });
  } catch (error) {
    handleDatabaseError(error);
  }
}
```

### 5. Provide User-Friendly Error Messages

```typescript
try {
  await performOperation();
} catch (error) {
  const message = getUserFriendlyErrorMessage(error);
  toast.error(message); // Show to user
  console.error(error); // Log for debugging
}
```

## Testing Error Handling

### Test Error Boundaries

```typescript
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('error boundary catches errors', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  expect(screen.getByText('Test error')).toBeInTheDocument();
});
```

### Test Form Validation

```typescript
import { validateEmail, validateCheckoutForm } from '@/lib/utils/form-validation';

test('validates email correctly', () => {
  expect(validateEmail('valid@example.com').valid).toBe(true);
  expect(validateEmail('invalid').valid).toBe(false);
  expect(validateEmail('').valid).toBe(false);
});

test('validates checkout form', () => {
  const validData = {
    shippingAddress: '123 Main St, Nairobi',
    shippingCity: 'Nairobi',
    contactName: 'John Doe',
    contactPhone: '+254712345678',
    paymentMethod: 'mpesa' as const
  };

  const { valid, errors } = validateCheckoutForm(validData);
  expect(valid).toBe(true);
  expect(Object.keys(errors)).toHaveLength(0);
});
```

## Requirements Validated

### ✅ Requirement 19.7
THE Platform SHALL simulate asynchronous operations with appropriate delays
- Implemented with loading states and progress indicators
- API wrapper handles async operations with timeout
- Loading spinners show during operations

### ✅ Requirement 22.1
THE Platform SHALL track payment states
- Payment state management in stores
- State transitions handled with proper error handling
- Database persistence with error recovery

### ✅ Requirement 22.2
WHEN a payment state changes, THE Platform SHALL update all relevant UI components
- State updates trigger UI re-renders
- Error states displayed to users
- Loading states during transitions

### ✅ Requirement 22.3
THE Platform SHALL simulate M-Pesa STK_Push with delay
- Implemented with timeout utilities
- Loading states during processing
- Error handling for failures

### ✅ Requirement 22.4
THE Platform SHALL simulate bank transfer reconciliation with configurable delay
- Async operations with progress tracking
- Retry mechanisms for failures
- User feedback during processing

### ✅ Requirement 22.5
THE Platform SHALL maintain payment state consistency
- Error boundaries prevent state corruption
- Database transactions ensure consistency
- Retry mechanisms recover from failures

## Conclusion

The error handling system provides:
- ✅ Comprehensive error boundaries for component isolation
- ✅ Form validation with clear error messages
- ✅ Loading states and progress indicators
- ✅ Database error handling with retry mechanisms
- ✅ API error handling with proper HTTP status codes
- ✅ User-friendly error messages
- ✅ Accessible error displays
- ✅ Consistent error handling patterns

All requirements for task 18.2 have been successfully implemented.
