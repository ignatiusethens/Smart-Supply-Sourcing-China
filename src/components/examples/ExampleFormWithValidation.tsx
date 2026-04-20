/**
 * Example Form with Comprehensive Validation
 * Demonstrates form validation, error handling, and loading states
 * Validates: Requirements 22.1, 22.2
 */

'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormError, FormFieldError, FormSuccess } from '@/components/ui/form-error';
import { LoadingOverlay } from '@/components/ui/loading-spinner';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define validation schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+254|254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

interface ExampleFormProps {
  onSubmit?: (data: FormData) => Promise<void>;
}

export function ExampleFormWithValidation({ onSubmit }: ExampleFormProps) {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation({
    schema: formSchema,
    initialValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
    onSubmit: async (data) => {
      try {
        setSubmitError(undefined);
        setSubmitSuccess(false);

        // Call the provided onSubmit or simulate API call
        if (onSubmit) {
          await onSubmit(data);
        } else {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        setSubmitSuccess(true);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'An error occurred'
        );
        throw error;
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Contact Form Example</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Demonstrates comprehensive form validation and error handling
        </p>
      </CardHeader>
      <CardContent>
        <LoadingOverlay isLoading={isSubmitting} text="Submitting form...">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form-level error */}
            {submitError && (
              <FormError message={submitError} variant="banner" />
            )}

            {/* Form-level success */}
            {submitSuccess && (
              <FormSuccess message="Form submitted successfully!" />
            )}

            {/* Name field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Name *
              </label>
              <Input
                id="name"
                type="text"
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                aria-invalid={touched.name && !!errors.name}
                aria-describedby={
                  touched.name && errors.name ? 'name-error' : undefined
                }
                className={
                  touched.name && errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                }
              />
              <FormFieldError
                error={errors.name?.message}
                touched={touched.name}
              />
            </div>

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={
                  touched.email && errors.email ? 'email-error' : undefined
                }
                className={
                  touched.email && errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                }
              />
              <FormFieldError
                error={errors.email?.message}
                touched={touched.email}
              />
            </div>

            {/* Phone field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Phone Number *
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254712345678"
                value={values.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                aria-invalid={touched.phone && !!errors.phone}
                aria-describedby={
                  touched.phone && errors.phone ? 'phone-error' : undefined
                }
                className={
                  touched.phone && errors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                }
              />
              <FormFieldError
                error={errors.phone?.message}
                touched={touched.phone}
              />
            </div>

            {/* Message field */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Message *
              </label>
              <textarea
                id="message"
                rows={4}
                value={values.message}
                onChange={(e) => handleChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                aria-invalid={touched.message && !!errors.message}
                aria-describedby={
                  touched.message && errors.message
                    ? 'message-error'
                    : undefined
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  touched.message && errors.message
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              <FormFieldError
                error={errors.message?.message}
                touched={touched.message}
              />
            </div>

            {/* Submit button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            </div>
          </form>
        </LoadingOverlay>
      </CardContent>
    </Card>
  );
}
