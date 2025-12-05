import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade");
    const subject = searchParams.get("subject");
    const strand = searchParams.get("strand");

    if (!grade || !subject || !strand) {
      return NextResponse.json(
        { error: "Missing grade, subject, or strand" },
        { status: 400 }
      );
    }

    const docId = `${grade}_${subject}_${strand.replace(/\s+/g, "_")}`;
    const doc = await adminDb.collection("textbooks").doc(docId).get();

    if (!doc.exists) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      ...doc.data(),
    });
  } catch (err: any) {
    console.error("Fetch textbook error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}