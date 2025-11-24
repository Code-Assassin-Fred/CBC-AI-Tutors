import { NextApiRequest, NextApiResponse } from 'next';

// Mock database or service for onboarding
const mockDatabase = new Map<string, any>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, name, curriculum, age } = req.body;

  if (!userId || !name || !curriculum || !age) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Simulate saving to a database
    mockDatabase.set(userId, { name, curriculum, age });

    // Simulate a redirect URL based on the curriculum
    const redirectUrl = `/dashboard/student`;

    return res.status(200).json({ success: true, redirectUrl });
  } catch (error) {
    console.error('Error onboarding student:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}