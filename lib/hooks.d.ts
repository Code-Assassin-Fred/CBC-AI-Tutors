export declare const useAuthUser: () => {
  user: null;
  loading: boolean;
  profile: null;
  institution: null;
};

export declare const useAuthActions: () => {
  loading: boolean;
  setError: (error: string) => void;
};

export declare const useFormState: <T extends Record<string, any>>(initialValues: T) => {
  values: T;
  errors: Record<string, string>;
  setValue: (key: keyof T, value: any) => void;
  setError: (key: keyof T, error: string) => void;
  clearErrors: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
};