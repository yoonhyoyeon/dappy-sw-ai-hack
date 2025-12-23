/**
 * 계단 컴포넌트
 * - 벽과 동일한 높이로 계단 모양 렌더링
 * - 방향 설정 가능 (up/down)
 * - 양옆에 하나씩 두 개 렌더링
 */

interface StairsProps {
  position: [number, number, number];
  direction: 'up' | 'down';
  rotation?: [number, number, number]; // 회전 (기본값: [0, 0, 0])
  width?: number; // 계단 너비 (기본값: 1)
  depth?: number; // 계단 깊이 (기본값: 2)
  height?: number; // 계단 전체 높이 (기본값: 0.7, 벽과 동일)
  stepCount?: number; // 계단 단 수 (기본값: 7)
}

export default function Stairs({
  position,
  direction,
  rotation = [0, 0, 0],
  width = 1,
  depth = 2,
  height = 0.7,
  stepCount = 7
}: StairsProps) {
  const stepHeight = height / stepCount; // 각 계단의 높이
  const stepDepth = depth / stepCount; // 각 계단의 깊이

  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: stepCount }).map((_, index) => {
        // Z 위치는 항상 앞에서 뒤로
        const stepZ = -depth / 2 + index * stepDepth + stepDepth / 2;
        
        // 올라가는 계단: Y가 낮음에서 높음으로 (index가 증가하면 Y도 증가)
        // 내려가는 계단: Y가 높음에서 낮음으로 (index가 증가하면 Y는 감소)
        const stepY = direction === 'up' 
          ? index * stepHeight + stepHeight / 2 // 앞쪽이 낮고 뒤쪽이 높음
          : (stepCount - 1 - index) * stepHeight + stepHeight / 2; // 앞쪽이 높고 뒤쪽이 낮음

        return (
          <group key={index}>
            <mesh
              position={[0, stepY, stepZ]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[width, stepHeight, stepDepth]} />
              <meshStandardMaterial 
                color="#60a5fa"
                transparent
                opacity={1}
              />
            </mesh>
            {/* 계단 테두리 */}
            <lineSegments position={[0, stepY, stepZ]}>
              <edgesGeometry>
                <boxGeometry args={[width, stepHeight, stepDepth]} />
              </edgesGeometry>
              <lineBasicMaterial color="#222222" linewidth={2} />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}

/**
 * 양옆에 계단 두 개를 렌더링하는 컴포넌트
 * - 왼쪽: 올라가는 계단 (up)
 * - 오른쪽: 내려가는 계단 (down)
 */
interface DoubleStairsProps {
  centerPosition: [number, number, number];
  rotation?: [number, number, number]; // 회전 (기본값: [0, 0, 0])
  width?: number;
  depth?: number;
  height?: number;
  stepCount?: number;
  spacing?: number; // 두 계단 사이 간격 (기본값: 2)
}

export function DoubleStairs({
  centerPosition,
  rotation = [0, 0, 0],
  width = 1,
  depth = 2,
  height = 0.7,
  stepCount = 7,
  spacing = 2
}: DoubleStairsProps) {
  const halfHeight = height / 2; // 각 계단이 절반씩 높이 차지
  
  // 올라가는 계단: 0 ~ height/2
  const leftPosition: [number, number, number] = [-spacing / 2, 0, 0];
  // 내려가는 계단: height/2 ~ height (시작점을 height/2만큼 올림)
  const rightPosition: [number, number, number] = [spacing / 2, halfHeight, 0];

  return (
    <group position={centerPosition} rotation={rotation}>
      {/* 왼쪽 계단 - 올라가는 방향 (0 ~ height/2) */}
      <Stairs
        position={leftPosition}
        direction="up"
        width={width}
        depth={depth}
        height={halfHeight}
        stepCount={stepCount}
      />
      {/* 오른쪽 계단 - 내려가는 방향 (height/2 ~ height) */}
      <Stairs
        position={rightPosition}
        direction="down"
        width={width}
        depth={depth}
        height={halfHeight}
        stepCount={stepCount}
      />
    </group>
  );
}

