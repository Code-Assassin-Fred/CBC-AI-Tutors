"use client";

import { useEffect, useState } from "react";
/**
 * Minimal, conservative role/redirect hooks.
 *
 * Purpose: provide a small shim that satisfies imports used across the app
 * while avoiding runtime side-effects (no automatic redirects). Replace
 * these with real implementations that integrate with your auth/profile
 * provider when available.
 */

export function useAuthPageRedirect() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Minimal behavior: no redirects here. The caller will handle navigation.
    // We keep a small delay so callers that expect a short-loading state can
    // show a spinner briefly.
    const t = setTimeout(() => setIsLoading(false), 10);
    return () => clearTimeout(t);
  }, []);

  return { isLoading };
}

export function useOnboardingProtection() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // No-op guard for now. Consumers check `user` and `profile` separately
    // and will redirect when appropriate. This hook only provides a loading
    // signal so pages can show a loader while auth/profile state is resolved.
    const t = setTimeout(() => setIsLoading(false), 10);
    return () => clearTimeout(t);
  }, []);

  return { isLoading };
}

export function useDashboardProtection(_allowedRoles?: string[]) {
  // Intentionally a no-op hook. Real implementation should check the current
  // user's role and onboarding status and redirect (via next/navigation) when
  // access is not allowed. Keeping this minimal reduces risk while restoring
  // the missing module.
  useEffect(() => {
    // placeholder
  }, [_allowedRoles]);
}

export default null;
