import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const grade = searchParams.get("grade");

        const contentDir = path.join(process.cwd(), "content");

        if (!grade) {
            // Return list of available grades
            if (!fs.existsSync(contentDir)) {
                return NextResponse.json({ grades: [] });
            }

            const files = fs.readdirSync(contentDir);
            const grades = files
                .filter(f => f.startsWith("Grade ") && f.endsWith(".json"))
                .map(f => f.replace("Grade ", "").replace(".json", ""));

            return NextResponse.json({ grades });
        }

        // Return content for a specific grade
        const fileName = `Grade ${grade}.json`;
        const filePath = path.join(contentDir, fileName);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: `Grade content not found for ${grade}` },
                { status: 404 }
            );
        }

        const rawContent = fs.readFileSync(filePath, "utf-8");
        const content = JSON.parse(rawContent);

        // Some files might have the grade as a top-level key, others might not.
        // Standardize the response to just the content of that grade.
        const gradeContent = content[grade] || content;

        return NextResponse.json(gradeContent);
    } catch (error: any) {
        console.error("Curriculum API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch curriculum data" },
            { status: 500 }
        );
    }
}
