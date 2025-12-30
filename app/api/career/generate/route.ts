import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { CareerPath } from '@/types/career';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
                title: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                totalSkillCount: { type: SchemaType.NUMBER },
                skillCategories: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            name: { type: SchemaType.STRING },
                            weight: { type: SchemaType.NUMBER },
                            skills: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        id: { type: SchemaType.STRING },
                                        name: { type: SchemaType.STRING },
                                        description: { type: SchemaType.STRING },
                                        importance: { type: SchemaType.STRING, enum: ["essential", "important", "nice-to-have"] },
                                        dependencies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                        proficiencyLevels: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                beginner: { type: SchemaType.STRING },
                                                intermediate: { type: SchemaType.STRING },
                                                advanced: { type: SchemaType.STRING }
                                            },
                                            required: ["beginner", "intermediate", "advanced"]
                                        },
                                        learningResources: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                platformCourses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                                estimatedTimeToLearn: { type: SchemaType.STRING }
                                            },
                                            required: ["platformCourses", "estimatedTimeToLearn"]
                                        }
                                    },
                                    required: ["id", "name", "description", "importance", "dependencies", "proficiencyLevels", "learningResources"]
                                }
                            }
                        },
                        required: ["name", "weight", "skills"]
                    }
                },
                market: {
                    type: SchemaType.OBJECT,
                    properties: {
                        demand: { type: SchemaType.STRING, enum: ["low", "medium", "high", "very-high"] },
                        demandTrend: { type: SchemaType.STRING, enum: ["declining", "stable", "growing", "booming"] },
                        salaryRange: {
                            type: SchemaType.OBJECT,
                            properties: {
                                min: { type: SchemaType.NUMBER },
                                max: { type: SchemaType.NUMBER },
                                median: { type: SchemaType.NUMBER },
                                currency: { type: SchemaType.STRING }
                            },
                            required: ["min", "max", "median", "currency"]
                        },
                        topHiringIndustries: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        topLocations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        growthOutlook: { type: SchemaType.STRING }
                    },
                    required: ["demand", "demandTrend", "salaryRange", "topHiringIndustries", "topLocations", "growthOutlook"]
                },
                entry: {
                    type: SchemaType.OBJECT,
                    properties: {
                        difficulty: { type: SchemaType.STRING, enum: ["beginner-friendly", "moderate", "challenging", "expert"] },
                        typicalBackground: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        timeToEntry: { type: SchemaType.STRING },
                        certifications: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    },
                    required: ["difficulty", "typicalBackground", "timeToEntry", "certifications"]
                },
                aiImpact: {
                    type: SchemaType.OBJECT,
                    properties: {
                        automationRisk: { type: SchemaType.STRING, enum: ["very-low", "low", "medium", "high"] },
                        riskExplanation: { type: SchemaType.STRING },
                        futureProofSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        aiAugmentation: { type: SchemaType.STRING }
                    },
                    required: ["automationRisk", "riskExplanation", "futureProofSkills", "aiAugmentation"]
                },
                resources: {
                    type: SchemaType.OBJECT,
                    properties: {
                        platformCourses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        externalResources: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    title: { type: SchemaType.STRING },
                                    url: { type: SchemaType.STRING },
                                    type: { type: SchemaType.STRING, enum: ["article", "video", "course", "tool"] },
                                    isFree: { type: SchemaType.BOOLEAN }
                                },
                                required: ["title", "url", "type", "isFree"]
                            }
                        },
                        communities: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    name: { type: SchemaType.STRING },
                                    url: { type: SchemaType.STRING },
                                    platform: { type: SchemaType.STRING, enum: ["Discord", "Reddit", "LinkedIn", "Slack", "Other"] }
                                },
                                required: ["name", "url", "platform"]
                            }
                        },
                        books: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    title: { type: SchemaType.STRING },
                                    author: { type: SchemaType.STRING },
                                    url: { type: SchemaType.STRING }
                                },
                                required: ["title", "author"]
                            }
                        }
                    },
                    required: ["platformCourses", "externalResources", "communities", "books"]
                },
                relatedCareers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                transitionPaths: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            toCareer: { type: SchemaType.STRING },
                            description: { type: SchemaType.STRING },
                            skillOverlap: { type: SchemaType.NUMBER }
                        },
                        required: ["toCareer", "description", "skillOverlap"]
                    }
                }
            },
            required: [
                "title",
                "description",
                "totalSkillCount",
                "skillCategories",
                "market",
                "entry",
                "aiImpact",
                "resources",
                "relatedCareers",
                "transitionPaths"
            ]
        }
    }
});

export async function POST(req: NextRequest) {
    try {
        const { goal } = await req.json();

        if (!goal) {
            return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
        }

        const prompt = `
            You are an expert career counselor and industry analyst.
            Create a detailed career path and skill graph for the following career goal: "${goal}".
            
            Follow the JSON schema strictly.
            Ensure the "id" for skills are unique and kebab-case (e.g., "python-programming").
            Provide realistic market data and salary ranges (in USD, annual).
            Focus on modern, high-demand skills.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        // Add server-side generated fields
        const careerPath: CareerPath = {
            id: `path-${Date.now()}`,
            source: 'ai-generated',
            generatedAt: new Date(),
            ...data
        };

        return NextResponse.json(careerPath);

    } catch (error) {
        console.error('Career generation error:', error);
        return NextResponse.json({ error: 'Failed to generate career path' }, { status: 500 });
    }
}
