import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// Helper: extract the composite key from URL param
function parseId(id: string) {
  const parts = id.split("_");
  if (parts.length < 3) return null;

  // Reconstruct strand (last parts may contain underscores from original strand name)
  const grade = parts[0];
  const subject = parts[1];
  const strand = parts.slice(2).join("_").replace(/_/g, " "); // revert spaces

  return { grade, subject, strand };
}

// GET – fetch by composite ID (already covered by /api/textbooks, but kept for consistency)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const parsed = parseId(id);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const docRef = adminDb.collection("textbooks").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }

    return NextResponse.json({
      exists: true,
      id: doc.id,
      ...doc.data(),
    });
  } catch (err: any) {
    console.error("GET textbook/[id] error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// DELETE – permanently delete a textbook
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const docRef = adminDb.collection("textbooks").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Textbook not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: "Textbook deleted successfully",
      deletedId: id,
    });
  } catch (err: any) {
    console.error("DELETE textbook/[id] error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// PATCH – replace entire textbook (useful for "regenerate and overwrite")
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const { student_html, teacher_html } = body;

    if (!student_html && !teacher_html) {
      return NextResponse.json(
        { error: "At least one of student_html or teacher_html is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };
    if (student_html) updateData.student_html = student_html;
    if (teacher_html) updateData.teacher_html = teacher_html;

    await adminDb.collection("textbooks").doc(id).set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Textbook updated successfully",
      updatedId: id,
    });
  } catch (err: any) {
    console.error("PATCH textbook/[id] error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}