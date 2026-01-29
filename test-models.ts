import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function listModels() {
    if (!GEMINI_API_KEY) {
        console.error("No API key found");
        return;
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    try {
        // The listModels method might not be directly on genAI in older versions, 
        // but let's try to find how to list them or just check a specific one.
        console.log("Checking for models...");
        // Actually, the SDK usually doesn't have a direct 'listModels' on the main class 
        // that's easy to call without a specific service client, 
        // but we can try to use a known one or probe.

        // Alternatively, use fetch directly on the discovery endpoint if we had it.
        // For now, let's just try to initialize the requested one.
        const modelName = "gemini-3-pro-image-preview";
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            console.log(`Successfully initialized model: ${modelName}`);
        } catch (e: any) {
            console.error(`Failed to initialize ${modelName}:`, e.message);
        }

        const model2 = "gemini-2.5-flash";
        try {
            const m2 = genAI.getGenerativeModel({ model: model2 });
            console.log(`Successfully initialized model: ${model2}`);
        } catch (e: any) {
            console.error(`Failed to initialize ${model2}:`, e.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
