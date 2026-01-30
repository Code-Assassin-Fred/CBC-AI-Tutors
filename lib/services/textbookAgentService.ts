/**
 * Textbook Agent Service
 * 
 * Multi-agent workflow service for custom textbook generation.
 * Each agent handles a specific phase with real-time status updates.
 * 
 * Agents:
 * 1. Research Agent - Topic analysis and audience profiling
 * 2. Outline Agent - Structure planning with image slots
 * 3. Content Agent - Chapter-by-chapter generation
 * 4. Illustration Agent - AI image generation
 * 5. Assembly Agent - Final compilation and storage
 */

import { generateGeminiJSON, generateGeminiText, MODELS } from '@/lib/api/gemini';
import { generateImageWithGemini, GeminiGenerationResult } from '@/lib/api/geminiImageGeneration';
import { adminDb, adminStorage } from '@/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';
import {
    TopicResearch,
    TextbookOutline,
    ChapterOutline,
    GeneratedChapter,
    TextbookImage,
} from '@/types/textbook-agent.types';
import { ImageMetadata } from '@/types/textbook';

// ============================================
// CONFIGURATION
// ============================================

const MODEL = MODELS.flash;
const STORAGE_FOLDER = 'custom-textbook-images';

// ============================================
// RESEARCH AGENT
// ============================================

/**
 * Research Agent: Analyzes the topic and audience to prepare for content generation
 */
export async function runResearchAgent(
    topic: string,
    audienceAge: string,
    specifications?: string
): Promise<TopicResearch> {
    const prompt = `You are an expert educational researcher. Analyze the following topic for textbook creation.

Topic: ${topic}
Target Audience: ${audienceAge}
Educational System: Kenyan Competency Based Curriculum (CBC)
${specifications ? `Additional Requirements: ${specifications}` : ''}

Analyze this topic and provide:
1. A refined version of the topic (make it specific and educational for the Kenyan context)
2. Key concepts that MUST be covered (aligned with CBC standards)
3. Recommended number of chapters (3-5 for most topics)
4. Estimated reading time for students

IMPORTANT: All financial examples must use Kenyan Shillings (KES). Use Kenyan names, locations, and cultural contexts. 

Return JSON matching this structure:
{
    "analyzedTopic": "Refined, specific topic title",
    "targetAudience": "Description of the target audience",
    "gradeLevel": "The grade level",
    "keyConcepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5"],
    "suggestedChapterCount": 4,
    "estimatedReadingTime": "30-40 minutes"
}`;

    const result = await generateGeminiJSON<TopicResearch>(prompt, MODEL);

    return {
        analyzedTopic: result.analyzedTopic || topic,
        targetAudience: result.targetAudience || audienceAge,
        gradeLevel: result.gradeLevel || audienceAge,
        keyConcepts: result.keyConcepts || [],
        suggestedChapterCount: result.suggestedChapterCount || 4,
        estimatedReadingTime: result.estimatedReadingTime || '30 minutes',
    };
}

// ============================================
// OUTLINE AGENT
// ============================================

/**
 * Outline Agent: Creates the textbook structure with chapters and image placeholders
 */
