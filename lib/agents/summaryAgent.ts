/**
 * Summary Agent
 * 
 * Generates brief, encouraging AI summaries for quiz and learning results.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizActivity } from '@/lib/types/agents';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_IMAGE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function generateQuizSummary(activity: Partial<QuizActivity>): Promise<string> {
    const prompt = `You are a supportive CBC (Competency Based Curriculum) tutor in Kenya.
  
  Generate a BRIEF (2-3 sentences) encouraging summary for a student who just finished a quiz.
  
  QUIZ: ${activity.context?.substrand}
  SCORE: ${activity.score} out of ${activity.totalQuestions}
  
  REQUIREMENTS:
  1. Be very encouraging and positive.
  2. If they did well (e.g. >70%), congratulate them on their mastery.
  3. If they struggled, highlight that learning is a journey and suggest they review the "Read" mode.
  4. Use a warm, professional tone.
  
  Do NOT use emojis. Respond with only the summary text.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text() || "Great effort on completing the quiz! Keep reviewing the material to strengthen your understanding.";
    } catch (error) {
        console.error('Summary Agent error:', error);
        return "Well done on completing the quiz. Continue practicing to master these concepts.";
    }
}

