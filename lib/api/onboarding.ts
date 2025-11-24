/**
 * Utility functions for calling onboarding API routes.
 * All functions return JSON responses or throw properly formatted errors.
 */

export async function saveRoleToDb(role: string) {
  try {
    const res = await fetch("/api/onboarding/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to save role");
    }

    return await res.json();
  } catch (err: any) {
    console.error("saveRoleToDb error:", err);
    throw new Error(err.message || "Unknown error");
  }
}

export async function onboardStudent(data: {
  level: string;
  subjects: string[];
  goals: string;
}) {
  try {
    const res = await fetch("/api/onboarding/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to save student profile");
    }

    return await res.json();
  } catch (err: any) {
    console.error("onboardStudent error:", err);
    throw new Error(err.message || "Unknown error");
  }
}

export async function setTeacherProfile(data: {
  expertise: string[];
  experience: string;
  bio: string;
}) {
  try {
    const res = await fetch("/api/onboarding/teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "Failed to save teacher profile");
    }

    return await res.json();
  } catch (err: any) {
    console.error("setTeacherProfile error:", err);
    throw new Error(err.message || "Unknown error");
  }
}
