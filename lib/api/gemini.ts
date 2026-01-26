import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

if (!GEMINI_API_KEY) {
    console.warn("[Gemini] Warning: GEMINI_API_KEY is not set in environment variables");
}

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Models 
 * Upgraded to Gemini 3.0 as requested
 */
export const MODELS = {
    flash: "gemini-2.0-flash",
    pro: "gemini-2.0-pro-exp",
};

/**
 * Generate content using Gemini
 */
export async function generateGeminiText(prompt: string, modelName: string = MODELS.flash) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("[Gemini Text Error]:", error);
        throw error;
    }
}

/**
 * Generate JSON content using Gemini
 */
export async function generateGeminiJSON<T>(prompt: string, modelName: string = MODELS.flash): Promise<T> {
    try {
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
    } catch (error) {
        console.error("[Gemini JSON Error]:", error);
        throw error;
    }
}
