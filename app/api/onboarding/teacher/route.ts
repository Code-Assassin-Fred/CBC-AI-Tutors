import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { userId, name, subject, school, yearsExperience } = await req.json() as {
      userId: string;
      name: string;
      subject: string;
      school: string;
      yearsExperience?: string;
    };

    if (!userId || !name || !subject || !school) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const teacherRef = adminDb.collection("teachers").doc(userId);

    await teacherRef.set(
      {
        name,
        subject,
        school,
        yearsExperience: yearsExperience || "0",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    const userRef = adminDb.collection("users").doc(userId);
    await userRef.set({ onboardingComplete: true, updatedAt: new Date() }, { merge: true });

    return NextResponse.json({ success: true, redirectUrl: "/dashboard/teacher" });
  } catch (error) {
    console.error("Teacher onboarding API error:", error);
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
