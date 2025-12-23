import { useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Zone } from '../types/zone';
import ZoneBox from './ZoneBox';
import { DoubleStairs } from './Stairs';
import Extinguisher from './Extinguisher';
import Elevator from './Elevator';
import FireHydrant from './FireHydrant';
import ZonePopup from './ZonePopup';
import PathLine from './PathLine';
import Person from './Person';
import { getEscapePathAndAnalysis } from '../utils/api';
import { FloorPlanData } from '../lib/firebase';
import { usePolling } from '../hooks/usePolling';
/**
 * 벽 컴포넌트 (반투명)
 */
function Wall({ position, rotation, size }: { position: [number, number, number], rotation?: [number, number, number], size: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color="#666666" 
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

/**
 * 구역 정보 타입
 */
interface ZoneInfo {
  zone: Zone;
  position: [number, number, number];
  size: [number, number, number];
  zoneName: string;
}

/**
 * 계단 위치 정보 (실제 렌더링 위치 기반)
 */
const STAIRS_POSITIONS: { [key: string]: [number, number, number] } = {
  '계단4': [-0.4, 0.35, -4.25],
  '계단3': [-1.75, 0.35, -2.9],
  '계단2': [-3.3, 0.35, -5],
  '계단1': [-3.3, 0.35, 7],
};

/**
 * 건물 구조 컴포넌트 - ㄴ자 형태
 */
function BuildingStructure({ 
  zones, 
  onZoneClick,
  onZoneDoubleClick,
  pathPoints,
  floorPlanData,
  currentZone,
  zoneNameToPosition
}: { 
  zones: ZoneInfo[], 
  onZoneClick: (zoneInfo: ZoneInfo) => void,
  onZoneDoubleClick: (zoneInfo: ZoneInfo) => void,
  pathPoints: [number, number, number][],
  floorPlanData?: FloorPlanData | null,
  currentZone?: string,
  zoneNameToPosition?: { [key: string]: [number, number, number] }
}) {
  const wallHeight = 0.7;
  const wallThickness = 0.1;
  const buildingWidth = 10;  // 가로 길이
  const buildingDepth = 15;  // 세로 길이
  const rightWingLength = 5; // 오른쪽 날개 길이

  return (
    <group>
      {/* floorPlanData가 없을 때만 하드코딩된 벽 렌더링 */}
      {!floorPlanData && (
        <>
      {/* 외벽 */}
      <Wall position={[-buildingWidth/2 + 2.5, wallHeight / 2, 7.5]} size={[5, wallHeight, wallThickness]} />
      <Wall position={[0, wallHeight / 2, 2.5]} size={[wallThickness, wallHeight, 10]} />
      <Wall 
        position={[-buildingWidth / 2, wallHeight / 2, 0]} 
        size={[wallThickness, wallHeight, buildingDepth]} 
      />
      <Wall 
        position={[0, wallHeight / 2, -buildingDepth / 2]} 
        size={[buildingWidth, wallHeight, wallThickness]} 
      />
      <Wall 
        position={[buildingWidth / 2, wallHeight / 2, -buildingDepth / 2 + rightWingLength / 2]} 
        size={[wallThickness, wallHeight, rightWingLength]} 
      />
      <Wall 
        position={[buildingWidth / 2 - rightWingLength / 2, wallHeight / 2, buildingDepth / 2 - 10]} 
        size={[rightWingLength, wallHeight, wallThickness]} 
      />

      {/* 내부 벽 */}
      <Wall position={[-buildingWidth/2+2, wallHeight / 2, 0]} size={[wallThickness, wallHeight, buildingDepth]} />
      <Wall position={[-2, wallHeight / 2, 1.5]} size={[wallThickness, wallHeight, buildingDepth-3]} />
      <Wall position={[-2, wallHeight / 2, -6.5]} size={[wallThickness, wallHeight, 2]} />
      <Wall position={[1.5, wallHeight / 2, -4.5]} size={[buildingWidth-3, wallHeight, wallThickness]} />
      <Wall position={[1.5, wallHeight / 2, -5.5]} size={[buildingWidth-3, wallHeight, wallThickness]} />
      {/* 교실 구분 벽 */}
      <Wall position={[0, wallHeight / 2, -6.5]} size={[wallThickness, wallHeight, 2]} />
      <Wall position={[2.5, wallHeight / 2, -6.5]} size={[wallThickness, wallHeight, 2]} />
      <Wall position={[2.5, wallHeight / 2, -3.5]} size={[wallThickness, wallHeight, 2]} />
      <Wall position={[0, wallHeight / 2, -3.5]} size={[wallThickness, wallHeight, 2]} />
      <Wall position={[-1, wallHeight / 2, -2.5]} size={[2, wallHeight, wallThickness]} />
      <Wall position={[-1, wallHeight / 2, 0]} size={[2, wallHeight, wallThickness]} />
      <Wall position={[-1, wallHeight / 2, 3.75]} size={[2, wallHeight, wallThickness]} />
      <Wall position={[-4, wallHeight / 2, 0]} size={[2, wallHeight, wallThickness]} />
      <Wall position={[-4, wallHeight / 2, -3]} size={[2, wallHeight, wallThickness]} />
      <Wall position={[-4, wallHeight / 2, -4.5]} size={[2, wallHeight, wallThickness]} />
      <Wall position={[-4, wallHeight / 2, -5.5]} size={[2, wallHeight, wallThickness]} />
      <Wall position={[-4, wallHeight / 2, 3]} size={[2, wallHeight, wallThickness]} />
      <Wall position={[-4, wallHeight / 2, 5.5]} size={[2, wallHeight, wallThickness]} />
      <Wall position={[-4, wallHeight / 2, 6.5]} size={[2, wallHeight, wallThickness]} />
        </>
      )}

      {/* 구역들 */}
      {zones.map((zoneInfo) => (
        <ZoneBox
          key={zoneInfo.zone.zoneId}
          zone={zoneInfo.zone}
          position={zoneInfo.position}
          size={zoneInfo.size}
          zoneName={zoneInfo.zoneName}
          onClick={() => onZoneClick(zoneInfo)}
          onDoubleClick={() => onZoneDoubleClick(zoneInfo)}
        />
    ))}

      {/* 경로 표시 */}
      {pathPoints.length > 0 && <PathLine points={pathPoints} />}

      {/* 유저 위치 표시 (사람 컴포넌트) */}
      {currentZone && currentZone !== '선택 안됨' && zoneNameToPosition && zoneNameToPosition[currentZone] && (
        <Person 
          position={[
            zoneNameToPosition[currentZone][0],
            0.1, // 바닥에서 약간 위
            zoneNameToPosition[currentZone][2]
          ]}
        />
      )}

      {/* floorPlanData가 있으면 그것을 사용, 없으면 하드코딩된 구조 사용 */}
      {floorPlanData && floorPlanData.objects ? (
        <>
          {/* 벽 */}
          {floorPlanData.objects
            .filter((obj: any) => obj.type === 'wall')
            .map((obj: any) => (
              <Wall
                key={obj.id}
                position={obj.position}
                rotation={obj.rotation}
                size={obj.size}
              />
            ))}
          
          {/* 계단 */}
          {floorPlanData.objects
            .filter((obj: any) => obj.type === 'stairs')
            .map((obj: any) => {
              const stairsWidth = obj.size[0];
              const stairsHeight = obj.size[1];
              const stairsDepth = obj.size[2];
              const stairsSpacing = stairsWidth * 0.5;
              return (
                <DoubleStairs
                  key={obj.id}
                  centerPosition={obj.position}
                  rotation={obj.rotation}
                  width={stairsWidth}
                  depth={stairsDepth}
                  height={stairsHeight}
                  stepCount={7}
                  spacing={stairsSpacing}
                />
              );
            })}
          
          {/* 소화기 */}
          {floorPlanData.objects
            .filter((obj: any) => obj.type === 'extinguisher')
            .map((obj: any) => {
              const scale = obj.size[1] / 0.7; // height 기준으로 scale 계산
              return (
                <Extinguisher
                  key={obj.id}
                  position={obj.position}
                  scale={scale}
                  rotation={obj.rotation}
                />
              );
            })}
          
          {/* 엘리베이터 */}
          {floorPlanData.objects
            .filter((obj: any) => obj.type === 'elevator')
            .map((obj: any) => (
              <Elevator
                key={obj.id}
                position={obj.position}
                size={obj.size}
                rotation={obj.rotation}
              />
            ))}
          
          {/* 소화전 */}
          {floorPlanData.objects
            .filter((obj: any) => obj.type === 'firehydrant')
            .map((obj: any) => (
              <FireHydrant
                key={obj.id}
                position={obj.position}
                size={obj.size}
                rotation={obj.rotation}
              />
            ))}
        </>
      ) : (
        <>
          {/* 계단 */}
          {/* 계단4 */}
          <DoubleStairs
            centerPosition={[-0.4,0,-4.25]}
            width={0.2}
            depth={0.5}
            height={wallHeight}
            stepCount={7}
            spacing={0.2}
          />
          {/* 계단3 */}
          <DoubleStairs
            centerPosition={[-1.75,0,-2.9]}
            width={0.2}
            depth={0.5}
            height={wallHeight}
            stepCount={7}
            spacing={0.2}
            rotation={[0, Math.PI/2, 0]}
          />
          {/* 계단2 */}
          <DoubleStairs
            centerPosition={[-3.3,0,-5]}
            width={0.2}
            depth={0.5}
            height={wallHeight}
            stepCount={7}
            spacing={0.2}
            rotation={[0, -Math.PI/2, 0]}
          />
          {/* 계단1 */}
          <DoubleStairs
            centerPosition={[-3.3,0,7]}
            width={0.2}
            depth={0.5}
            height={wallHeight}
            stepCount={7}
            spacing={0.2}
            rotation={[0, -Math.PI/2, 0]}
          />

          {/* 소화기 */}
          <Extinguisher
            position={[-2.85, 0, 7.3]}
            scale={0.4}
            rotation={[0, 0, 0]}
          />
          <Extinguisher
            position={[-2.85, 0, 4.2]}
            scale={0.4}
            rotation={[0, 0, 0]}
          />
          <Extinguisher
            position={[-2.85, 0, 1.5]}
            scale={0.4}
            rotation={[0, 0, 0]}
          />
          <Extinguisher
            position={[-2.85, 0, -5.5]}
            scale={0.4}
            rotation={[0, 0, 0]}
          />
          <Extinguisher
            position={[0.2, 0, -4.65]}
            scale={0.4}
            rotation={[0, 0, 0]}
          />
          <Extinguisher
            position={[4.85, 0, -4.65]}
            scale={0.4}
            rotation={[0, 0, 0]}
          />

          {/* 엘리베이터 */}
          <Elevator
            position={[-3.25, 0, -4.28]}
            size={[0.42, 0.7, 0.35]}
            rotation={[0, 0, 0]}
          />
          <Elevator
            position={[-4, 0, -4.28]}
            size={[0.42, 0.7, 0.35]}
            rotation={[0, 0, 0]}
          />
          <Elevator
            position={[-4.75, 0, -4.28]}
            size={[0.42, 0.7, 0.35]}
            rotation={[0, 0, 0]}
          />
          <Elevator
            position={[-3.25, 0, -3.22]}
            size={[0.42, 0.7, 0.35]}
            rotation={[0, Math.PI, 0]}
          />
          <Elevator
            position={[-4, 0, -3.22]}
            size={[0.42, 0.7, 0.35]}
            rotation={[0, Math.PI, 0]}
          />
          <Elevator
            position={[-4.75, 0, -3.22]}
            size={[0.42, 0.7, 0.35]}
            rotation={[0, Math.PI, 0]}
          />
          <Elevator
            position={[-4.8, 0, 6]}
            size={[0.42, 0.7, 0.35]}
            rotation={[0, Math.PI/2, 0]}
          />

          {/* 소화전 */}
          <FireHydrant
            position={[-3+wallThickness/2, 0.15, 4.5]}
            size={[0.2, 0.4, 0.02]}
            rotation={[0, Math.PI/2, 0]}
          />
          <FireHydrant
            position={[-3+wallThickness/2, 0.15, 1.2]}
            size={[0.2, 0.4, 0.02]}
            rotation={[0, Math.PI/2, 0]}
          />
          <FireHydrant
            position={[-3+wallThickness/2, 0.15, -4.3]}
            size={[0.2, 0.4, 0.02]}
            rotation={[0, Math.PI/2, 0]}
          />
          <FireHydrant
            position={[1.3, 0.15, -5.5+wallThickness/2]}
            size={[0.2, 0.4, 0.02]}
            rotation={[0, 0, 0]}
          />
        </>
      )}
      
      {/* 바닥 테두리 (ㄴ자 형태) */}
      <lineSegments position={[0, 0.05, 0]}>
        <edgesGeometry>
          <boxGeometry args={[buildingWidth, 0.1, buildingDepth]} />
        </edgesGeometry>
        <lineBasicMaterial color="#999999" />
      </lineSegments>
      
    </group>
  );
}

/**
 * 테스트용 3D 씬 - 건물 구조
 */
export default function F2Scene({ 
  onZoneSelect,
  floorPlanData,
  currentZone
}: { 
  onZoneSelect?: (zoneName: string) => void;
  floorPlanData?: FloorPlanData | null;
  currentZone?: string;
}) {
  const wallHeight = 0.7;
  const wallThickness = 0.1;

  // 초기 구역 더미데이터
  const initialZones: ZoneInfo[] = [
    // 세로 강의실 구역
    {
      zone: {
        zoneId: 'zone-201',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: true,
        stair: false,
        people_cnt: 15
      },
      position: [-1, wallHeight/2, -1.25],
      size: [2-wallThickness, wallHeight, 2.5-wallThickness],
      zoneName: '201호'
    },
    {
      zone: {
        zoneId: 'zone-202',
        fireLevel: 0.2,
        smokeLevel: 0.1,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 25
      },
      position: [-1, wallHeight/2, 1.875],
      size: [2-wallThickness, wallHeight, 3.75-wallThickness],
      zoneName: '202호'
    },
    {
      zone: {
        zoneId: 'zone-203',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: true,
        stair: false,
        people_cnt: 10
      },
      position: [-1, wallHeight/2, 5.625],
      size: [2-wallThickness, wallHeight, 3.75-wallThickness],
      zoneName: '203호'
    },
    {
      zone: {
        zoneId: 'zone-204',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 8
      },
      position: [-4, wallHeight/2, 4.25],
      size: [2-wallThickness, wallHeight, 2.5-wallThickness],
      zoneName: '204호'
    },
    {
      zone: {
        zoneId: 'zone-205',
        fireLevel: 0.5,
        smokeLevel: 0.3,
        knife: false,
        extinguisher: true,
        stair: false,
        people_cnt: 30
      },
      position: [-4, wallHeight/2, 1.5],
      size: [2-wallThickness, wallHeight, 3-wallThickness],
      zoneName: '205호'
    },
    {
      zone: {
        zoneId: 'zone-206',
        fireLevel: 0,
        smokeLevel: 0,
        knife: true,
        extinguisher: false,
        stair: false,
        people_cnt: 5
      },
      position: [-4, wallHeight/2, -1.5],
      size: [2-wallThickness, wallHeight, 3-wallThickness],
      zoneName: '206호'
    },
    // 가로 강의실 구역
    {
      zone: {
        zoneId: 'zone-211',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: true,
        stair: false,
        people_cnt: 12
      },
      position: [1.25, wallHeight/2, -3.5],
      size: [2.5-wallThickness, wallHeight, 2-wallThickness],
      zoneName: '211호'
    },
    {
      zone: {
        zoneId: 'zone-208',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 18
      },
      position: [1.25, wallHeight/2, -6.5],
      size: [2.5-wallThickness, wallHeight, 2-wallThickness],
      zoneName: '208호'
    },
    {
      zone: {
        zoneId: 'zone-209',
        fireLevel: 0.1,
        smokeLevel: 0.05,
        knife: false,
        extinguisher: true,
        stair: false,
        people_cnt: 22
      },
      position: [3.75, wallHeight/2, -6.5],
      size: [2.5-wallThickness, wallHeight, 2-wallThickness],
      zoneName: '209호'
    },
    {
      zone: {
        zoneId: 'zone-210',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: true,
        stair: false,
        people_cnt: 6
      },
      position: [3.75, wallHeight/2, -3.5],
      size: [2.5-wallThickness, wallHeight, 2-wallThickness],
      zoneName: '210호'
    },
    {
      zone: {
        zoneId: 'zone-207',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 3
      },
      position: [-1, wallHeight/2, -6.5],
      size: [2-wallThickness, wallHeight, 2-wallThickness],
      zoneName: '207호'
    },
    // 세로복도
    {
      zone: {
        zoneId: 'zone-hallway-1',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 5
      },
      position: [-2.5, wallHeight/2, 5.625-wallThickness/2],
      size: [1-wallThickness, wallHeight, 3.75],
      zoneName: '복도1'
    },
    {
      zone: {
        zoneId: 'zone-hallway-2',
        fireLevel: 1,
        smokeLevel: 0,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 8
      },
      position: [-2.5, wallHeight/2, 1.875-wallThickness/2],
      size: [1-wallThickness, wallHeight, 3.75],
      zoneName: '복도2'
    },
    {
      zone: {
        zoneId: 'zone-hallway-3',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 12
      },
      position: [-2.5, wallHeight/2, -1.875-wallThickness/2],
      size: [1-wallThickness, wallHeight, 3.75],
      zoneName: '복도3'
    },
    {
      zone: {
        zoneId: 'zone-hallway-4',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 15
      },
      position: [-2.5, wallHeight/2, -5.625],
      size: [1-wallThickness, wallHeight, 3.75-wallThickness],
      zoneName: '복도4'
    },
    // 가로복도
    {
      zone: {
        zoneId: 'zone-hallway-5',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 10
      },
      position: [-0.25, wallHeight/2, -5],
      size: [3.7-wallThickness, wallHeight, 1-wallThickness],
      zoneName: '복도5'
    },
    {
      zone: {
        zoneId: 'zone-hallway-6',
        fireLevel: 0,
        smokeLevel: 0,
        knife: false,
        extinguisher: false,
        stair: false,
        people_cnt: 7
      },
      position: [3.25, wallHeight/2, -5],
      size: [3.5-wallThickness, wallHeight, 1-wallThickness],
      zoneName: '복도6'
    }
  ];

  // floorPlanData에서 zones 추출
  const zonesFromFloorPlan = useMemo(() => {
    if (!floorPlanData || !floorPlanData.objects) return [];
    
    return floorPlanData.objects
      .filter((obj: any) => obj.type === 'zone')
      .map((obj: any): ZoneInfo => ({
        zone: obj.zone || {
          zoneId: obj.id,
          fireLevel: 0,
          smokeLevel: 0,
          knife: false,
          extinguisher: false,
          stair: false,
          people_cnt: 0
        },
        position: obj.position,
        size: obj.size,
        zoneName: obj.zoneName || obj.id
      }));
  }, [floorPlanData]);

  // zones 결정: floorPlanData가 있으면 그것을 사용, 없으면 기본값
  const [zones, setZones] = useState<ZoneInfo[]>(floorPlanData ? zonesFromFloorPlan : initialZones);

  const [selectedZone, setSelectedZone] = useState<ZoneInfo | null>(null);
  const [pathPoints, setPathPoints] = useState<[number, number, number][]>([]);

  // floorPlanData가 변경되면 zones 업데이트
  useEffect(() => {
    if (floorPlanData) {
      setZones(zonesFromFloorPlan);
    } else {
      setZones(initialZones);
    }
  }, [floorPlanData, zonesFromFloorPlan]);

  // 구역 이름 → 좌표 매핑
  const zoneNameToPosition: { [key: string]: [number, number, number] } = useMemo(() => {
    const positionMap: { [key: string]: [number, number, number] } = {};
    
    // zones에서 구역 위치 추가
    zones.forEach(zoneInfo => {
      positionMap[zoneInfo.zoneName] = zoneInfo.position;
    });
    
    // floorPlanData에서 계단 위치 추가
    if (floorPlanData && floorPlanData.objects) {
      floorPlanData.objects
        .filter((obj: any) => obj.type === 'stairs')
        .forEach((obj: any) => {
          // 계단 이름은 zoneName이나 id에서 추출 (예: "stairs-1" -> "계단1")
          // 또는 별도로 저장된 이름이 있다면 그것을 사용
          const stairName = obj.zoneName || obj.id;
          if (stairName) {
            positionMap[stairName] = obj.position;
          }
        });
    }
    
    // 기본 계단 위치 추가 (하드코딩된 위치)
    Object.entries(STAIRS_POSITIONS).forEach(([name, position]) => {
      if (!positionMap[name]) {
        positionMap[name] = position;
      }
    });
    
    return positionMap;
  }, [zones, floorPlanData]);

  const handleZoneClick = (zoneInfo: ZoneInfo) => {
    setSelectedZone(zoneInfo);
  };

  // 구역 상태 및 대피 경로 업데이트 함수
  const updateZoneStatusAndPath = useCallback(async (zoneName: string) => {
    try {
      const result = await getEscapePathAndAnalysis(zoneName);
      
      // 1. 구역 상태 업데이트 (analysis)
      if (result && result.analysis && Array.isArray(result.analysis)) {
        setZones(prevZones => {
          return prevZones.map(zone => {
            const analysisItem = result.analysis.find((item: any) => item.zoneId === zone.zoneName);
            if (analysisItem) {
              return {
                ...zone,
                zone: {
                  ...zone.zone,
                  fireLevel: analysisItem.fireLevel || 0,
                  smokeLevel: analysisItem.smokeLevel || 0,
                  knife: analysisItem.knife || false,
                  people_cnt: analysisItem.people_cnt || 0
                }
              };
            }
            return zone;
          });
        });
      }
      
      // 2. 대피 경로 표시 (escape_path)
      if (result && result.escape_path && result.escape_path.path && Array.isArray(result.escape_path.path)) {
        const points: [number, number, number][] = result.escape_path.path
          .map((zoneName: string) => {
            const pos = zoneNameToPosition[zoneName];
            if (pos) {
              return pos;
            }
            console.warn(`좌표를 찾을 수 없음: ${zoneName}`);
            return null;
          })
          .filter((pos: [number, number, number] | null): pos is [number, number, number] => pos !== null);
        
        console.log('경로 좌표:', points);
        setPathPoints(points);
      } else {
        setPathPoints([]);
      }
    } catch (error) {
      // 에러는 이미 콘솔에 출력됨
      setPathPoints([]);
    }
  }, [zoneNameToPosition]);

  const handleZoneDoubleClick = async (zoneInfo: ZoneInfo) => {
    if (onZoneSelect) {
      onZoneSelect(zoneInfo.zoneName);
    }
    
    // 즉시 한 번 호출
    await updateZoneStatusAndPath(zoneInfo.zoneName);
  };

  // currentZone이 있을 때 1초마다 자동 업데이트
  usePolling(() => {
    if (currentZone && currentZone !== '선택 안됨') {
      updateZoneStatusAndPath(currentZone);
    }
  }, 1000);

  const handleClosePopup = () => {
    setSelectedZone(null);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas>
        <color attach="background" args={['#f0f0f0']} />
        <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={60} />
        
        {/* 조명 */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
        />
        <directionalLight 
          position={[-10, 10, -5]} 
          intensity={0.5} 
        />
        
        {/* 바닥 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
        
        {/* 그리드 */}
        <gridHelper args={[30, 30, '#888888', '#cccccc']} />
        
        {/* 건물 구조 */}
        <BuildingStructure 
          zones={zones} 
          onZoneClick={handleZoneClick}
          onZoneDoubleClick={handleZoneDoubleClick}
          pathPoints={pathPoints}
          floorPlanData={floorPlanData}
          currentZone={currentZone}
          zoneNameToPosition={zoneNameToPosition}
        />
        
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={30}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>

      {/* 색상 범례 */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-4 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3">색상 범례</h3>
        
        {/* 구역 상태 */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">구역 상태</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00ff00', opacity: 0.3 }}></div>
              <span className="text-xs text-gray-600">정상</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff0000', opacity: 0.6 }}></div>
              <span className="text-xs text-gray-600">위험 (화재/연기)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4a1a4a', opacity: 0.8 }}></div>
              <span className="text-xs text-gray-600">칼부림</span>
            </div>
          </div>
        </div>

        {/* 혼잡도 */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">혼잡도 (80㎡ 기준)</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff0000' }}></div>
              <span className="text-xs text-gray-600">40명 이상 (매우 혼잡)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff8800' }}></div>
              <span className="text-xs text-gray-600">30명 이상 (혼잡)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffdd00' }}></div>
              <span className="text-xs text-gray-600">20명 이상 (보통)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00ff00' }}></div>
              <span className="text-xs text-gray-600">20명 미만 (여유)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 구역 상태 팝업 */}
      {selectedZone && (
        <ZonePopup
          zone={selectedZone.zone}
          zoneName={selectedZone.zoneName}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

