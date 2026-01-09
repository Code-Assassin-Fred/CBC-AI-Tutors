import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { UserPreferences } from "@/types/userprofile";

const defaultPreferences: UserPreferences = {
    studyReminders: true,
    soundEffects: false,
    weeklyReports: true,
};

export async function GET(req: NextRequest, context: { params: Promise<{ uid: string }> }) {
    try {
        const params = await context.params;
        const uid = params?.uid;

        if (!uid) {
            return NextResponse.json({ success: false, message: "Missing user id" }, { status: 400 });
        }

        const userRef = adminDb.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return NextResponse.json({
                success: true,
                settings: {
                    displayName: "",
                    grade: null,
                    preferences: defaultPreferences,
                },
            });
        }

        const data = userSnap.data();

        return NextResponse.json({
            success: true,
            settings: {
                displayName: data?.displayName || "",
                grade: data?.grade || null,
                photoURL: data?.photoURL || null,
                preferences: data?.preferences || defaultPreferences,
            },
        });
    } catch (error) {
        console.error("GET /api/user/[uid]/settings error:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ uid: string }> }) {
    try {
        const params = await context.params;
        const uid = params?.uid;

        if (!uid) {
            return NextResponse.json({ success: false, message: "Missing user id" }, { status: 400 });
        }

        const body = await req.json();
        const { displayName, grade, preferences } = body;

        const updateData: Record<string, unknown> = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (grade !== undefined) updateData.grade = grade;
        if (preferences !== undefined) updateData.preferences = preferences;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, message: "No fields to update" }, { status: 400 });
        }

        const userRef = adminDb.collection("users").doc(uid);
        await userRef.set(updateData, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH /api/user/[uid]/settings error:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
