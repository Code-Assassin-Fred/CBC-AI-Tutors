/**
 * Course Prompts
 * 
 * Prompts tailored for open-ended course generation (not CBC-locked).
 */

// ============================================
// LESSON CONTENT PROMPTS
// ============================================

export const LESSON_ANALYZE_PROMPT = (lessonTitle: string, topics: string[], objectives: string[]) => `
You are an expert educator creating content for online learners.

LESSON: "${lessonTitle}"

TOPICS TO COVER:
${topics.map(t => `- ${t}`).join('\n')}

LEARNING OBJECTIVES:
${objectives.map(o => `- ${o}`).join('\n')}

Analyze this lesson and provide:
1. Key concepts (5-8 main ideas)
2. Difficulty assessment
3. Prerequisites needed
4. Common misconceptions to address
5. Estimated learning time

Respond with ONLY a JSON object:
{
    "keyConcepts": ["concept1", "concept2", ...],
    "difficulty": "easy" | "medium" | "hard",
    "prerequisites": ["prereq1", ...],
    "commonMisconceptions": ["misconception1", ...],
    "estimatedLearningTime": "X minutes"
}`;

export const LESSON_READ_CONTENT_PROMPT = (
    lessonTitle: string,
    topics: string[],
    objectives: string[],
    keyConcepts: string[]
) => `
You are an expert educator creating engaging written content.

LESSON: "${lessonTitle}"
TOPICS: ${topics.join(', ')}
KEY CONCEPTS: ${keyConcepts.join(', ')}

Create comprehensive reading content that:
- Uses clear, accessible language
- Includes real-world examples
- Breaks complex ideas into digestible sections
- Engages the reader with interesting facts
- Summarizes key points at the end

Respond with ONLY a JSON object:
{
    "introduction": "Engaging introduction paragraph",
    "sections": [
        {
            "id": "section-1",
            "title": "Section Title",
            "content": "Detailed content with multiple paragraphs...",
            "keyPoints": ["Key point 1", "Key point 2"],
            "examples": [
                {
                    "title": "Example Title",
                    "description": "Example description"
                }
            ]
        }
    ],
    "summary": "Summary paragraph",
    "reviewQuestions": ["Question 1?", "Question 2?"]
}`;

export const LESSON_PODCAST_PROMPT = (
    lessonTitle: string,
    readContent: string,
    keyConcepts: string[]
) => `
You are creating an educational podcast script with two hosts: Jo (the expert/teacher) and Beau (the curious learner).

LESSON: "${lessonTitle}"
KEY CONCEPTS: ${keyConcepts.join(', ')}

CONTENT TO COVER:
${readContent.slice(0, 4000)}

Create an engaging conversational podcast script where:
- Beau asks curious questions a learner would ask
- Jo explains concepts clearly with analogies
- The conversation feels natural, not scripted
- Complex topics are broken down through dialogue
- Include moments of humor and connection
- Duration: 8-12 minutes of dialogue

Respond with ONLY a JSON object:
{
    "title": "Episode Title",
    "duration": "10 minutes",
    "introduction": "Brief intro setting up the topic",
    "dialogue": [
        {
            "id": "d1",
            "speaker": "Beau",
            "text": "What they say...",
            "emotion": "curious" | "excited" | "thoughtful" | "encouraging"
        },
        {
            "id": "d2", 
            "speaker": "Jo",
            "text": "Response...",
            "emotion": "encouraging"
        }
    ],
    "conclusion": "Wrap-up summary"
}

Create at least 15-20 dialogue exchanges.`;

export const LESSON_IMMERSIVE_PROMPT = (
    lessonTitle: string,
    keyConcepts: string[],
    objectives: string[]
) => `
You are creating an immersive learning experience where students explain concepts back to demonstrate understanding.

LESSON: "${lessonTitle}"
KEY CONCEPTS: ${keyConcepts.join(', ')}
OBJECTIVES: ${objectives.join(', ')}

Create 3-4 "chunks" where the AI explains a concept, then asks the student to explain it back in their own words.

For each chunk:
- Provide a clear AI explanation
- Include key points to check for in student's response
- Provide a prompt for the student
- Include scoring rubric
- Add follow-up help if struggling

Respond with ONLY a JSON object:
{
    "introduction": "Welcome message explaining the immersive format",
    "chunks": [
        {
            "id": "chunk-1",
            "order": 1,
            "concept": "Concept name",
            "aiExplanation": "Detailed explanation the AI gives to the student...",
            "keyPointsToCheck": ["point1", "point2", "point3"],
            "promptForStudent": "Now explain this concept in your own words...",
            "scoringRubric": {
                "excellent": ["covers all key points", "uses own examples"],
                "good": ["covers main points", "shows understanding"],
                "needsWork": ["missing key concepts", "unclear explanation"]
            },
            "followUpIfStruggling": "Let me help you understand this better..."
        }
    ],
    "completionMessage": "Congratulations message"
}`;

// ============================================
// QUIZ PROMPTS
// ============================================

export const LESSON_QUIZ_PROMPT = (
    lessonTitle: string,
    keyConcepts: string[],
    objectives: string[]
) => `
You are an expert assessment designer creating a quiz for an online lesson.

LESSON: "${lessonTitle}"
KEY CONCEPTS: ${keyConcepts.join(', ')}
LEARNING OBJECTIVES: ${objectives.join(', ')}

Create 5 quiz questions that:
- Test understanding, not just memorization
- Cover the key concepts
- Have clear, unambiguous correct answers
- Include detailed explanations
- Mix of difficulty levels

Respond with ONLY a JSON object:
{
    "questions": [
        {
            "id": "q1",
            "type": "multiple_choice",
            "question": "Question text?",
            "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
            "correctAnswer": "B",
            "explanation": "Why B is correct...",
            "difficulty": "easy" | "medium" | "hard",
            "concept": "Concept being tested"
        }
    ]
}`;

