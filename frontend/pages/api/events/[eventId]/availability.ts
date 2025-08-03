import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventId } = req.query;
  const backendUrl = `http://localhost:8080/api/events/${eventId}/availability`;
  const method = req.method || 'GET';
  let backendRes;
  if (method === 'POST') {
    backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } else if (method === 'GET') {
    backendRes = await fetch(backendUrl);
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } else {
    res.status(405).end();
  }
}
