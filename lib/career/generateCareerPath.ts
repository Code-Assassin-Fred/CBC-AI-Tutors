import { generateGeminiJSON, MODELS } from '@/lib/api/gemini';
import { CareerPath, CareerCourse } from '@/types/careerPath';

const MODEL = MODELS.flash;

interface GenerationCallbacks {
    onProgress: (message: string, percentage: number) => void;
}

export async function generateCareerPath(
    careerTitle: string,
    userId: string,
    callbacks?: GenerationCallbacks
): Promise<CareerPath> {
    callbacks?.onProgress('Analyzing career requirements...', 10);

    const prompt = buildCareerPrompt(careerTitle);
    const parsed = await generateGeminiJSON<any>(prompt, MODEL);

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
   - Difficulty level (beginner/intermediate/advanced)

2. Courses (generate as many as needed to be comprehensive)
   - Each course should build on previous ones
   - Include foundational courses before advanced topics

IMPORTANT GUIDELINES:
- Use current industry standards and modern technologies
- Include both theoretical foundations and practical skills
- Order courses from fundamentals to advanced topics
- Include real-world project skills where applicable
- Mention specific technologies, frameworks, and tools used in industry

Respond with a JSON object in this exact format:
{
    "description": "Brief 2-3 sentence description of this career path",
    "difficulty": "beginner" | "intermediate" | "advanced",
    "courses": [
        {
            "title": "Course Title",
            "description": "Brief course description"
        }
    ]
}

Generate the complete learning path now:`;
}

function buildCareerPath(
    parsed: {
        description: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        courses: Array<{
            title: string;
            description: string;
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
    }));

    return {
        id: pathId,
        title: careerTitle,
        description: parsed.description,
        difficulty: parsed.difficulty,
        userId,
        createdAt: new Date(),
        courses,
    };
}
