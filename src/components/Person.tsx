/**
 * 사람 컴포넌트 - 유저 위치 표시용
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
      {/* 머리 */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* 몸통 */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* 팔 (왼쪽) */}
      <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* 팔 (오른쪽) */}
      <mesh position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* 다리 (왼쪽) */}
      <mesh position={[-0.04, -0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      
      {/* 다리 (오른쪽) */}
      <mesh position={[0.04, -0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      
      {/* 발 (왼쪽) */}
      <mesh position={[-0.04, -0.22, 0.02]}>
        <boxGeometry args={[0.05, 0.02, 0.08]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* 발 (오른쪽) */}
      <mesh position={[0.04, -0.22, 0.02]}>
        <boxGeometry args={[0.05, 0.02, 0.08]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* 빨간색 화살표 (머리 위) */}
      <group position={[0, 0.25, 0]}>
        {/* 화살표 몸통 (아래로 향하는 원뿔) */}
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        {/* 화살표 막대 */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      </group>
    </group>
  );
}

