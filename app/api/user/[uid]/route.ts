import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

interface Params {
  uid: string;
}

export async function GET(req: NextRequest, context: { params: Params }) {
  try {
    // Always unwrap the params
    const params = await Promise.resolve(context.params); 
    const uid = params?.uid;

    if (!uid) {
      return NextResponse.json(
        { success: false, message: "Missing user id" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
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
    console.error("GET /api/user/[uid] error:", error);

    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
