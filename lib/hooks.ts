// Placeholder for hooks
export const useAuthUser = () => {
  return {
    user: null,
    loading: false,
    profile: null,
    institution: null,
  };
};

export const useAuthActions = () => {
  return {
    loading: false,
    setError: (error: string) => {
      console.error(error);
    },
  };
};

export const useFormState = <T extends Record<string, any>>(initialValues: T) => {
  const state = {
    values: initialValues,
    errors: {} as Record<string, string>,
    setValue: (key: keyof T, value: any) => {
      state.values[key] = value;
    },
    setError: (key: keyof T, error: string) => {
      state.errors[key as string] = error;
    },
    clearErrors: () => {
      state.errors = {};
    },
    setSubmitting: (isSubmitting: boolean) => {
      console.log(`Submitting: ${isSubmitting}`);
    },
  };
  return state;
};