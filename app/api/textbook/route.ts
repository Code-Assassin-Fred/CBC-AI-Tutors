/**
 * Textbook Retrieval API
 * 
 * Fetches textbook content for student/teacher view.
 * Includes image metadata for AI tutoring integration.
 */

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { ImageMetadata } from "@/types/textbook";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade");
    const subject = searchParams.get("subject");
    const strand = searchParams.get("strand");

    // Validate required parameters
    if (!grade || !subject || !strand) {
      return NextResponse.json(
        { error: "Missing grade, subject, or strand" },
        { status: 400 }
      );
    }

    // Fetch textbook document
    const docId = `${grade}_${subject}_${strand.replace(/\s+/g, "_")}`;
    const doc = await adminDb.collection("textbooks").doc(docId).get();

    if (!doc.exists) {
      return NextResponse.json({ exists: false });
    }

    const textbookData = doc.data();

    // Fetch associated images for AI tutoring
    let images: ImageMetadata[] = [];

    // Try to get image IDs from new structure first
    const imageIds = textbookData?.student_content?.imageIds || [];

    if (imageIds.length > 0) {
      // Fetch images from separate collection
      const imagePromises = imageIds.map((id: string) =>
        adminDb.collection("images").doc(id).get()
      );

      const imageSnapshots = await Promise.all(imagePromises);

      images = imageSnapshots
        .filter(snap => snap.exists)
        .map(snap => {
          const data = snap.data();
          return {
            ...data,
            // Convert Firestore Timestamp to Date string
            createdAt: data?.createdAt?.toDate?.() || new Date()
          } as ImageMetadata;
        });
    }

    // Build response with backward compatibility
    return NextResponse.json({
      exists: true,

      // Core metadata
      grade: textbookData?.grade,
      subject: textbookData?.subject,
      strand: textbookData?.strand,
      version: textbookData?.version || "1.0",
      generatedAt: textbookData?.generatedAt?.toDate?.() || null,

      // New structured content (v2.0)
      student_content: textbookData?.student_content || null,
      teacher_content: textbookData?.teacher_content || null,

      // Images with descriptions for AI tutoring
      images,

      // Legacy fields for backward compatibility
      student_html: textbookData?.student_content?.html || textbookData?.student_html || "",
      teacher_html: textbookData?.teacher_content?.html || textbookData?.teacher_html || ""
    });

  } catch (err: any) {
    console.error("Fetch textbook error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}