export const FINAL_EXAM_PROMPT = (
    courseTitle: string,
    lessons: { title: string; concepts: string[] }[]
) => `
You are creating a comprehensive final exam for a course.

COURSE: "${courseTitle}"

LESSONS COVERED:
${lessons.map((l, i) => `${i + 1}. ${l.title}: ${l.concepts.join(', ')}`).join('\n')}

Create a comprehensive final exam with 10 questions that:
- Cover material from ALL lessons
- Test deeper understanding and application
- Include scenario-based questions
- Are challenging but fair
- Mix of difficulty (3 easy, 4 medium, 3 hard)

Respond with ONLY a JSON object:
{
    "questions": [
        {
            "id": "final-q1",
            "type": "multiple_choice",
            "question": "Question text?",
            "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
            "correctAnswer": "B",
            "explanation": "Why B is correct...",
            "difficulty": "easy" | "medium" | "hard",
            "concept": "Concept/Lesson being tested",
            "hint": "Optional hint"
        }
    ]
}`;

// ============================================
// TOPIC SUGGESTIONS
// ============================================

export const TOPIC_SUGGESTIONS = [
    { id: 'ml-basics', topic: 'machine learning basics', displayName: 'Machine Learning Fundamentals', category: 'Technology', trending: true },
    { id: 'chess-strategy', topic: 'chess strategy', displayName: 'Introduction to Chess Strategy', category: 'Games', trending: true },
    { id: 'personal-finance', topic: 'personal finance', displayName: 'Personal Finance Essentials', category: 'Finance', trending: true },
    { id: 'python-programming', topic: 'python programming', displayName: 'Python Fundamentals', category: 'Programming', trending: true },
    { id: 'public-speaking', topic: 'public speaking', displayName: 'Mastering Public Speaking', category: 'Skills' },
    { id: 'photography', topic: 'photography basics', displayName: 'Photography for Beginners', category: 'Creative' },
    { id: 'nutrition', topic: 'nutrition science', displayName: 'Understanding Nutrition', category: 'Health' },
    { id: 'history-ww2', topic: 'world war 2 history', displayName: 'World War II: A Complete Overview', category: 'History' },
    { id: 'music-theory', topic: 'music theory', displayName: 'Music Theory Basics', category: 'Music' },
    { id: 'psychology', topic: 'introduction to psychology', displayName: 'Introduction to Psychology', category: 'Science' },
    { id: 'climate-science', topic: 'climate change science', displayName: 'Understanding Climate Change', category: 'Science', trending: true },
    { id: 'creative-writing', topic: 'creative writing', displayName: 'Creative Writing Workshop', category: 'Creative' },
    { id: 'data-science', topic: 'data science fundamentals', displayName: 'Data Science Essentials', category: 'Technology' },
    { id: 'philosophy', topic: 'introduction to philosophy', displayName: 'Philosophy 101', category: 'Humanities' },
    { id: 'entrepreneurship', topic: 'entrepreneurship', displayName: 'Starting Your Business', category: 'Business' },
    { id: 'yoga', topic: 'yoga and meditation', displayName: 'Yoga and Mindfulness', category: 'Health' },
    { id: 'astronomy', topic: 'astronomy basics', displayName: 'Exploring the Universe', category: 'Science' },
    { id: 'cooking', topic: 'cooking fundamentals', displayName: 'Learn to Cook', category: 'Lifestyle' },
    { id: 'ai-ethics', topic: 'AI ethics', displayName: 'Ethics in Artificial Intelligence', category: 'Technology', trending: true },
    { id: 'investing', topic: 'stock market investing', displayName: 'Stock Market Investing', category: 'Finance' },
];

// ============================================
// COURSE THUMBNAIL PROMPTS
// ============================================

/**
 * Build a prompt for generating a visually striking course thumbnail
 */
export function buildCourseThumbnailPrompt(params: {
    title: string;
    topic: string;
    tags: string[];
}): string {
    const { title, topic, tags } = params;
    const tagString = tags.length > 0 ? tags.join(', ') : 'education, learning';

    return `
Create a stunning, modern course thumbnail image for an online learning platform.

COURSE TOPIC: ${topic}
COURSE TITLE: ${title}
RELATED THEMES: ${tagString}

STYLE REQUIREMENTS:
- Modern, premium, and visually striking design
- Rich, vibrant gradient backgrounds (deep blues, purples, teals, or warm oranges/pinks)
- Abstract geometric shapes and visual elements representing the subject
- Subtle glassmorphism effects for depth
- Clean, professional aesthetic suitable for an education platform
- NO TEXT OR WORDS in the image at all
- Landscape orientation (16:9 aspect ratio feel)
- High contrast and eye-catching colors
- Elements that symbolize the topic (e.g., neurons for AI, musical notes for music, code brackets for programming)
- Smooth gradients and soft lighting effects
- Suitable as a course card thumbnail

DO NOT include:
- Any text, letters, numbers, or words
- Realistic photographs of people
- Cluttered or busy compositions
- Low-quality or amateur-looking elements

The image should instantly communicate the essence of the topic while looking premium and engaging.
    `.trim();
}
