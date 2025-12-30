import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Using standard model as we want rich text, but we can use schema for metadata + content separation
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
                title: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                markdownContent: { type: SchemaType.STRING },
                category: { type: SchemaType.STRING, enum: ["career-specific", "meta-learning", "ai-future", "tools"] },
                subcategory: { type: SchemaType.STRING },
                tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                difficulty: { type: SchemaType.STRING, enum: ["beginner", "intermediate", "advanced"] },
                duration: { type: SchemaType.STRING }
            },
            required: ["title", "description", "markdownContent", "category", "subcategory", "tags", "difficulty", "duration"]
        }
    }
});

export async function POST(req: NextRequest) {
    try {
        const { topic, context } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        const prompt = `
            You are an expert educator and technical writer.
            Write a comprehensive educational article about: "${topic}".
            
            Context/Audience: ${context || "A student exploring career options and learning new skills."}
            
            The content should be in Markdown format. Use headers, bullet points, and code blocks where appropriate.
            The article should be engaging, practical, and highly informative.
            
            Also provide metadata including category, difficulty, and estimated reading time.
        `;

        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text());

        return NextResponse.json(data);

    } catch (error) {
        console.error('Article generation error:', error);
        return NextResponse.json({ error: 'Failed to generate article' }, { status: 500 });
    }
}
