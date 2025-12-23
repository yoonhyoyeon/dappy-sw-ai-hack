/**
 * Zone 데이터 구조 (AI 서버 → App Frontend)
 */
export interface Zone {
  zoneId: string;
  fireLevel: number;       // 화재 강도 (0 ~ 1)
  smokeLevel: number;      // 연기 농도 (0 ~ 1)
  knife: boolean;          // 칼부림 발생 여부
  extinguisher: boolean;   // 소화기 존재 여부
  stair: boolean;          // 계단 구역 여부
  people_cnt: number;      // 혼잡도 판단용
}

/**
 * 대피 경로 정보
 */
export interface EvacuationPath {
  zones: string[];         // Zone ID 배열
  distance?: number;       // 총 거리 (옵션)
  estimatedTime?: number;  // 예상 소요 시간 (옵션)
}

/**
 * AI 서버 응답 구조
 */
export interface AIServerResponse {
  zones: Zone[];
  evacuationPath?: EvacuationPath;
  currentZoneId?: string;
}