export async function runOutlineAgent(
    research: TopicResearch,
    specifications?: string
): Promise<TextbookOutline> {
    const prompt = `You are an expert textbook architect. Create a detailed outline for an educational textbook.

Topic: ${research.analyzedTopic}
Target Audience: ${research.targetAudience}
Educational System: Kenyan CBC
Key Concepts to Cover: ${research.keyConcepts.join(', ')}
Number of Chapters: ${research.suggestedChapterCount}
${specifications ? `Additional Requirements: ${specifications}` : ''}

Create a structured outline with:
1. An engaging textbook title (Kenyan context)
2. An introduction paragraph
3. 3-5 learning objectives
4. ${research.suggestedChapterCount} chapters, each with:
   - Clear title
   - Brief description (what the chapter covers)
   - 3-4 key points to teach
   - An image prompt (describe an educational illustration for this chapter)
   - Estimated word count
5. List of glossary terms to define

IMPORTANT: Use KES for all monetary values. Use Kenyan examples and cultural references.

Return JSON matching this structure:
{
    "title": "Engaging Textbook Title",
    "introduction": "An engaging introduction paragraph...",
    "learningObjectives": ["objective 1", "objective 2", "objective 3"],
    "chapters": [
        {
            "index": 0,
            "title": "Chapter Title",
            "description": "What this chapter covers",
            "keyPoints": ["point 1", "point 2", "point 3"],
            "imagePrompt": "Detailed prompt for an educational illustration showing...",
            "estimatedWordCount": 500
        }
    ],
    "glossaryTerms": ["term 1", "term 2", "term 3"]
}`;

    const result = await generateGeminiJSON<TextbookOutline>(prompt, MODEL);

    return {
        title: result.title || research.analyzedTopic,
        introduction: result.introduction || '',
        learningObjectives: result.learningObjectives || [],
        chapters: (result.chapters || []).map((ch, i) => ({
            index: i,
            title: ch.title || `Chapter ${i + 1}`,
            description: ch.description || '',
            keyPoints: ch.keyPoints || [],
            imagePrompt: ch.imagePrompt || '',
            estimatedWordCount: ch.estimatedWordCount || 500,
        })),
        glossaryTerms: result.glossaryTerms || [],
    };
}

// ============================================
// CONTENT AGENT
// ============================================

/**
 * Content Agent: Generates content for a single chapter
 */
