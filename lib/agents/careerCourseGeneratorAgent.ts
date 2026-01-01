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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export class CareerCourseGeneratorAgent {
    private model: ReturnType<typeof genAI.getGenerativeModel>;
    private config: CareerAgentConfig;

    constructor(config?: Partial<CareerAgentConfig>) {
        this.config = {
            model: 'gemini-2.0-flash-exp',
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
    ): Promise<{ course: CareerCourse; lessons: CourseLesson[] }> {
        console.log(`[CareerCourseGeneratorAgent] Generating course for: ${request.skillName}`);

        const topicsText = request.skillTopics.join(', ');

        const prompt = `You are an expert course creator. Design a comprehensive course for learning "${request.skillName}" as part of a "${request.careerTitle}" career path.

SKILL: ${request.skillName}
TOPICS TO COVER: ${topicsText}
DIFFICULTY: ${request.difficulty}
TARGET AUDIENCE: ${request.targetAudience}

Create a course with 4-6 lessons covering these topics progressively.

Return a JSON object with this EXACT structure:
{
    "course": {
        "title": "Engaging Course Title",
        "description": "2-3 sentence course description",
        "estimatedTime": "X hours"
    },
    "lessons": [
        {
            "order": 1,
            "title": "Lesson Title",
            "description": "Brief lesson description",
            "estimatedTime": "15-20 minutes",
            "readContent": {
                "title": "Lesson Title",
                "overview": "Introduction paragraph",
                "sections": [
                    {
                        "heading": "Section Heading",
                        "content": "Detailed educational content with examples",
                        "keyPoints": ["Key point 1", "Key point 2"]
                    }
                ],
                "summary": "Summary paragraph",
                "examples": [
                    {
                        "title": "Example Title",
                        "description": "Example description",
                        "code": "code example if applicable"
                    }
                ]
            },
            "podcastScript": {
                "title": "Lesson Title",
                "introduction": "Welcome introduction",
                "segments": [
                    {
                        "speaker": "Teacher",
                        "speakerName": "Jordan",
                        "content": "Teaching content"
                    },
                    {
                        "speaker": "Student",
                        "speakerName": "Beau",
                        "content": "Student question or interaction"
                    }
                ],
                "conclusion": "Wrap up"
            },
            "immersiveContent": {
                "title": "Lesson Title",
                "scenarioDescription": "Interactive scenario description",
                "learningObjectives": ["Objective 1", "Objective 2"],
                "conceptExplanation": "Concept to test understanding of",
                "practicePrompts": ["Practice prompt 1", "Practice prompt 2"]
            }
        }
    ]
}

IMPORTANT:
- Each lesson should have comprehensive readContent with 2-4 sections
- Podcast script should be conversational between Jordan (teacher) and Beau (student)
- Immersive content should focus on hands-on practice
- Content should be educational, not superficial
- Include real-world examples and practical applications`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse course data');
            }

            const data = JSON.parse(jsonMatch[0]);

            const courseId = `career-course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const lessonIds: string[] = [];

            // Process lessons
            const lessons: CourseLesson[] = data.lessons.map((lesson: any, idx: number) => {
                const lessonId = `${courseId}-lesson-${idx + 1}`;
                lessonIds.push(lessonId);

                return {
                    id: lessonId,
                    courseId,
                    order: lesson.order || idx + 1,
                    title: lesson.title,
                    description: lesson.description,
                    estimatedTime: lesson.estimatedTime || '15 minutes',
                    readContent: lesson.readContent as ReadModeContent,
                    podcastScript: lesson.podcastScript as PodcastScript,
                    immersiveContent: lesson.immersiveContent as ImmersiveContent
                };
            });

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
                lessonCount: lessons.length,
                lessonIds,
                order: 0, // Will be set by orchestrator
                createdAt: new Date()
            };

            console.log(`[CareerCourseGeneratorAgent] Generated course with ${lessons.length} lessons`);
            return { course, lessons };

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
    ): Promise<{ courses: CareerCourse[]; allLessons: CourseLesson[] }> {
        console.log(`[CareerCourseGeneratorAgent] Generating ${requests.length} courses`);

        const courses: CareerCourse[] = [];
        const allLessons: CourseLesson[] = [];

        for (let i = 0; i < requests.length; i++) {
            try {
                const { course, lessons } = await this.generateCourse(
                    requests[i],
                    careerPathId,
                    skillIds[i] || `skill-${i}`,
                    phaseOrder
                );
                course.order = i + 1;
                courses.push(course);
                allLessons.push(...lessons);
            } catch (error) {
                console.error(`[CareerCourseGeneratorAgent] Failed for ${requests[i].skillName}:`, error);
            }
        }

        console.log(`[CareerCourseGeneratorAgent] Generated ${courses.length}/${requests.length} courses`);
        return { courses, allLessons };
    }
}
