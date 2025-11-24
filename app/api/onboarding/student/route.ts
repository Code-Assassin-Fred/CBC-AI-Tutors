import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { userId, name, age } = await req.json() as {
      userId: string;
      name: string;
      age?: number;
    };

    if (!userId || !name) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const studentRef = adminDb.collection("students").doc(userId);

    await studentRef.set(
      {
        name,
        age: age || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    const userRef = adminDb.collection("users").doc(userId);
    await userRef.set({ onboardingComplete: true, updatedAt: new Date() }, { merge: true });

    return NextResponse.json({ success: true, redirectUrl: "/dashboard/student" });
  } catch (error) {
    console.error("Student onboarding API error:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
