import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventId } = req.query;
  const backendUrl = `http://localhost:8080/api/events/${eventId}`;
  const method = req.method || 'GET';
  let backendRes;
  if (method === 'GET') {
    backendRes = await fetch(backendUrl);
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } else {
    res.status(405).end();
  }
}
