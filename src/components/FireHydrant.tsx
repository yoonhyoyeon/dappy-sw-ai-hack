/**
 * 소화전 컴포넌트
 * - 벽에 얇게 붙어있는 형태
 * - 짙은 회색 박스에 상단 빨간색 반구
 */

interface FireHydrantProps {
  position: [number, number, number];
  size: [number, number, number]; // [width, height, depth]
  rotation?: [number, number, number];
}

export default function FireHydrant({
  position,
  size,
  rotation = [0, 0, 0]
}: FireHydrantProps) {
  const [width, height, depth] = size;

  return (
    <group position={position} rotation={rotation}>
      {/* 소화전 박스 (짙은 회색) */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color="#9ca3af"
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      {/* 앞면 중앙 빨간색 반구 (경광등) */}
      <mesh position={[0, height * 0.7, depth / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[width / 8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 테두리 강조 */}
      <lineSegments position={[0, height / 2, 0]}>
        <edgesGeometry>
          <boxGeometry args={[width, height, depth]} />
        </edgesGeometry>
        <lineBasicMaterial color="#1f2937" linewidth={2} />
      </lineSegments>
    </group>
  );
}

