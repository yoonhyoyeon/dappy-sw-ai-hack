import { Zone } from '../types/zone';

/**
 * 초기 진압 가능 여부 판단 (프론트 규칙 기반)
 */
export function canExtinguish(zone: Zone, nearbyZones: Zone[]): boolean {
  const FIRE_THRESHOLD = 0.3;
  const SMOKE_THRESHOLD = 0.3;

  // 화재/연기 레벨이 임계값 이하인지 확인
  if (zone.fireLevel > FIRE_THRESHOLD || zone.smokeLevel > SMOKE_THRESHOLD) {
    return false;
  }

  // 인근 Zone에 소화기가 있는지 확인
  const hasNearbyExtinguisher = nearbyZones.some(z => z.extinguisher === true);
  
  return hasNearbyExtinguisher;
}

/**
 * Zone의 위험도 계산
 */
export function calculateDangerLevel(zone: Zone): number {
  const weights = {
    fire: 0.4,
    smoke: 0.3,
    blocked: 0.2,
    knife: 0.1,
  };

  let dangerLevel = 0;
  dangerLevel += zone.fireLevel * weights.fire;
  dangerLevel += zone.smokeLevel * weights.smoke;
  dangerLevel += zone.blockedLevel * weights.blocked;
  dangerLevel += zone.knife ? weights.knife : 0;

  return Math.min(dangerLevel, 1.0);
}

/**
 * Zone의 색상 결정 (상태 표시용)
 */
export function getZoneColor(zone: Zone): string {
  const dangerLevel = calculateDangerLevel(zone);

  if (zone.blockedLevel > 0.5) {
    return '#6b7280'; // 회색 - 차단
  }

  if (zone.knife) {
    return '#991b1b'; // 진한 빨강 - 칼부림
  }

  if (dangerLevel > 0.7) {
    return '#dc2626'; // 빨강 - 위험
  }

  if (dangerLevel > 0.4) {
    return '#f97316'; // 주황 - 주의
  }

  if (zone.extinguisher) {
    return '#3b82f6'; // 파랑 - 소화기 위치
  }

  return '#22c55e'; // 초록 - 안전
}

