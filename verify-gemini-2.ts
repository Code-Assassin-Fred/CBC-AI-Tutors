
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Manually load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^"(.*)"$/, '$1'); // Remove quotes if present
            process.env[key] = value;
        }
    });
} else {
    console.warn("Warning: .env.local not found");
}

const GEMINI_API_KEY = process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const MODEL_NAME = "gemini-2.0-flash";

async function verifyGemini2() {
    console.log('Testing Gemini 2.0 Flash...');
    console.log(`Using model: ${MODEL_NAME}`);

    if (!GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY not found in environment.");
        return;
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent('Say "Gemini 2.0 Flash is working!" if you can hear me.');
        const response = result.response.text();
        console.log('Response:', response);

        if (response.includes('Gemini 2.0 Flash is working')) {
            console.log('SUCCESS: Gemini 2.0 Flash is operational.');
        } else {
            console.log('WARNING: unexpected response content, but model executed.');
        }
    } catch (error) {
        console.error('ERROR: Failed to generate text with Gemini 2.0 Flash', error);
    }
}

verifyGemini2();
