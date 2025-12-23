/**
 * 엘리베이터 모형 컴포넌트
 * - 회색 불투명 박스 형태
 * - 문 디자인 유지
 * - size로 크기 조정
 */

interface ElevatorProps {
  position: [number, number, number];
  size: [number, number, number]; // [width, height, depth]
  rotation?: [number, number, number];
}

export default function Elevator({
  position,
  size,
  rotation = [0, 0, 0]
}: ElevatorProps) {
  const [width, height, depth] = size;

  return (
    <group position={position} rotation={rotation}>
      {/* 엘리베이터 본체 (어두운 회색 박스) */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>

      {/* 앞면 문 - 왼쪽 */}
      <mesh position={[-width / 4, height / 2, depth / 2 + 0.01]}>
        <boxGeometry args={[width / 2 - 0.05, height - 0.2, 0.02]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 앞면 문 - 오른쪽 */}
      <mesh position={[width / 4, height / 2, depth / 2 + 0.01]}>
        <boxGeometry args={[width / 2 - 0.05, height - 0.2, 0.02]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

