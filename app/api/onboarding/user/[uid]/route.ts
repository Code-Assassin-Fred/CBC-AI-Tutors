import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: NextRequest,
  context: { params: { uid: string } } 
) {
  try {
    const uid = context.params.uid; 

    if (!uid) {
      return NextResponse.json(
        { success: false, message: "Missing user id" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      // User exists in Firebase Auth but not in Firestore yet
      return NextResponse.json({
        success: true,
        role: null,
        onboardingComplete: false,
      });
    }

    const data = userSnap.data();

    return NextResponse.json({
      success: true,
      role: data?.role ?? null,
      onboardingComplete: data?.onboardingComplete ?? false,
    });
  } catch (error) {
    console.error("GET /api/onboarding/user/[uid] error:", error);

    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
