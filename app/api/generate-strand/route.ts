/**
 * Enhanced Strand Generation API
 * 
 * Generates professional-quality textbook content using multi-phase generation:
 * 1. Student content with subject-specific structure
 * 2. Teacher guide content
 * 3. Image placeholders with AI tutor descriptions
 * 4. Structured sections for rendering
 * 
 * Stores content in Firestore with separate images collection for AI tutoring.
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { adminDb } from "@/lib/firebaseAdmin";
import { generateEnhancedTextbook } from "@/lib/api/generateEnhanced";
import { ImageMetadata } from "@/types/textbook";

// ============================================
// CURRICULUM LOADER
// ============================================

const loadContentJson = () => {
  const filePath = path.join(process.cwd(), "content.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

// ============================================
// API HANDLER
// ============================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { grade, subject, strand, generatedBy, useEnhanced = true } = body;

    // Validate required fields
    if (!grade || !subject || !strand) {
      return NextResponse.json(
        { error: "Missing grade, subject, or strand" },
        { status: 400 }
      );
    }

    // Load and validate curriculum data
    const curriculum = loadContentJson();

    if (!curriculum[grade] || !curriculum[grade][subject]) {
      return NextResponse.json(
        { error: "Invalid grade or subject" },
        { status: 400 }
      );
    }

    const strands = curriculum[grade][subject].Strands;
    const selectedStrand = strands[strand];

    if (!selectedStrand) {
      return NextResponse.json(
        { error: "Strand not found" },
        { status: 404 }
      );
    }

    const subStrands = selectedStrand.SubStrands || selectedStrand;

    // Collect all generated content
    const allStudentHtml: string[] = [];
    const allTeacherHtml: string[] = [];
    const allImages: ImageMetadata[] = [];
    const allSections: any[] = [];

    console.log(`[Generate] Starting generation for ${strand} (${Object.keys(subStrands).length} sub-strands)`);

    // Generate content for each sub-strand
    for (const [subName, details] of Object.entries<any>(subStrands)) {
      const outcomes = details.Outcomes || [];

      console.log(`[Generate] Processing sub-strand: ${subName}`);

      try {
        // Use enhanced generation
        const result = await generateEnhancedTextbook({
          grade,
          subject,
          strand,
          substrand: subName,
          outcomes,
          generatedBy: generatedBy || "anonymous"
        });

        allStudentHtml.push(result.studentContent.html);
        allTeacherHtml.push(result.teacherContent.html);
        allImages.push(...result.images);
        allSections.push(...result.studentContent.sections);

        console.log(`[Generate] Completed: ${subName} (${result.images.length} images)`);
      } catch (subError) {
        console.error(`[Generate] Error in sub-strand ${subName}:`, subError);
        // Continue with other sub-strands even if one fails
      }
    }

    // Combine all content
    const finalStudentHtml = allStudentHtml.join("\n\n<hr class=\"substrand-divider\" />\n\n");
    const finalTeacherHtml = allTeacherHtml.join("\n\n<hr class=\"substrand-divider\" />\n\n");

    // Create document ID
    const docId = `${grade}_${subject}_${strand.replace(/\s+/g, "_")}`;

    // Store images in separate collection (for AI tutoring)
    console.log(`[Generate] Storing ${allImages.length} images...`);
    const imagePromises = allImages.map(image =>
      adminDb.collection("images").doc(image.id).set({
        ...image,
        createdAt: new Date()
      })
    );
    await Promise.all(imagePromises);

    // Store textbook document with enhanced structure
    console.log(`[Generate] Storing textbook document: ${docId}`);
    await adminDb.collection("textbooks").doc(docId).set(
      {
        // Metadata
        grade,
        subject,
        strand,
        generatedAt: new Date(),
        generatedBy: generatedBy || "anonymous",
        version: "2.0",

        // Enhanced student content
        student_content: {
          html: finalStudentHtml,
          sections: allSections,
          imageIds: allImages.map(img => img.id)
        },

        // Enhanced teacher content
        teacher_content: {
          html: finalTeacherHtml,
          sections: [], // Teacher sections can be extracted similarly
          imageIds: []
        },

        // Legacy fields for backward compatibility
        student_html: finalStudentHtml,
        teacher_html: finalTeacherHtml
      },
      { merge: true }
    );

    console.log(`[Generate] Successfully completed: ${docId}`);

    return NextResponse.json({
      success: true,
      message: "Strand generated and saved successfully",
      grade,
      subject,
      strand,
      textbookId: docId,
      imageCount: allImages.length,
      sectionCount: allSections.length,
      // Include content for immediate display
      student_html: finalStudentHtml,
      teacher_html: finalTeacherHtml
    });

  } catch (err: any) {
    console.error("[Generate] Error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}