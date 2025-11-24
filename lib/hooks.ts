'use client';

import { useState } from 'react';

export function useFormState<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as any);

  const setValue = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null })); // Clear error when user types
  };

  const setError = (field: keyof T, message: string | null) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({} as any);
  };

  return {
    values,
    setValue,
    errors,
    setError,
    reset,
  };
}
