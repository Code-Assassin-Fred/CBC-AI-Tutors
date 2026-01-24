import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function verifyGeneration() {
    if (!GEMINI_API_KEY) {
        console.error("No API key found");
        return;
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const modelName = "gemini-3-pro-image-preview";

    console.log(`Starting verification for model: ${modelName}`);

    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                // @ts-ignore
                responseModalities: ["image", "text"],
            }
        });

        const prompt = "A clean, educational diagram of a plant cell with labels, Grade 5 level, white background.";
        console.log(`Prompt: ${prompt}`);

        const result = await model.generateContent(prompt);
        const response = result.response;

        let imageData: string | null = null;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.mimeType?.startsWith("image/")) {
                imageData = part.inlineData.data;
                break;
            }
        }

        if (imageData) {
            console.log("SUCCESS: Image data received from Gemini 3 Pro!");
            console.log(`Image data length: ${imageData.length} chars`);
        } else {
            console.error("FAILURE: No image data returned. The model might not support image generation in this environment or yet.");
            console.log("Full response structure:", JSON.stringify(response.candidates?.[0]?.content, null, 2));
        }

    } catch (error) {
        console.error("Error during verification:", error.message);
        if (error.message.includes("not found")) {
            console.log("TIP: This model might be restricted to specific regions or under a different name (e.g. without -preview).");
        }
    }
}

verifyGeneration();