export async function generateChapterContent(
    outline: TextbookOutline,
    chapter: ChapterOutline,
    research: TopicResearch
): Promise<GeneratedChapter> {
    const prompt = `You are an expert textbook author writing for ${research.targetAudience} students.

Textbook: ${outline.title}
Chapter ${chapter.index + 1}: ${chapter.title}
Educational System: Kenyan CBC
Description: ${chapter.description}
Key Points to Cover: ${chapter.keyPoints.join(', ')}
Target Word Count: ${chapter.estimatedWordCount} words

Write engaging, educational content for this chapter. Include:
1. Clear explanations appropriate for the grade level
2. Kenyan examples, analogies, and cultural contexts students can relate to
3. Key vocabulary highlighted
4. 2-3 practice exercises at the end

IMPORTANT:
- USE KENYAN SHILLINGS (KES) for all monetary examples. DO NOT USE USD OR $.
- Use Kenyan names (e.g., Atieno, Kamau, Mutua) and places (e.g., Nairobi, Mombasa, Kisumu).
- Adhere to the Kenyan Competency Based Curriculum (CBC) values.

Return JSON matching this structure:
{
    "title": "${chapter.title}",
    "content": "The full chapter content written in clear, engaging prose...",
    "keyPoints": ["key takeaway 1", "key takeaway 2", "key takeaway 3"],
    "exercises": [
        {
            "question": "A practice question or activity",
            "type": "open-ended"
        },
        {
            "question": "Another question",
            "type": "activity"
        }
    ]
}

IMPORTANT: 
- Write in a friendly, educational tone
- Use simple language appropriate for ${research.gradeLevel}
- Do NOT include the chapter title or any "Chapter X" headers in the "content" field (as they are handled by the UI)
- Start directly with the chapter introduction or first paragraph
- Do NOT use emojis
- Do NOT include quizzes or tests`;

    const result = await generateGeminiJSON<any>(prompt, MODEL);

    // Cleanup: Remove redundant titles if Gemini included them despite the prompt
    let cleanContent = result.content || '';
    const titleRegex = new RegExp(`^(\\s*#+\\s*(Chapter\\s*\\d+:?\\s*)?${escapeRegExp(chapter.title)}\\s*\\n+)`, 'i');
    cleanContent = cleanContent.replace(titleRegex, '');

    // Also remove any generic "Chapter X" header at the very start
    cleanContent = cleanContent.replace(/^(\\s*#+\\s*Chapter\\s*\\d+:?\\s*\\n+)/i, '');

    return {
        index: chapter.index,
        title: result.title || chapter.title,
        content: cleanContent.trim(),
        keyPoints: result.keyPoints || chapter.keyPoints,
        exercises: result.exercises || [],
        imagePrompt: chapter.imagePrompt,
    };
}

/**
 * Helper to escape regex special characters
 */
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Content Agent: Generates the summary and glossary
 */
export async function generateSummaryAndGlossary(
    outline: TextbookOutline,
    chapters: GeneratedChapter[],
    research: TopicResearch
): Promise<{ summary: string; glossary: Array<{ term: string; definition: string }> }> {
    const chapterSummaries = chapters.map(ch =>
        `${ch.title}: ${ch.keyPoints.slice(0, 2).join(', ')}`
    ).join('\n');

    const prompt = `You are finalizing a textbook on "${outline.title}" for ${research.targetAudience}.

The textbook covers these chapters:
${chapterSummaries}

Terms to define: ${outline.glossaryTerms.join(', ')}

Create:
1. A concise summary paragraph (3-4 sentences) of what students learned (in the Kenyan CBC context)
2. A glossary with clear, grade-appropriate definitions

IMPORTANT: Use Kenyan Shillings (KES) for any monetary definitions. Use Kenyan examples.

Return JSON:
{
    "summary": "A summary paragraph...",
    "glossary": [
        { "term": "Term 1", "definition": "Definition appropriate for ${research.gradeLevel}" }
    ]
}`;

    const result = await generateGeminiJSON<any>(prompt, MODEL);

    return {
        summary: result.summary || '',
        glossary: result.glossary || [],
    };
}

// ============================================
// ILLUSTRATION AGENT
// ============================================

/**
 * Illustration Agent: Generates an image for a chapter
 */
export async function generateChapterImage(
    textbookId: string,
    chapter: GeneratedChapter,
    research: TopicResearch
): Promise<TextbookImage | null> {
    try {
        const imageId = `${textbookId}_ch${chapter.index}`;

        // Build educational image prompt
        const fullPrompt = `
Educational illustration for ${research.gradeLevel} textbook:
${chapter.imagePrompt}

STYLE REQUIREMENTS:
- Educational, colorful illustration style
- Age-appropriate for ${research.gradeLevel} students
- NO text or labels in the image
- Clean, clear composition
- White or light background
- Engaging and visually appealing
        `.trim();

        // Create image metadata for the generation service
        const imageMetadata: ImageMetadata = {
            id: imageId,
            textbookRef: textbookId,
            category: 'illustration',
            type: 'illustration',
            position: 'inline',
            caption: `Illustration for ${chapter.title}`,
            description: chapter.imagePrompt || '',
            visualDescription: chapter.imagePrompt || '',
            conceptExplanation: `Illustration for ${chapter.title}`,
            educationalContext: `Topic: ${research.analyzedTopic}, Chapter: ${chapter.title}`,
            tutorScript: `This illustration shows ${chapter.imagePrompt || 'the key concept of this chapter'}`,
            generationPrompt: fullPrompt,
            isGenerated: false,
            grade: research.gradeLevel || 'Unknown',
            subject: 'Custom',
            strand: research.analyzedTopic || 'Custom',
            substrand: chapter.title || 'Chapter',
            createdAt: new Date(),
        };

        // Save metadata to Firestore first
        await adminDb.collection('images').doc(imageId).set(imageMetadata);

        // Generate the image
        const result = await generateImageWithGemini(imageMetadata);

        if (result.success && result.imageUrl) {
            return {
                id: imageId,
                chapterIndex: chapter.index,
                type: 'chapter',
                prompt: fullPrompt,
                description: chapter.imagePrompt || 'Chapter illustration',
                imageUrl: result.imageUrl || '',
                generatedAt: new Date(),
            };
        }

        return null;
    } catch (error) {
        console.error(`[Illustration Agent] Error generating image for chapter ${chapter.index}:`, error);
        return null;
    }
}

/**
 * Illustration Agent: Generates a cover image for the textbook
 */
export async function generateCoverImage(
    textbookId: string,
    outline: TextbookOutline,
    research: TopicResearch
): Promise<TextbookImage | null> {
    try {
        const imageId = `${textbookId}_cover`;

        const fullPrompt = `
Textbook cover illustration:
Topic: ${outline.title}
Create an engaging, colorful cover illustration that represents the key themes of this textbook.

STYLE REQUIREMENTS:
- Vibrant, eye-catching educational illustration
- Represents the topic: ${research.analyzedTopic}
- Age-appropriate for ${research.gradeLevel} students
- NO text or title in the image (text will be added separately)
- Professional textbook cover quality
- Bright, inviting colors
        `.trim();

        const imageMetadata: ImageMetadata = {
            id: imageId,
            textbookRef: textbookId,
            category: 'illustration',
            type: 'illustration',
            position: 'cover',
            caption: `Cover for ${outline.title}`,
            description: `Cover illustration for ${outline.title}`,
            visualDescription: fullPrompt,
            conceptExplanation: `Cover art for ${outline.title}`,
            educationalContext: `Textbook cover for "${outline.title}"`,
            tutorScript: `The cover art represents ${outline.title}`,
            generationPrompt: fullPrompt,
            isGenerated: false,
            grade: research.gradeLevel || 'Unknown',
            subject: 'Custom',
            strand: research.analyzedTopic || 'Custom',
            substrand: 'Cover',
            createdAt: new Date(),
        };

        await adminDb.collection('images').doc(imageId).set(imageMetadata);

        const result = await generateImageWithGemini(imageMetadata);

        if (result.success && result.imageUrl) {
            return {
                id: imageId,
                chapterIndex: -1,
                type: 'cover',
                prompt: fullPrompt,
                description: `Cover for ${outline.title}`,
                imageUrl: result.imageUrl || '',
                generatedAt: new Date(),
            };
        }

        return null;
    } catch (error) {
        console.error('[Illustration Agent] Error generating cover image:', error);
        return null;
    }
}

// ============================================
// ASSEMBLY AGENT
// ============================================

/**
 * Assembly Agent: Compiles the final textbook and saves to Firestore
 */
export async function assembleTextbook(
    textbookId: string,
    teacherId: string,
    topic: string,
    audienceAge: string,
    specifications: string | undefined,
    research: TopicResearch,
    outline: TextbookOutline,
    chapters: GeneratedChapter[],
    summaryData: { summary: string; glossary: Array<{ term: string; definition: string }> },
    images: TextbookImage[]
): Promise<any> {
    // Map chapter images to chapters
    const chaptersWithImages = chapters.map(ch => {
        const chapterImage = images.find(img => img.chapterIndex === ch.index);
        return {
            ...ch,
            imageUrl: chapterImage?.imageUrl,
        };
    });

    // Find cover image
    const coverImage = images.find(img => img.type === 'cover');

    // Build the complete textbook object
    const textbook = {
        id: textbookId,
        teacherId,
        title: outline.title,
        topic,
        audienceAge,
        specifications,
        estimatedReadingTime: research.estimatedReadingTime,
        coverImageUrl: coverImage?.imageUrl,
        content: {
            introduction: outline.introduction,
            learningObjectives: outline.learningObjectives,
            chapters: chaptersWithImages.map(ch => ({
                title: ch.title,
                content: ch.content,
                keyPoints: ch.keyPoints,
                exercises: ch.exercises,
                imageUrl: ch.imageUrl,
            })),
            practiceQuestions: chapters.flatMap(ch =>
                ch.exercises.filter(ex => ex.type !== 'activity').map(ex => ({
                    question: ex.question,
                    answer: undefined,
                }))
            ),
            summary: summaryData.summary,
            glossary: summaryData.glossary,
        },
        imageIds: images.map(img => img.id),
        createdAt: new Date(),
    };

    // Save to Firestore
    const textbookRef = adminDb
        .collection('teachers')
        .doc(teacherId)
        .collection('customTextbooks')
        .doc(textbookId);

    await textbookRef.set(textbook);

    return textbook;
}

// ============================================
// UTILITY
// ============================================

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
