/**
 * Summary Agent
 * 
 * Generates brief, encouraging AI summaries for quiz and learning results.
 */

import { generateGeminiText, MODELS } from '@/lib/api/gemini';
import { QuizActivity } from '@/lib/types/agents';

const MODEL = MODELS.flash;

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
        const text = await generateGeminiText(prompt, MODEL);
        return text || "Great effort on completing the quiz! Keep reviewing the material to strengthen your understanding.";
    } catch (error) {
        console.error('Summary Agent error:', error);
        return "Well done on completing the quiz. Continue practicing to master these concepts.";
    }
}

