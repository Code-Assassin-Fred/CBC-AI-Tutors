import { NextApiRequest, NextApiResponse } from 'next';

// Mock database or service for saving roles
const mockDatabase = new Map<string, any>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Simulate saving the role to a database
    mockDatabase.set(userId, { role });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving role:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}