import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const AI_SERVER_URL = 'http://43.202.81.16:3000';

  // CORS 헤더 설정
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  try {
    const apiResponse = await fetch(`${AI_SERVER_URL}/get-escape-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body),
    });

    const data = await apiResponse.json();
    
    response.status(apiResponse.status).json(data);
  } catch (error) {
    console.error('API 프록시 오류:', error);
    response.status(500).json({ error: '프록시 요청 실패' });
  }
}

