import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = 'http://localhost:8080/api/events';
  const method = req.method || 'GET';
  const headers = { 'Content-Type': 'application/json' };
  let backendRes;
  if (method === 'POST') {
    backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } else {
    res.status(405).end();
  }
}
