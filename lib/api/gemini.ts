import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// GEMINI_IMAGE_API_KEY is the primary key for all Gemini API calls
const GEMINI_API_KEY = process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";



if (!GEMINI_API_KEY) {
    console.warn("[Gemini] Warning: GEMINI_API_KEY is not set in environment variables");
}

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Models 
 * Upgraded to Gemini 2.0
 */
export const MODELS = {
    flash: "gemini-2.0-flash",
    pro: "gemini-2.0-pro-exp",
};

/**
 * Helper: Sleep for exponential backoff
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Robust API call wrapper with exponential backoff
 * Retries up to 5 times with delays: 3s, 6s, 12s, 24s, 48s
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 5): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const errorMsg = error.toString();
            const isRateLimit = errorMsg.includes("429") || errorMsg.includes("Resource exhausted");
            const isServerError = errorMsg.includes("500") || errorMsg.includes("Internal error");

            if (isRateLimit || isServerError) {
                const waitTime = Math.pow(2, i) * 3000; // 3s, 6s, 12s, 24s, 48s...
                console.warn(`[Gemini Retry] ${isRateLimit ? 'Rate limit hit' : 'Server error'}. Waiting ${waitTime / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
                await sleep(waitTime);
                continue;
            }
            // Non-retryable error
            throw error;
        }
    }
    console.error(`[Gemini] All ${maxRetries} retries exhausted.`);
    throw lastError;
}


/**
 * Generate content using Gemini
 */
export async function generateGeminiText(prompt: string, modelName: string = MODELS.flash) {
    return withRetry(async () => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    });
}

/**
 * Generate JSON content using Gemini
 */
export async function generateGeminiJSON<T>(prompt: string, modelName: string = MODELS.flash): Promise<T> {
    return withRetry(async () => {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            return JSON.parse(text) as T;
        } catch (parseError) {
            console.error("[Gemini JSON Parse Error]:", text);
            throw parseError;
        }
    });
}
