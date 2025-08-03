import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  // Spring Bootバックエンドにプロキシ
  const backendRes = await fetch('http://localhost:8080/api/hello');
  const text = await backendRes.text();
  res.status(200).send(text);
}
