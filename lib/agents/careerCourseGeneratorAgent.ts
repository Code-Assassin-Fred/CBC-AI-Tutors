/**
 * Career Course Generator Agent
 * 
 * Generates complete courses tailored to specific career skills.
 * Creates full course structure with lessons for each skill domain.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CareerAgentConfig, CareerCourse, CareerCourseGenerationRequest } from '@/types/careerAgents';
import { CourseLesson } from '@/types/course';
import { ReadModeContent, PodcastScript, ImmersiveContent } from '@/lib/types/agents';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_IMAGE_API_KEY || '');

export class CareerCourseGeneratorAgent {
    private model: ReturnType<typeof genAI.getGenerativeModel>;
    private config: CareerAgentConfig;

    constructor(config?: Partial<CareerAgentConfig>) {
        this.config = {
            model: 'gemini-2.0-flash',
            temperature: 0.6,
            ...config
        };
        this.model = genAI.getGenerativeModel({
            model: this.config.model,
            generationConfig: {
                temperature: this.config.temperature,
                responseMimeType: "application/json",
            }
        });
    }

    async generateCourse(
        request: CareerCourseGenerationRequest,
        careerPathId: string,
        skillId: string,
        phaseOrder: number
    ): Promise<{ course: CareerCourse }> {
        console.log(`[CareerCourseGeneratorAgent] Generating course metadata for: ${request.skillName}`);

        const topicsText = request.skillTopics.join(', ');

        const prompt = `You are an expert course architect. Design a course outline for "${request.skillName}" as part of a "${request.careerTitle}" career path.

SKILL: ${request.skillName}
TOPICS TO COVER: ${topicsText}
DIFFICULTY: ${request.difficulty}
TARGET AUDIENCE: ${request.targetAudience}

Create a structured course outline with 4-6 lesson topics.

Return a JSON object with this EXACT structure:
{
    "course": {
        "title": "Engaging Course Title",
        "description": "2-3 sentence course description",
        "estimatedTime": "X hours",
        "syllabus": [
            "Topic 1: Introduction to...",
            "Topic 2: Core concepts of...",
            "Topic 3: Intermediate techniques...",
            "Topic 4: Practical application of...",
            "Topic 5: Advanced..."
        ]
    }
}

IMPORTANT:
- Focus on logical progression
- Provide clear, descriptive titles for each syllabus item
- Content should be tailored specifically for someone pursuing a career as a ${request.careerTitle}`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse course metadata');
            }

            const data = JSON.parse(jsonMatch[0]);

            const courseId = `career-course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const course: CareerCourse = {
                id: courseId,
                careerPathId,
                skillId,
                skillName: request.skillName,
                phaseOrder,
                title: data.course.title,
                description: data.course.description,
                difficulty: request.difficulty,
                estimatedTime: data.course.estimatedTime,
                syllabus: data.course.syllabus,
                lessonCount: data.course.syllabus.length,
                lessonIds: [], // To be populated when generated in the main courses system
                order: 0, // Will be set by orchestrator
                createdAt: new Date()
            };

            console.log(`[CareerCourseGeneratorAgent] Generated course metadata for ${course.title} with ${course.lessonCount} topics`);
            return { course };

        } catch (error) {
            console.error('[CareerCourseGeneratorAgent] Error:', error);
            throw new Error(`Failed to generate course for: ${request.skillName}`);
        }
    }

    async generateBatchCourses(
        requests: CareerCourseGenerationRequest[],
        careerPathId: string,
        skillIds: string[],
        phaseOrder: number
    ): Promise<{ courses: CareerCourse[] }> {
        console.log(`[CareerCourseGeneratorAgent] Generating ${requests.length} course outlines`);

        const courses: CareerCourse[] = [];

        for (let i = 0; i < requests.length; i++) {
            try {
                const { course } = await this.generateCourse(
                    requests[i],
                    careerPathId,
                    skillIds[i] || `skill-${i}`,
                    phaseOrder
                );
                course.order = i + 1;
                courses.push(course);
            } catch (error) {
                console.error(`[CareerCourseGeneratorAgent] Failed for ${requests[i].skillName}:`, error);
            }
        }

        console.log(`[CareerCourseGeneratorAgent] Generated ${courses.length}/${requests.length} course outlines`);
        return { courses };
    }
}
