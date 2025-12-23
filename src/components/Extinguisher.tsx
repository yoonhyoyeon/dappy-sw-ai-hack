/**
 * 소화기 모형 컴포넌트
 * - 파란색 불투명
 * - 3D 원통형 소화기 모양
 */

interface ExtinguisherProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number; // 크기 조절 (기본값: 1)
}

export default function Extinguisher({
  position,
  rotation = [0, 0, 0],
  scale = 1
}: ExtinguisherProps) {
  const bodyRadius = 0.15 * scale;
  const bodyHeight = 0.5 * scale;
  const capRadius = 0.18 * scale;
  const capHeight = 0.08 * scale;
  const handleRadius = 0.03 * scale;
  const handleHeight = 0.15 * scale;

  return (
    <group position={position} rotation={rotation}>
      {/* 소화기 몸체 (파란색) */}
      <mesh position={[0, bodyHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>

      {/* 상단 캡 (어두운 파란색) */}
      <mesh position={[0, bodyHeight + capHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[capRadius, bodyRadius, capHeight, 16]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* 손잡이 (검은색) */}
      <mesh position={[0, bodyHeight + capHeight + handleHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[handleRadius, handleRadius, handleHeight, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* 손잡이 상단 (검은색) */}
      <mesh position={[0, bodyHeight + capHeight + handleHeight, 0]} castShadow receiveShadow>
        <sphereGeometry args={[handleRadius * 1.5, 8, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* 호스 연결부 (어두운 파란색) */}
      <mesh 
        position={[bodyRadius - 0.02 * scale, bodyHeight * 0.7, 0]} 
        rotation={[0, 0, Math.PI / 2]}
        castShadow 
        receiveShadow
      >
        <cylinderGeometry args={[0.04 * scale, 0.04 * scale, 0.1 * scale, 8]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
    </group>
  );
}

