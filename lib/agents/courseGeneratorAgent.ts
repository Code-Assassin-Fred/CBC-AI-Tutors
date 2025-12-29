/**
 * Course Generator Agent
 * 
 * Main orchestrator that coordinates curriculum planning, lesson generation,
 * and quiz creation for on-demand course generation.
 */

import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import {
    Course,
    CourseLesson,
    CourseQuiz,
    CourseOutline,
    LessonOutline,
    GenerationEvent,
    CourseGenerationRequest,
} from '@/types/course';
import {
    ReadModeContent,
    PodcastScript,
    ImmersiveContent,
    QuizQuestion,
} from '@/lib/types/agents';
import { planCurriculum } from './curriculumPlannerAgent';
import {
    LESSON_ANALYZE_PROMPT,
    LESSON_READ_CONTENT_PROMPT,
    LESSON_PODCAST_PROMPT,
    LESSON_IMMERSIVE_PROMPT,
    LESSON_QUIZ_PROMPT,
    FINAL_EXAM_PROMPT,
} from '@/lib/prompts/coursePrompts';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

// ============================================
// LESSON CONTENT GENERATION
// ============================================

interface LessonAnalysis {
    keyConcepts: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    prerequisites: string[];
    commonMisconceptions: string[];
    estimatedLearningTime: string;
}

async function analyzeLesson(outline: LessonOutline): Promise<LessonAnalysis> {
    const prompt = LESSON_ANALYZE_PROMPT(
        outline.title,
        outline.topics,
        outline.learningObjectives
    );

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '{}';
    return JSON.parse(text) as LessonAnalysis;
}

async function generateReadContent(
    outline: LessonOutline,
    analysis: LessonAnalysis
): Promise<ReadModeContent> {
    const prompt = LESSON_READ_CONTENT_PROMPT(
        outline.title,
        outline.topics,
        outline.learningObjectives,
        analysis.keyConcepts
    );

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '{}';
    return JSON.parse(text) as ReadModeContent;
}

async function generatePodcastScript(
    outline: LessonOutline,
    readContent: ReadModeContent,
    analysis: LessonAnalysis
): Promise<PodcastScript> {
    // Combine read content into text for podcast context
    const contentSummary = readContent.sections
        .map(s => `${s.title}: ${s.content}`)
        .join('\n\n');

    const prompt = LESSON_PODCAST_PROMPT(
        outline.title,
        contentSummary,
        analysis.keyConcepts
    );

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8, // Slightly higher for more natural conversation
        response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '{}';
    return JSON.parse(text) as PodcastScript;
}

async function generateImmersiveContent(
    outline: LessonOutline,
    analysis: LessonAnalysis
): Promise<ImmersiveContent> {
    const prompt = LESSON_IMMERSIVE_PROMPT(
        outline.title,
        analysis.keyConcepts,
        outline.learningObjectives
    );

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '{}';
    return JSON.parse(text) as ImmersiveContent;
}

async function generateLessonQuiz(
    outline: LessonOutline,
    analysis: LessonAnalysis
): Promise<QuizQuestion[]> {
    const prompt = LESSON_QUIZ_PROMPT(
        outline.title,
        analysis.keyConcepts,
        outline.learningObjectives
    );

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);
    return parsed.questions as QuizQuestion[];
}

// ============================================
// FULL LESSON GENERATION
// ============================================

async function generateFullLesson(
    courseId: string,
    outline: LessonOutline
): Promise<{ lesson: CourseLesson; quiz: CourseQuiz }> {
    // Step 1: Analyze
    const analysis = await analyzeLesson(outline);

    // Step 2: Generate read content
    const readContent = await generateReadContent(outline, analysis);

    // Step 3: Generate podcast script
    const podcastScript = await generatePodcastScript(outline, readContent, analysis);

    // Step 4: Generate immersive content
    const immersiveContent = await generateImmersiveContent(outline, analysis);

    // Step 5: Generate quiz
    const quizQuestions = await generateLessonQuiz(outline, analysis);

    const lessonId = uuidv4();
    const quizId = uuidv4();

    const lesson: CourseLesson = {
        id: lessonId,
        courseId,
        order: outline.order,
        title: outline.title,
        description: outline.description,
        estimatedTime: outline.estimatedTime,
        readContent,
        podcastScript,
        immersiveContent,
    };

    const quiz: CourseQuiz = {
        id: quizId,
        courseId,
        lessonId,
        type: 'lesson',
        title: `Quiz: ${outline.title}`,
        description: `Test your understanding of ${outline.title}`,
        questions: quizQuestions,
        passingScore: 70,
    };

    return { lesson, quiz };
}

