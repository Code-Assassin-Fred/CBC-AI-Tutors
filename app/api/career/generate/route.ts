import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CareerPath, CareerGenerationEvent } from '@/types/career';

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_IMAGE_API_KEY || process.env.GOOGLE_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
    try {
        const { title, userId } = await req.json();

        if (!title || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create a streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (event: CareerGenerationEvent) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                };

                try {
                    // Step 1: Researching
                    sendEvent({
                        type: 'progress',
                        step: 'researching',
                        message: `Researching ${title} career...`,
                        percentage: 10,
                    });

                    console.log(`[CareerGen] Starting generation for: ${title}`);
                    const model = genAI.getGenerativeModel({
                        model: 'gemini-2.0-flash-exp',
                        generationConfig: {
                            responseMimeType: "application/json",
                        }
                    });

                    // Step 2: Analyzing skills
                    sendEvent({
                        type: 'progress',
                        step: 'analyzing-skills',
                        message: 'Analyzing required skills...',
                        percentage: 30,
                    });

                    // Step 3: Market research
                    sendEvent({
                        type: 'progress',
                        step: 'market-research',
                        message: 'Gathering market intelligence...',
                        percentage: 50,
                    });

                    // Generate the career path
                    const prompt = `You are a career advisor AI. Generate a comprehensive career path for: "${title}"

Return a JSON object with this exact structure (no markdown, just JSON):
{
    "title": "${title}",
    "description": "2-3 sentence description of this career",
    "skillCategories": [
        {
            "name": "Foundation",
            "weight": 30,
            "skills": [
                {
                    "id": "skill-1",
                    "name": "Skill Name",
                    "importance": "essential",
                    "dependencies": [],
                    "assessmentQuestions": [
                        {
                            "id": "q1",
                            "question": "Question text?",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correctAnswer": 1,
                            "difficulty": "easy"
                        }
                    ],
                    "proficiencyLevels": {
                        "beginner": "Can do basic tasks",
                        "intermediate": "Can work independently",
                        "advanced": "Can mentor others"
                    },
                    "learningResources": {
                        "platformCourses": [],
                        "estimatedTimeToLearn": "2-4 weeks"
                    }
                }
            ]
        },
        {
            "name": "Core Skills",
            "weight": 50,
            "skills": []
        },
        {
            "name": "Advanced",
            "weight": 20,
            "skills": []
        }
    ],
    "totalSkillCount": 8,
    "market": {
        "demand": "high",
        "demandTrend": "growing",
        "salaryRange": { "min": 70000, "max": 150000, "median": 100000 },
        "topHiringIndustries": ["Tech", "Finance", "Healthcare"],
        "topLocations": ["San Francisco", "New York", "London"],
        "growthOutlook": "Expected to grow 20% over the next decade"
    },
    "entry": {
        "difficulty": "moderate",
        "typicalBackground": ["Computer Science degree", "Self-taught", "Bootcamp"],
        "timeToEntry": "6-12 months",
        "certifications": [
            { "name": "Relevant Cert", "provider": "Provider", "importance": "important" }
        ]
    },
    "aiImpact": {
        "automationRisk": "low",
        "riskExplanation": "Why this career is or isn't at risk from AI",
        "futureProofSkills": ["Critical thinking", "Creativity"],
        "aiAugmentation": "How AI helps professionals in this field"
    },
    "resources": {
        "platformCourses": [],
        "externalResources": [],
        "communities": [],
        "books": []
    },
    "relatedCareers": ["Related Career 1", "Related Career 2"],
    "transitionPaths": []
}

Generate 2-3 skills per category with 2-3 assessment questions each. Be specific and realistic.`;

                    console.log(`[CareerGen] Requesting content from Gemini...`);
                    const result = await model.generateContent(prompt);
                    const responseText = result.response.text();
                    console.log(`[CareerGen] Received response from Gemini (${responseText.length} chars)`);

                    // Step 4: Building path
                    sendEvent({
                        type: 'progress',
                        step: 'building-path',
                        message: 'Building your personalized path...',
                        percentage: 80,
                    });

                    // Parse the response
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (!jsonMatch) {
                        throw new Error('Failed to parse career data');
                    }

                    const careerData = JSON.parse(jsonMatch[0]);

                    // Create the career path object
                    const careerPath: CareerPath = {
                        id: `career-${Date.now()}`,
                        ...careerData,
                        generatedAt: new Date(),
                        source: 'ai-generated',
                    };

                    // TODO: Save to Firestore here

                    // Send complete event
                    sendEvent({
                        type: 'complete',
                        step: 'complete',
                        message: 'Career path ready!',
                        percentage: 100,
                        data: careerPath,
                    });

                } catch (error) {
                    sendEvent({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }

                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Career generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate career path' },
            { status: 500 }
        );
    }
}
