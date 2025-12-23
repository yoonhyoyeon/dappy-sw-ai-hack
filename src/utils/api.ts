import { AIServerResponse } from '../types/zone';

const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:8000';

/**
 * AI 서버로부터 Zone 상태 데이터를 가져옵니다 (1초 주기 polling)
 */
export async function fetchZoneData(currentZoneId?: string): Promise<AIServerResponse> {
  try {
    const url = currentZoneId 
      ? `${AI_SERVER_URL}/api/zones?currentZoneId=${currentZoneId}`
      : `${AI_SERVER_URL}/api/zones`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch zone data:', error);
    throw error;
  }
}

/**
 * 대피 경로를 요청합니다
 */
export async function fetchEvacuationPath(
  currentZoneId: string,
  targetZoneId?: string
): Promise<AIServerResponse> {
  try {
    const url = targetZoneId
      ? `${AI_SERVER_URL}/api/evacuation?currentZoneId=${currentZoneId}&targetZoneId=${targetZoneId}`
      : `${AI_SERVER_URL}/api/evacuation?currentZoneId=${currentZoneId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch evacuation path:', error);
    throw error;
  }
}

/**
 * 구역 상태 및 대피 경로 요청
 * AI 서버: http://43.202.81.16:3000
 * 응답 구조:
 * {
 *   "analysis": [{ zoneId, fireLevel, smokeLevel, knife, people_cnt }],
 *   "escape_path": { start, destination, path, total_distance, is_safe }
 * }
 */
export async function getEscapePathAndAnalysis(currentLocation: string) {
  // 모든 환경에서 프록시 사용 (개발: Vite 프록시, 프로덕션: Vercel Function)
  const API_BASE_URL = '/api/get-escape-path';
  
  try {
    console.log('=== 구역 상태 및 대피 경로 API 호출 ===');
    console.log('요청 URL:', API_BASE_URL);
    console.log('요청 Body:', { current_location: currentLocation });
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ current_location: currentLocation }),
    });
    
    console.log('응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('에러 응답:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('응답 데이터:', data);
    console.log('응답 구조:');
    console.log('  - analysis:', data.analysis);
    console.log('  - escape_path:', data.escape_path);
    console.log('==============================');
    
    return data;
  } catch (error) {
    console.error('API 호출 실패:', error);
    console.log('==============================');
    throw error;
  }
}

