/**
 * 빨간색 다이아몬드 - 유저 위치 표시용
 */
interface PersonProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export default function Person({ 
  position, 
  rotation = [0, 0, 0] 
}: PersonProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* 위로 길쭉한 빨간색 다이아몬드 */}
      <mesh  scale={[0.7, 1.5, 0.7]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

