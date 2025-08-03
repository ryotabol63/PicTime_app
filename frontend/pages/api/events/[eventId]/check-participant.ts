import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventId, name } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const backendUrl = `http://localhost:8080/api/events/${eventId}/availability/check-participant?name=${encodeURIComponent(name as string)}`;
    const backendRes = await fetch(backendUrl);
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