// ============================================
// FINAL EXAM GENERATION
// ============================================

async function generateFinalExam(
    courseId: string,
    courseTitle: string,
    lessons: Array<{ title: string; concepts: string[] }>
): Promise<CourseQuiz> {
    const prompt = FINAL_EXAM_PROMPT(courseTitle, lessons);

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);

    return {
        id: uuidv4(),
        courseId,
        type: 'final',
        title: `Final Exam: ${courseTitle}`,
        description: 'Comprehensive exam covering all course material',
        questions: parsed.questions as QuizQuestion[],
        passingScore: 70,
        timeLimit: 30,
    };
}

// ============================================
// MAIN ORCHESTRATOR
// ============================================

export interface CourseGenerationResult {
    course: Course;
    lessons: CourseLesson[];
    quizzes: CourseQuiz[];
}

export type GenerationCallback = (event: GenerationEvent) => void;

export async function generateCourse(
    request: CourseGenerationRequest,
    onEvent: GenerationCallback
): Promise<CourseGenerationResult> {
    const courseId = uuidv4();
    const lessonCount = request.preferences?.lessonCount || 6;

    try {
        // ========================================
        // PHASE 1: CURRICULUM PLANNING
        // ========================================
        onEvent({
            type: 'progress',
            step: 'planning',
            message: 'Planning curriculum...',
            percentage: 5,
        });

        const outline = await planCurriculum(
            request.topic,
            {
                onStepStart: (step, message) => {
                    onEvent({
                        type: 'progress',
                        step: 'planning',
                        message,
                        percentage: 10,
                    });
                },
                onStepComplete: () => { },
                onError: (error) => {
                    throw new Error(error);
                },
            },
            {
                lessonCount,
                preferredDifficulty: request.preferences?.difficulty,
            }
        );

        onEvent({
            type: 'progress',
            step: 'outlining',
            message: `Course planned: ${outline.title} with ${outline.lessons.length} lessons`,
            percentage: 15,
            data: { courseTitle: outline.title, lessonCount: outline.lessons.length },
        });

        // ========================================
        // PHASE 2: GENERATE LESSONS
        // ========================================
        const lessons: CourseLesson[] = [];
        const quizzes: CourseQuiz[] = [];
        const lessonConcepts: Array<{ title: string; concepts: string[] }> = [];

        for (let i = 0; i < outline.lessons.length; i++) {
            const lessonOutline = outline.lessons[i];
            const progressPercent = 15 + Math.floor((i / outline.lessons.length) * 70);

            onEvent({
                type: 'progress',
                step: 'generating-lesson',
                lessonNumber: i + 1,
                message: `Generating lesson ${i + 1}/${outline.lessons.length}: ${lessonOutline.title}`,
                percentage: progressPercent,
            });

            const { lesson, quiz } = await generateFullLesson(courseId, lessonOutline);
            lessons.push(lesson);
            quizzes.push(quiz);

            // Track concepts for final exam
            lessonConcepts.push({
                title: lessonOutline.title,
                concepts: lessonOutline.topics,
            });

            onEvent({
                type: 'lesson-complete',
                lessonNumber: i + 1,
                message: `Completed: ${lessonOutline.title}`,
                percentage: progressPercent + 5,
            });
        }

        // ========================================
        // PHASE 3: GENERATE FINAL EXAM
        // ========================================
        if (request.preferences?.includeFinalExam !== false) {
            onEvent({
                type: 'progress',
                step: 'generating-quiz',
                message: 'Creating final exam...',
                percentage: 90,
            });

            const finalExam = await generateFinalExam(courseId, outline.title, lessonConcepts);
            quizzes.push(finalExam);
        }

        // ========================================
        // PHASE 4: FINALIZE
        // ========================================
        onEvent({
            type: 'progress',
            step: 'finalizing',
            message: 'Finalizing course...',
            percentage: 95,
        });

        const course: Course = {
            id: courseId,
            title: outline.title,
            description: outline.description,
            topic: request.topic,
            creatorId: request.userId,
            isPublic: true, // Default to public
            tags: outline.tags,
            difficulty: outline.difficulty,
            estimatedTime: outline.estimatedTime,
            lessonCount: lessons.length,
            createdAt: new Date(),
        };

        onEvent({
            type: 'done',
            message: 'Course generated successfully!',
            percentage: 100,
            data: { courseId: course.id },
        });

        return { course, lessons, quizzes };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        onEvent({
            type: 'error',
            error: errorMessage,
            message: `Failed to generate course: ${errorMessage}`,
        });
        throw error;
    }
}
