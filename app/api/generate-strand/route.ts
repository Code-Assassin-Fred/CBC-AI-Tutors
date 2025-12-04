import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const GRADE_INTENSITY: Record<string, string> = {
  "4": "simple, clear, age-appropriate, short sentences, advanced academic, precise terminology, abstract reasoning",
  "5": "simple, clear, age-appropriate, short sentences, advanced academic, precise terminology, abstract reasoning",
  "6": "medium, longer sentences, slightly advanced vocabulary, advanced academic, precise terminology, abstract reasoning",
  "7": "medium, longer sentences, slightly advanced vocabulary, advanced academic, precise terminology, abstract reasoning",
  "8": "advanced intermediate, multi-step reasoning, advanced academic, precise terminology, abstract reasoning",
  "9": "advanced intermediate, multi-step reasoning, advanced academic, precise terminology, abstract reasoning",
  "10": "advanced academic, precise terminology, abstract reasoning",
  "11": "advanced academic, precise terminology, abstract reasoning",
  "12": "advanced academic, precise terminology, abstract reasoning"
};

const loadContentJson = () => {
  const filePath = path.join(process.cwd(), "content.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

const studentPrompt = (
  grade: string,
  subject: string,
  strand: string,
  substrand: string,
  outcomes: string[]
) => {
  const intensity = GRADE_INTENSITY[grade] || "simple, clear language";
  const outcomesText = outcomes.join(", ");

  return `You are a senior Kenyan curriculum developer writing the official Grade ${grade} ${subject} Learner's Book.
Use language appropriate for Grade ${grade}: ${intensity}.
Use ONLY the following HTML structure and NOTHING else:

<h2>Sub-Strand Title</h2>
<section class="learning-outcomes">
  <h3>Learning Outcomes</h3>
  <ul><li>...</li></ul>
</section>

<section class="key-concepts">
  <h3>Key Concepts</h3>
  <p>...</p>
</section>

<section class="content-explanation">
  <h3>Content Explanation</h3>
  <p>...</p>
  <h4>Examples</h4>
  <div class="example-box">
    <ul><li>...</li></ul>
  </div>
</section>

<section class="activity">
  <h3>Activity</h3>
  <p>...</p>
  <ul><li>...</li></ul>
</section>

RULES:
- Use <h2> ONLY for Sub-Strand title.
- Use <h3> for main section titles.
- Use <h4> for sub‑section titles.
- Use <ul> and <ol> for all lists.
- Wrap examples inside <div class="example-box">.
- Return CLEAN HTML ONLY.

Strand: ${strand}
Sub-Strand: ${substrand}
Strand Outcomes: ${outcomesText}

Write the full structured content now.`;
};

const teacherPrompt = (
  grade: string,
  subject: string,
  strand: string,
  substrand: string,
  outcomes: string[]
) => {
  const intensity = GRADE_INTENSITY[grade] || "simple, clear language";
  const outcomesText = outcomes.join(", ");

  return `You are writing the official Teacher's Guide for Grade ${grade} ${subject}.
Use language appropriate for Grade ${grade}: ${intensity}.
Use ONLY the following HTML structure:

<h2>Sub-Strand Title</h2>
<section class="lesson-objectives">
  <h3>Lesson Objectives</h3>
  <ul><li>...</li></ul>
</section>

<section class="prior-knowledge">
  <h3>Suggested Prior Knowledge</h3>
  <p>...</p>
</section>

<section class="concept-development">
  <h3>Key Concepts & Concept Development</h3>
  <p>...</p>
</section>

<section class="teaching-experiences">
  <h3>Teaching & Learning Experiences</h3>
  <ul><li>...</li></ul>
</section>

<section class="differentiation">
  <h3>Differentiation & Support</h3>
  <p>...</p>
</section>

<section class="assessment">
  <h3>Assessment for Learning</h3>
  <ul><li>...</li></ul>
</section>

<section class="misconceptions">
  <h3>Common Errors & Misconceptions</h3>
  <p>...</p>
</section>

<section class="cross-curricular">
  <h3>Cross-Curricular Links</h3>
  <p>...</p>
</section>

<section class="community-links">
  <h3>Real-Life & Community Connections</h3>
  <p>...</p>
</section>

RULES:
- <h2> ONLY for the sub-strand heading.
- <h3> ONLY for main sections.
- <h4> ONLY for subsection headings.
- Use <ul> for lists.
- Return CLEAN HTML ONLY.

Strand: ${strand}
Sub-Strand: ${substrand}
Strand Learning Outcomes: ${outcomesText}

Write the full structured Teacher's Guide now.`;
};

const callOpenAI = async (prompt: string) => {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: "You are an expert educational content writer." },
      { role: "user", content: prompt }
    ],
    temperature: 0.35,
    max_tokens: 6000
  });

  return completion.choices[0]?.message?.content || "";
};

export async function POST(req: Request) {
  try {
    const { grade, subject, strand } = await req.json();

    if (!grade || !subject || !strand) {
      return NextResponse.json({ error: "Missing grade, subject, or strand" }, { status: 400 });
    }

    const curriculum = loadContentJson();

    if (!curriculum[grade] || !curriculum[grade][subject]) {
      return NextResponse.json({ error: "Invalid grade or subject" }, { status: 400 });
    }

    const strands = curriculum[grade][subject].Strands;
    const selectedStrand = strands[strand];

    if (!selectedStrand) {
      return NextResponse.json({ error: "Strand not found" }, { status: 404 });
    }

    const subStrands = selectedStrand.SubStrands || selectedStrand;
    const student_html: string[] = [];
    const teacher_html: string[] = [];

    for (const [subName, details] of Object.entries<any>(subStrands)) {
      const outcomes = details.Outcomes || [];

      const student = await callOpenAI(studentPrompt(grade, subject, strand, subName, outcomes));
      const teacher = await callOpenAI(teacherPrompt(grade, subject, strand, subName, outcomes));

      student_html.push(student);
      teacher_html.push(teacher);
    }

    return NextResponse.json({
      grade,
      subject,
      strand,
      student_html: student_html.join("\n"),
      teacher_html: teacher_html.join("\n")
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
