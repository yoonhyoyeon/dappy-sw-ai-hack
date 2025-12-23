import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

interface PathLineProps {
  points: [number, number, number][];
}

/**
 * 경로를 흐르는 그라데이션 애니메이션으로 표시하는 컴포넌트
 */
export default function PathLine({ points }: PathLineProps) {
  const lineRef = useRef<any>(null);
  const dashOffsetRef = useRef(0);

  // 흐르는 애니메이션
  useFrame((_state, delta) => {
    dashOffsetRef.current -= delta * 2;
    if (lineRef.current && lineRef.current.material) {
      lineRef.current.material.dashOffset = dashOffsetRef.current;
    }
  });

  if (points.length < 2) return null;

  return (
    <>
      {/* 배경 선 (더 두껍고 연한 색) */}
      <Line
        points={points}
        color="#60a5fa"
        lineWidth={12}
        dashed={false}
      />
      {/* 전경 선 (흐르는 대시 패턴) */}
      <Line
        ref={lineRef}
        points={points}
        color="#ffffff"
        lineWidth={10}
        dashed={true}
        dashScale={1}
        dashSize={0.5}
        gapSize={0.3}
      />
      {/* 중심 선 (밝은 파란색) */}
      <Line
        points={points}
        color="#3b82f6"
        lineWidth={8}
        dashed={false}
      />
    </>
  );
}

