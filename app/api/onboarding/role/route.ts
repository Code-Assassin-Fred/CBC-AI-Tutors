import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import type { UserRole } from "@/types/onboarding"; 

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = (await req.json()) as { userId: string; role: UserRole };
    if (!userId || !role) {
      return NextResponse.json({ success: false, message: "Missing userId or role" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);

    await userRef.set(
      { role, onboardingComplete: false, updatedAt: new Date() },
      { merge: true }
    );

    const userDoc = await userRef.get();
    const userData = userDoc.data();

    return NextResponse.json({ success: true, role: userData?.role, onboardingComplete: userData?.onboardingComplete ?? false });
  } catch (error) {
    console.error("Role API error:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
