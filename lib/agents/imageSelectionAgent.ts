/**
 * Image Selection Agent
 * 
 * Uses Gemini 2.0 Flash to evaluate search results and pick the 
 * best image for the current curriculum context.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { SearchResult } from "@/lib/api/imageSearchService";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_IMAGE_API_KEY || process.env.GOOGLE_API_KEY || "");

export interface ImageSelectionResult {
    winnerUrl: string;
    reasoning: string;
    title: string;
}

export async function selectBestImage(
    context: {
        grade: string;
        subject: string;
        substrand: string;
        description: string;
    },
    candidates: SearchResult[]
): Promise<ImageSelectionResult | null> {
    if (candidates.length === 0) return null;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
        }
    });

    const prompt = `
        You are an expert educational media curator for the Kenyan CBC (Competency-Based Curriculum).
        Your task is to select the BEST image for a Grade ${context.grade} ${context.subject} textbook about "${context.substrand}".
        
        Image Requirement: ${context.description}
        
        CANDIDATES FROM WEB SEARCH:
        ${candidates.map((c, i) => `
        [CANDIDATE ${i + 1}]
        Title: ${c.title}
        URL: ${c.link}
        Snippet: ${c.snippet}
        `).join("\n")}
        
        CRITERIA:
        1. RELEVANCE: Does it accurately show what's requested?
        2. QUALITY/SOURCE: Is the source reputable for education?
        3. APPROPRIATENESS: Is it suitable for Grade ${context.grade} students?
        4. CLARITY: Is it a clear diagram or photograph?
        
        Respond with ONLY a JSON object:
        {
            "winnerIndex": number (1-based index of candidate),
            "reasoning": "string explaining why this is the best for CBC students",
            "confidence": number (0-1)
        }
    `;

    try {
        console.log(`[ImageSelectionAgent] Evaluating ${candidates.length} candidates for: ${context.substrand}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const data = JSON.parse(response.text());

        const index = data.winnerIndex - 1;
        const winner = candidates[index];

        if (!winner) {
            console.warn("[ImageSelectionAgent] Agent returned invalid index, falling back to first result.");
            return {
                winnerUrl: candidates[0].link,
                reasoning: "Fallback selection",
                title: candidates[0].title
            };
        }

        return {
            winnerUrl: winner.link,
            reasoning: data.reasoning,
            title: winner.title
        };

    } catch (error) {
        console.error("[ImageSelectionAgent] Error selecting image:", error);
        // Fallback to first search result if AI fails
        return {
            winnerUrl: candidates[0].link,
            reasoning: "Auto-selected first search result due to agent error.",
            title: candidates[0].title
        };
    }
}
