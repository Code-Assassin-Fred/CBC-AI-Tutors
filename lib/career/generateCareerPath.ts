/**
 * Career Path Generator
 * 
 * Single AI function that generates a complete career learning path
 * with courses and learning outcomes.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CareerPath, CareerCourse, LearningOutcome } from '@/types/careerPath';

const apiKey = process.env.GEMINI_IMAGE_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

interface GenerationCallbacks {
    onProgress: (message: string, percentage: number) => void;
}

export async function generateCareerPath(
    careerTitle: string,
    userId: string,
    callbacks?: GenerationCallbacks
): Promise<CareerPath> {
    callbacks?.onProgress('Analyzing career requirements...', 10);

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
        },
    });

    const prompt = buildCareerPrompt(careerTitle);

    callbacks?.onProgress('Curating learning path...', 30);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    callbacks?.onProgress('Building course structure...', 70);

    const parsed = JSON.parse(text);

    callbacks?.onProgress('Finalizing career path...', 90);

    const careerPath = buildCareerPath(parsed, careerTitle, userId);

    callbacks?.onProgress('Complete!', 100);

    return careerPath;
}

function buildCareerPrompt(careerTitle: string): string {
    return `You are an expert career counselor and curriculum designer. Create a comprehensive, industry-standard learning path for someone who wants to become a "${careerTitle}".

Generate a complete career learning path with the following structure:

1. Career Overview
   - Brief description of the role
   - Estimated time to job-ready (e.g., "6-12 months")
   - Difficulty level (beginner/intermediate/advanced)

2. Courses (generate as many as needed to be comprehensive, typically 8-15 courses)
   - Each course should build on previous ones
   - Include foundational courses before advanced topics
   - Each course needs 3-5 specific learning outcomes

IMPORTANT GUIDELINES:
- Use current industry standards and modern technologies
- Include both theoretical foundations and practical skills
- Order courses from fundamentals to advanced topics
- Learning outcomes should be specific and measurable
- Include real-world project skills where applicable
- Mention specific technologies, frameworks, and tools used in industry

Respond with a JSON object in this exact format:
{
    "description": "Brief 2-3 sentence description of this career path",
    "estimatedDuration": "X-Y months",
    "difficulty": "beginner" | "intermediate" | "advanced",
    "courses": [
        {
            "title": "Course Title",
            "description": "Brief course description",
            "duration": "X-Y weeks",
            "prerequisites": ["Previous Course Title"] or [],
            "learningOutcomes": [
                {
                    "title": "Outcome title",
                    "description": "What you'll learn and be able to do",
                    "keyTopics": ["Topic 1", "Topic 2", "Topic 3"]
                }
            ]
        }
    ]
}

Generate the complete learning path now:`;
}

function buildCareerPath(
    parsed: {
        description: string;
        estimatedDuration: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        courses: Array<{
            title: string;
            description: string;
            duration: string;
            prerequisites: string[];
            learningOutcomes: Array<{
                title: string;
                description: string;
                keyTopics: string[];
            }>;
        }>;
    },
    careerTitle: string,
    userId: string
): CareerPath {
    const pathId = `career-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const courses: CareerCourse[] = parsed.courses.map((course, index) => ({
        id: `course-${pathId}-${index + 1}`,
        order: index + 1,
        title: course.title,
        description: course.description,
        duration: course.duration,
        prerequisites: course.prerequisites,
        learningOutcomes: course.learningOutcomes.map((outcome, oIndex): LearningOutcome => ({
            id: `outcome-${pathId}-${index + 1}-${oIndex + 1}`,
            title: outcome.title,
            description: outcome.description,
            keyTopics: outcome.keyTopics,
        })),
    }));

    return {
        id: pathId,
        title: careerTitle,
        description: parsed.description,
        estimatedDuration: parsed.estimatedDuration,
        difficulty: parsed.difficulty,
        userId,
        createdAt: new Date(),
        courses,
    };
}
