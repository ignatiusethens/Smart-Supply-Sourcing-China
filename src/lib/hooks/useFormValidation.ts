/**
 * Form Validation Hook
 * Provides comprehensive form validation with error handling
 * Validates: Requirements 22.1, 22.2
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface FieldError {
  message: string;
  type?: string;
}

export interface FormErrors {
  [key: string]: FieldError | undefined;
}

export interface TouchedFields {
  [key: string]: boolean;
}

export interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: FormErrors;
  touched: TouchedFields;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    async (field: keyof T): Promise<boolean> => {
      try {
        // Validate the entire object but only check for errors on this field
        await schema.parseAsync(values);
        
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Find errors for this specific field
          const fieldErrors = error.issues.filter(err => 
            err.path.length > 0 && err.path[0] === field
          );
          
          if (fieldErrors.length > 0) {
            const fieldError = fieldErrors[0];
            setErrors((prev) => ({
              ...prev,
              [field]: {
                message: fieldError.message,
                type: fieldError.code,
              },
            }));
          }
        }
        return false;
      }
    },
    [schema, values]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    try {
      await schema.parseAsync(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = {
            message: err.message,
            type: err.code,
          };
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema, values]);

  // Handle field change
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      
      if (validateOnChange && touched[field as string]) {
        // Validate after state update
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, touched, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      
      if (validateOnBlur) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched: TouchedFields = {};
      Object.keys(values).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Validate form
      const isValid = await validateForm();
      
      if (!isValid) {
        return;
      }

      // Submit form
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        // Handle submission errors
        if (error instanceof Error) {
          setErrors((prev) => ({
            ...prev,
            _form: {
              message: error.message,
              type: 'submit',
            },
          }));
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  // Set field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: {
        message: error,
        type: 'manual',
      },
    }));
  }, []);

  // Set field touched programmatically
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateField,
    validateForm,
  };
}

/**
 * Helper hook for simple form validation without full form state management
 */
export function useFieldValidation<T>(
  schema: z.ZodSchema<T>,
  initialValue: T
) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const validate = useCallback(
    async (val: T = value): Promise<boolean> => {
      try {
        await schema.parseAsync(val);
        setError(undefined);
        return true;
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.issues[0]?.message);
        }
        return false;
      }
    },
    [schema, value]
  );

  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    if (touched) {
      validate(newValue);
    }
  }, [touched, validate]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    validate();
  }, [validate]);

  return {
    value,
    error,
    touched,
    setValue,
    setError,
    setTouched,
    handleChange,
    handleBlur,
    validate,
  };
}
