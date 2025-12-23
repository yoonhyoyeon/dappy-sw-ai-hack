import { useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { Zone } from '../types/zone';
import { ThreeEvent } from '@react-three/fiber';
import Person from './Person';

interface ZoneBoxProps {
  zone: Zone;
  position: [number, number, number];
  size: [number, number, number];
  zoneName?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  isCurrentZone?: boolean;
}

/**
 * 구역(Zone) 박스 컴포넌트
 * - 위험도에 따른 색상 및 opacity 표시
 * - 칼부림 상태 표시
 * - 혼잡도 표시
 * - 구역 이름 표시
 */
export default function ZoneBox({ zone, position, size, zoneName, onClick, onDoubleClick, isCurrentZone = false }: ZoneBoxProps) {
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef<number>(0);

  // 화재 점수 계산 (fireLevel과 smokeLevel 중 더 높은 값 사용)
  const fireScore = useMemo(() => {
    return Math.max(zone.fireLevel, zone.smokeLevel);
  }, [zone.fireLevel, zone.smokeLevel]);

  // 색상 및 opacity 결정
  const { color, opacity } = useMemo(() => {
    // 칼부림이 발생한 경우 - 탁하고 어두운 보라색
    if (zone.knife) {
      return { color: '#4a1a4a', opacity: 0.8 };
    }

    // 화재 점수에 따라 빨주노로 색상 구분 (쨍한 색상으로 통일)
    if (fireScore > 0) {
      if (fireScore >= 0.7) {
        return { color: '#ff0000', opacity: 0.8 }; // 빨강 - 매우 위험
      } else if (fireScore >= 0.4) {
        return { color: '#ff6600', opacity: 0.8 }; // 주황 - 위험
      } else {
        return { color: '#ffff00', opacity: 0.8 }; // 노랑 - 주의
      }
    }

    // 정상 상태 - 초록색
    return { color: '#00ff00', opacity: 0.3 };
  }, [zone.knife, fireScore]);

  // 면적 계산 (width * depth)
  const area = useMemo(() => {
    const [width, , depth] = size;
    return width * depth;
  }, [size]);

  // 강의실 하나 기준 면적 (4㎡ = 2m x 2m)
  const classroomArea = 4; // 강의실 하나 크기

  // 강의실 기준으로 정규화된 사람수 계산
  const normalizedPeopleCount = useMemo(() => {
    if (area === 0) return 0;
    // 현재 구역 면적을 강의실 하나(4㎡) 기준으로 정규화
    return (zone.people_cnt / area) * classroomArea;
  }, [zone.people_cnt, area]);

  // 혼잡도에 따른 색상 결정 (강의실 하나 기준 사람수)
  const congestionColor = useMemo(() => {
    // 강의실 하나(4㎡) 기준 사람수
    if (normalizedPeopleCount >= 40) return '#ff0000'; // 빨강 - 매우 혼잡 (20명 이상)
    if (normalizedPeopleCount >= 30) return '#ff8800'; // 주황 - 혼잡 (10명 이상)
    if (normalizedPeopleCount >= 20) return '#ffdd00';  // 노랑 - 보통 (5명 이상)
    return '#00ff00'; // 초록 - 여유 (5명 미만)
  }, [normalizedPeopleCount]);

  const [, height] = size;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      // 첫 번째 클릭 - 300ms 대기
      clickTimeoutRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          // 단일 클릭
          if (onClick) {
            onClick();
          }
        }
        clickCountRef.current = 0;
      }, 300);
    } else if (clickCountRef.current === 2) {
      // 더블클릭
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      clickCountRef.current = 0;
      if (onDoubleClick) {
        onDoubleClick();
      }
    }
  };

  return (
    <group position={position}>
      {/* 구역 박스 */}
      <mesh 
        castShadow 
        receiveShadow
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* 현재 구역일 때 빨간색 다이아몬드 표시 (박스 안 중앙) */}
      {isCurrentZone && (
        <Person position={[0, 0, 0]} />
      )}

      {/* 혼잡도 표시 구 (박스 위 가운데) - 0명도 표시 */}
      <group position={[0, height / 2 + 0.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={congestionColor} />
        </mesh>
        {/* 사람 수 텍스트 */}
        <Text
          position={[0.25, 0, 0]}
          fontSize={0.15}
          color="#000000"
          anchorX="left"
          anchorY="middle"
        >
          {zone.people_cnt}
        </Text>
      </group>

      {/* 구역 이름 표시 (박스 위) */}
      {zoneName && (
        <Text
          position={[0, height / 2 + 0.4, 0]}
          fontSize={0.2}
          color={isCurrentZone ? "#ff0000" : "#000000"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {zoneName}
        </Text>
      )}
    </group>
  );
}

