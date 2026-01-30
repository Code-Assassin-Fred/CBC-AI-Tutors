/**
 * Lesson Agent Service
 * 
 * Multi-agent workflow service for custom lesson generation.
 * Each agent handles a specific phase with real-time status updates via SSE.
 */

import { generateGeminiJSON, MODELS } from '@/lib/api/gemini';
import { adminDb } from '@/lib/firebaseAdmin';
import {
    LessonResearch,
    LessonOutline,
    SectionOutline,
} from '@/types/lesson-agent.types';
import {
    CustomLesson,
    CustomLessonContent,
    CustomLessonSection,
} from '@/types/customLesson';

// ============================================
// CONFIGURATION
// ============================================

const MODEL = MODELS.flash;

// ============================================
// ANALYST AGENT
// ============================================

/**
 * Analyst Agent: Researches the topic and audience needs
 */
export async function runAnalystAgent(
    topic: string,
    audienceAge: string,
    lessonTime?: string,
    specifications?: string
): Promise<LessonResearch> {
    const prompt = `You are an expert instructional designer and educational researcher. Analyze the following topic for lesson creation.

Topic: ${topic}
Target Audience: ${audienceAge}
Desired Duration: ${lessonTime || 'flexible'}
${specifications ? `Additional Requirements: ${specifications}` : ''}

Analyze this topic and provide:
1. A refined version of the topic (make it engaging and specific)
2. 3-4 key learning outcomes that are measurable
3. Assessment of difficulty level for the audience
4. Estimated total time needed to cover the core concepts effectively

IMPORTANT: You MUST write everything in 100% ENGLISH. All financial examples must use Kenyan Shillings (KES). Use Kenyan names, locations, and cultural contexts where appropriate.

Return JSON matching this structure:
{
    "analyzedTopic": "Refined, engaging topic title",
    "targetAudience": "Description of the target audience",
    "learningOutcomes": ["outcome 1", "outcome 2", "outcome 3"],
    "difficultyLevel": "Beginner/Intermediate/Advanced",
    "estimatedTotalTime": "${lessonTime || '45 minutes'}"
}`;

    const result = await generateGeminiJSON<LessonResearch>(prompt, MODEL);

    return {
        analyzedTopic: result.analyzedTopic || topic,
        targetAudience: result.targetAudience || audienceAge,
        learningOutcomes: result.learningOutcomes || [],
        difficultyLevel: result.difficultyLevel || 'Intermediate',
        estimatedTotalTime: result.estimatedTotalTime || lessonTime || '45 minutes',
    };
}

// ============================================
// PLANNER AGENT
// ============================================

/**
 * Planner Agent: Structures the lesson timeline and skeleton
 */
export async function runPlannerAgent(
    research: LessonResearch,
    specifications?: string
): Promise<LessonOutline> {
    const prompt = `You are an expert lesson planner. Create a structured outline for an educational lesson.

Topic: ${research.analyzedTopic}
Target Audience: ${research.targetAudience}
Learning Outcomes: ${research.learningOutcomes.join(', ')}
Total Time Budget: ${research.estimatedTotalTime}
${specifications ? `Additional Requirements: ${specifications}` : ''}

Create a structured skeleton with:
1. An engaging introduction (hook)
2. 3-4 teaching sections, each with:
   - Clear title
   - Brief description of what is covered
   - 3-4 key points to teach
   - Time allocation (must sum up with intro and activities to ${research.estimatedTotalTime})
3. Number of activities to include (at least 2)
4. Number of practical examples to include (at least 2)

IMPORTANT: You MUST write everything in 100% ENGLISH. Use KES for monetary values. Use Kenyan examples.

Return JSON matching this structure:
{
    "title": "Engaging Lesson Title",
    "introduction": "An engaging hook for the lesson...",
    "sections": [
        {
            "index": 0,
            "title": "Section Title",
            "description": "What this section covers",
            "keyPoints": ["point 1", "point 2"],
            "timeAllocation": "10 minutes"
        }
    ],
    "activityCount": 2,
    "exampleCount": 2
}`;

    const result = await generateGeminiJSON<LessonOutline>(prompt, MODEL);

    return {
        title: result.title || research.analyzedTopic,
        introduction: result.introduction || '',
        sections: (result.sections || []).map((s, i) => ({
            ...s,
            index: i
        })),
        activityCount: result.activityCount || 2,
        exampleCount: result.exampleCount || 2
    };
}

