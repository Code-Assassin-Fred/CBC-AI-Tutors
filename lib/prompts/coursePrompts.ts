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
You are creating an educational podcast script with two hosts: Jordan (the expert teacher) and Beau (the curious learner).

LESSON: "${lessonTitle}"
KEY CONCEPTS: ${keyConcepts.join(', ')}

CONTENT TO COVER:
${readContent.slice(0, 4000)}

Create an engaging conversational podcast script where:
- Beau (the Student) asks curious questions a learner would ask
- Jordan (the Teacher) explains concepts clearly with analogies
- The conversation feels natural, not scripted
- Complex topics are broken down through dialogue
- Include moments of humor and connection
- Duration: 8-12 minutes of dialogue

IMPORTANT: Use "Teacher" for Jordan and "Student" for Beau in the speaker field.

Respond with ONLY a JSON object:
{
    "title": "Episode Title",
    "duration": "10 minutes",
    "introduction": "Brief intro setting up the topic",
    "dialogue": [
        {
            "id": "d1",
            "speaker": "Student",
            "text": "What they say...",
            "emotion": "curious" | "excited" | "thoughtful" | "encouraging"
        },
        {
            "id": "d2", 
            "speaker": "Teacher",
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
    // Expanded Topics
    { id: 'quantum-computing', topic: 'quantum computing', displayName: 'Quantum Computing for Everyone', category: 'Technology' },
    { id: 'renaissance-art', topic: 'renaissance art', displayName: 'Art of the Renaissance', category: 'Art' },
    { id: 'sustainable-gardening', topic: 'sustainable gardening', displayName: 'Sustainable Gardening', category: 'Lifestyle' },
    { id: 'digital-marketing', topic: 'digital marketing', displayName: 'Digital Marketing Basics', category: 'Business' },
    { id: 'game-design', topic: 'game design', displayName: 'Game Design Fundamentals', category: 'Technology' },
    { id: 'microbiology', topic: 'microbiology', displayName: 'Introduction to Microbiology', category: 'Science' },
    { id: 'negotiation-skills', topic: 'negotiation skills', displayName: 'Art of Negotiation', category: 'Skills' },
    { id: 'archaeology', topic: 'archaeology', displayName: 'Fundamentals of Archaeology', category: 'History' },
    { id: 'graphic-design', topic: 'graphic design', displayName: 'Graphic Design Basics', category: 'Creative' },
    { id: 'oceanography', topic: 'oceanography', displayName: 'Exploring the Oceans', category: 'Science' },
    { id: 'robotics', topic: 'robotics basics', displayName: 'Introduction to Robotics', category: 'Technology' },
    { id: 'cybersecurity', topic: 'cybersecurity basics', displayName: 'Cybersecurity Essentials', category: 'Technology', trending: true },
    { id: 'french-language', topic: 'french for beginners', displayName: 'French for Beginners', category: 'Language' },
    { id: 'spanish-language', topic: 'spanish for beginners', displayName: 'Spanish for Beginners', category: 'Language' },
    { id: 'interior-design', topic: 'interior design', displayName: 'Interior Design Principles', category: 'Creative' },
    { id: 'film-history', topic: 'film history', displayName: 'History of Cinema', category: 'Art' },
    { id: 'anthropology', topic: 'anthropology', displayName: 'Cultural Anthropology', category: 'Humanities' },
    { id: 'genetics', topic: 'genetics', displayName: 'Genetics 101', category: 'Science' },
    { id: 'macroeconomics', topic: 'macroeconomics', displayName: 'Macroeconomics', category: 'Finance' },
    { id: 'project-management', topic: 'project management', displayName: 'Project Management Fundamentals', category: 'Business' },
    { id: 'urban-planning', topic: 'urban planning', displayName: 'Introduction to Urban Planning', category: 'Design' },
    { id: 'fashion-design', topic: 'fashion design', displayName: 'Fashion Design Basics', category: 'Creative' },
    { id: 'sociology', topic: 'sociology', displayName: 'Introduction to Sociology', category: 'Humanities' },
    { id: 'organic-chemistry', topic: 'organic chemistry', displayName: 'Organic Chemistry Basics', category: 'Science' },
    { id: 'web-development', topic: 'web development', displayName: 'Full Stack Web Development', category: 'Technology' },
    { id: 'blockchain', topic: 'blockchain technology', displayName: 'Blockchain Technology', category: 'Technology' },
    { id: 'art-history', topic: 'art history', displayName: 'History of Art', category: 'Art' },
    { id: 'linguistics', topic: 'linguistics', displayName: 'Introduction to Linguistics', category: 'Humanities' },
    { id: 'world-religions', topic: 'world religions', displayName: 'World Religions', category: 'Humanities' },
    { id: 'political-science', topic: 'political science', displayName: 'Political Science 101', category: 'Humanities' },
    { id: 'marketing-strategy', topic: 'marketing strategy', displayName: 'Marketing Strategy', category: 'Business' },
    { id: 'human-anatomy', topic: 'human anatomy', displayName: 'Human Anatomy', category: 'Science' },
    { id: 'neuroscience', topic: 'neuroscience', displayName: 'Introduction to Neuroscience', category: 'Science' },
    { id: 'fitness-training', topic: 'fitness training', displayName: 'Fitness & Personal Training', category: 'Health' },
    { id: 'meditation', topic: 'meditation techniques', displayName: 'Meditation Techniques', category: 'Health' },
    { id: 'gardening', topic: 'gardening', displayName: 'Home Gardening', category: 'Lifestyle' },
    { id: 'woodworking', topic: 'woodworking', displayName: 'Woodworking for Beginners', category: 'Lifestyle' },
    { id: 'origami', topic: 'origami', displayName: 'Art of Origami', category: 'Creative' },
    { id: 'calligraphy', topic: 'calligraphy', displayName: 'Calligraphy Basics', category: 'Creative' },
    { id: 'video-editing', topic: 'video editing', displayName: 'Video Editing Fundamentals', category: 'Creative' },
    { id: 'screenwriting', topic: 'screenwriting', displayName: 'Screenwriting 101', category: 'Creative' },
    { id: 'animation', topic: 'animation basics', displayName: 'Animation Basics', category: 'Creative' },
    { id: 'ui-ux-design', topic: 'ui ux design', displayName: 'UI/UX Design Essentials', category: 'Design' },
    { id: 'product-management', topic: 'product management', displayName: 'Product Management', category: 'Business' },
    { id: 'leadership', topic: 'leadership skills', displayName: 'Leadership Skills', category: 'Business' },
    { id: 'emotional-intelligence', topic: 'emotional intelligence', displayName: 'Emotional Intelligence', category: 'Skills' },
    { id: 'critical-thinking', topic: 'critical thinking', displayName: 'Critical Thinking', category: 'Skills' },
    { id: 'time-management', topic: 'time management', displayName: 'Time Management', category: 'Skills' },
    { id: 'study-skills', topic: 'study skills', displayName: 'Effective Study Skills', category: 'Skills' },
    { id: 'career-planning', topic: 'career planning', displayName: 'Career Planning', category: 'Skills' },
    { id: 'cryptocurrency', topic: 'cryptocurrency', displayName: 'Cryptocurrency Basics', category: 'Finance' },
    { id: 'real-estate', topic: 'real estate investing', displayName: 'Real Estate Investing', category: 'Finance' },
    { id: 'accounting', topic: 'accounting basics', displayName: 'Accounting Basics', category: 'Finance' },
    { id: 'statistics', topic: 'statistics', displayName: 'Statistics 101', category: 'Science' },
    { id: 'physics', topic: 'physics basics', displayName: 'Physics Fundamentals', category: 'Science' },
    { id: 'chemistry', topic: 'chemistry basics', displayName: 'Chemistry Fundamentals', category: 'Science' },
    { id: 'biology', topic: 'biology basics', displayName: 'Biology Fundamentals', category: 'Science' },
    { id: 'ecology', topic: 'ecology', displayName: 'Introduction to Ecology', category: 'Science' },
    { id: 'geology', topic: 'geology', displayName: 'Geology 101', category: 'Science' },
    { id: 'meteorology', topic: 'meteorology', displayName: 'Meteorology Basics', category: 'Science' },
    { id: 'zoology', topic: 'zoology', displayName: 'Introduction to Zoology', category: 'Science' },
    { id: 'botany', topic: 'botany', displayName: 'Plant Science', category: 'Science' },
    { id: 'architecture', topic: 'architecture history', displayName: 'History of Architecture', category: 'Art' },
    { id: 'sculpture', topic: 'sculpture', displayName: 'Introduction to Sculpture', category: 'Art' },
    { id: 'theater', topic: 'theater arts', displayName: 'Theater Arts', category: 'Art' },
    { id: 'dance', topic: 'dance history', displayName: 'History of Dance', category: 'Art' },
    { id: 'journalism', topic: 'journalism', displayName: 'Introduction to Journalism', category: 'Humanities' },
    { id: 'law', topic: 'law basics', displayName: 'Introduction to Law', category: 'Humanities' },
    { id: 'international-relations', topic: 'international relations', displayName: 'International Relations', category: 'Humanities' },
    { id: 'public-relations', topic: 'public relations', displayName: 'Public Relations', category: 'Business' },
    { id: 'human-resources', topic: 'human resources', displayName: 'Human Resources', category: 'Business' },
    { id: 'sales', topic: 'sales techniques', displayName: 'Sales Techniques', category: 'Business' },
    { id: 'customer-service', topic: 'customer service', displayName: 'Customer Service Excellence', category: 'Business' },
    { id: 'event-planning', topic: 'event planning', displayName: 'Event Planning', category: 'Business' },
    { id: 'travel', topic: 'travel photography', displayName: 'Travel Photography', category: 'Lifestyle' },
    { id: 'parenting', topic: 'parenting skills', displayName: 'Parenting Skills', category: 'Lifestyle' },
    { id: 'diy', topic: 'diy home improvement', displayName: 'DIY Home Improvement', category: 'Lifestyle' },
    { id: 'pet-care', topic: 'pet care', displayName: 'Pet Care Basics', category: 'Lifestyle' },
    { id: 'survival-skills', topic: 'survival skills', displayName: 'Survival Skills', category: 'Lifestyle' },
    { id: 'first-aid', topic: 'first aid', displayName: 'First Aid Basics', category: 'Health' },
    { id: 'mental-health', topic: 'mental health awareness', displayName: 'Mental Health Awareness', category: 'Health' },
    { id: 'sports-psychology', topic: 'sports psychology', displayName: 'Sports Psychology', category: 'Health' },
    { id: 'esports', topic: 'esports management', displayName: 'Esports Management', category: 'Technology' },
    { id: 'cloud-computing', topic: 'cloud computing', displayName: 'Cloud Computing', category: 'Technology' },
    { id: 'iot', topic: 'internet of things', displayName: 'Internet of Things (IoT)', category: 'Technology' },
    { id: 'ar-vr', topic: 'ar vr', displayName: 'Augmented & Virtual Reality', category: 'Technology' },
    { id: '3d-printing', topic: '3d printing', displayName: '3D Printing', category: 'Technology' },
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
