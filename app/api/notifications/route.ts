import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { UserNotification } from "@/types/userprofile";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
        }

        const notificationsRef = adminDb
            .collection("notifications")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(20);

        const snapshot = await notificationsRef.get();
        const notifications: UserNotification[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            notifications.push({
                id: doc.id,
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: data.type || "info",
                read: data.read || false,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            });
        });

        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        console.error("GET /api/notifications error:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { notificationIds, markAllRead, userId } = body;

        if (markAllRead && userId) {
            // Mark all notifications as read for this user
            const notificationsRef = adminDb
                .collection("notifications")
                .where("userId", "==", userId)
                .where("read", "==", false);

            const snapshot = await notificationsRef.get();
            const batch = adminDb.batch();

            snapshot.forEach((doc) => {
                batch.update(doc.ref, { read: true });
            });

            await batch.commit();
            return NextResponse.json({ success: true, updated: snapshot.size });
        }

        if (notificationIds && Array.isArray(notificationIds)) {
            const batch = adminDb.batch();

            for (const id of notificationIds) {
                const docRef = adminDb.collection("notifications").doc(id);
                batch.update(docRef, { read: true });
            }

            await batch.commit();
            return NextResponse.json({ success: true, updated: notificationIds.length });
        }

        return NextResponse.json({ success: false, message: "No valid parameters" }, { status: 400 });
    } catch (error) {
        console.error("PATCH /api/notifications error:", error);
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