// ============================================
// INSTRUCTIONAL AGENT
// ============================================

/**
 * Instructional Agent: Generates detailed content for a single section
 */
export async function generateSectionContent(
    outline: LessonOutline,
    section: SectionOutline,
    research: LessonResearch
): Promise<CustomLessonSection> {
    const prompt = `You are a professional teacher writing content for a lesson.

Lesson Title: ${outline.title}
Target Audience: ${research.targetAudience}
Difficulty: ${research.difficultyLevel}

Section: ${section.title}
Target Time: ${section.timeAllocation}
Points to Cover: ${section.keyPoints.join(', ')}

Write engaging, educational prose for this section. 
- Use clear explanations appropriate for the audience.
- Include relatable analogies.
- Keep the length appropriate for a ${section.timeAllocation} segment.

IMPORTANT: Write in 100% ENGLISH. Use Kenyan names and places. No emojis.

Return JSON:
{
    "title": "${section.title}",
    "content": "The full section content written in clear, engaging prose...",
    "keyPoints": ["key takeaway 1", "key takeaway 2"]
}`;

    const result = await generateGeminiJSON<CustomLessonSection>(prompt, MODEL);

    return {
        title: result.title || section.title,
        content: result.content || '',
        keyPoints: result.keyPoints || section.keyPoints
    };
}

// ============================================
// CREATIVE AGENT
// ============================================

/**
 * Creative Agent: Designing activities and examples
 */
export async function generateEngagementContent(
    outline: LessonOutline,
    research: LessonResearch
): Promise<{
    activities: Array<{ title: string; description: string; duration: string }>;
    examples: Array<{ title: string; description: string; explanation: string }>;
    summary: string;
}> {
    const prompt = `You are a creative instructional designer. Add engagement elements to this lesson.

Lesson: ${outline.title}
Learning Outcomes: ${research.learningOutcomes.join(', ')}
Difficulty: ${research.difficultyLevel}

Generate:
1. ${outline.activityCount} classroom activities.
2. ${outline.exampleCount} practical examples with explanations.
3. A concise summary of the lesson.

IMPORTANT: Write in 100% ENGLISH. Use Kenyan context and KES for money. Use Kenyan names.

Return JSON:
{
    "activities": [
        { "title": "Activity name", "description": "How to do it", "duration": "10m" }
    ],
    "examples": [
        { "title": "Example name", "description": "Scenario description", "explanation": "Why this is relevant" }
    ],
    "summary": "Key takeaways for the students..."
}`;

    const result = await generateGeminiJSON<any>(prompt, MODEL);

    return {
        activities: result.activities || [],
        examples: result.examples || [],
        summary: result.summary || ''
    };
}

// ============================================
// ASSEMBLY AGENT
// ============================================

/**
 * Assembly Agent: Compiles the final lesson and saves to Firestore
 */
export async function assembleLesson(
    lessonId: string,
    teacherId: string,
    topic: string,
    audienceAge: string,
    specifications: string | undefined,
    lessonTime: string | undefined,
    research: LessonResearch,
    outline: LessonOutline,
    sections: CustomLessonSection[],
    engagement: {
        activities: Array<{ title: string; description: string; duration: string }>;
        examples: Array<{ title: string; description: string; explanation: string }>;
        summary: string;
    }
): Promise<CustomLesson> {
    const lesson: CustomLesson = {
        id: lessonId,
        teacherId,
        title: outline.title,
        topic,
        audienceAge,
        specifications,
        lessonTime: lessonTime || research.estimatedTotalTime,
        content: {
            introduction: outline.introduction,
            sections: sections,
            activities: engagement.activities,
            examples: engagement.examples,
            summary: engagement.summary
        },
        estimatedDuration: research.estimatedTotalTime,
        createdAt: new Date(),
    };

    // Save to Firestore
    const lessonRef = adminDb
        .collection('teachers')
        .doc(teacherId)
        .collection('customLessons')
        .doc(lessonId);

    await lessonRef.set({
        ...lesson,
        createdAt: new Date(),
    });

    return lesson;
}
