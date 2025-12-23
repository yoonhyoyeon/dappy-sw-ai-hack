import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import toast from 'react-hot-toast';
import { Zone } from '../types/zone';
import ZoneBox from './ZoneBox';
import { DoubleStairs } from './Stairs';
import Extinguisher from './Extinguisher';
import Elevator from './Elevator';
import FireHydrant from './FireHydrant';

/**
 * 오브젝트 타입
 */
type ObjectType = 'wall' | 'zone' | 'extinguisher' | 'stairs' | 'elevator' | 'firehydrant';

/**
 * 오브젝트 정보 타입
 */
interface ObjectInfo {
  id: string;
  type: ObjectType;
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
  // Zone 전용
  zone?: Zone;
  zoneName?: string;
}

/**
 * 편집 가능한 오브젝트 컴포넌트
 */
function EditableObject({ 
  object, 
  isSelected,
  onClick
}: { 
  object: ObjectInfo; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const renderObject = () => {
    switch (object.type) {
      case 'wall':
        return (
          <mesh 
            position={object.position} 
            rotation={object.rotation || [0, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={object.size} />
            <meshStandardMaterial 
              color={isSelected ? "#3b82f6" : "#666666"}
              transparent
              opacity={isSelected ? 0.8 : 0.3}
            />
          </mesh>
        );
      
      case 'zone':
        return (
          <group>
            <ZoneBox
              zone={object.zone || {
                zoneId: object.id,
                fireLevel: 0,
                smokeLevel: 0,
                knife: false,
                extinguisher: false,
                stair: false,
                people_cnt: 0
              }}
              position={object.position}
              size={object.size}
              zoneName={object.zoneName}
              onClick={onClick}
            />
            {isSelected && (
              <mesh position={object.position}>
                <boxGeometry args={object.size} />
                <meshBasicMaterial 
                  color="#3b82f6"
                  wireframe
                  transparent
                  opacity={0.5}
                />
              </mesh>
            )}
          </group>
        );
      
      case 'extinguisher':
        // size는 와이어프레임 표시용으로만 사용 (실제 소화기는 scale로 크기 조정)
        const extinguisherScale = object.size[1] / 0.7; // height 기준으로 scale 계산
        return (
          <group
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Extinguisher
              position={object.position}
              rotation={object.rotation}
              scale={extinguisherScale}
            />
            {isSelected && (
              <mesh position={[object.position[0], object.position[1] + object.size[1] / 2, object.position[2]]}>
                <boxGeometry args={object.size} />
                <meshBasicMaterial 
                  color="#3b82f6"
                  wireframe
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}
          </group>
        );
      
      case 'stairs':
        // size[0]: width (각 계단 너비)
        // size[1]: height (높이)
        // size[2]: depth (깊이)
        // spacing은 width의 0.2배로 계산 (또는 width와 동일하게)
        const stairsWidth = object.size[0];
        const stairsHeight = object.size[1];
        const stairsDepth = object.size[2];
        const stairsSpacing = stairsWidth * 0.5; // width의 20%를 간격으로 사용
        
        return (
          <group
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <DoubleStairs
              centerPosition={object.position}
              rotation={object.rotation}
              width={stairsWidth}
              depth={stairsDepth}
              height={stairsHeight}
              stepCount={7}
              spacing={stairsSpacing}
            />
            {isSelected && (
              <mesh position={object.position}>
                <boxGeometry args={[stairsSpacing + stairsWidth, stairsHeight, stairsDepth]} />
                <meshBasicMaterial 
                  color="#3b82f6"
                  wireframe
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}
          </group>
        );
      
      case 'elevator':
        return (
          <group
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Elevator
              position={object.position}
              size={object.size}
              rotation={object.rotation}
            />
            {isSelected && (
              <mesh position={[object.position[0], object.position[1] + object.size[1] / 2, object.position[2]]}>
                <boxGeometry args={object.size} />
                <meshBasicMaterial 
                  color="#3b82f6"
                  wireframe
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}
          </group>
        );
      
      case 'firehydrant':
        return (
          <group
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <FireHydrant
              position={object.position}
              size={object.size}
              rotation={object.rotation}
            />
            {isSelected && (
              <mesh position={[object.position[0], object.position[1] + object.size[1] / 2, object.position[2]]}>
                <boxGeometry args={object.size} />
                <meshBasicMaterial 
                  color="#3b82f6"
                  wireframe
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}
          </group>
        );
      
      default:
        return null;
    }
  };

  return <>{renderObject()}</>;
}

/**
 * 건물 구조 빌더 씬
 */
export default function BuilderScene({ 
  onSave,
  initialObjects: propInitialObjects,
  buildingInfo
}: { 
  onSave?: (objects: ObjectInfo[]) => void;
  initialObjects?: any[] | null;
  buildingInfo?: { buildingName: string; floor: number } | null;
}) {
  const wallHeight = 0.7;
  const wallThickness = 0.1;

  // 기본 초기 오브젝트 데이터 (F2Scene의 도면 데이터 기반)
  const defaultInitialObjects: ObjectInfo[] = [];

  const [objects, setObjects] = useState<ObjectInfo[]>(
    propInitialObjects || defaultInitialObjects
  );
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [objectTypeToAdd, setObjectTypeToAdd] = useState<ObjectType>('wall');
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

  // propInitialObjects가 변경될 때 objects 상태 업데이트
  useEffect(() => {
    if (propInitialObjects !== undefined) {
      if (propInitialObjects && propInitialObjects.length > 0) {
        setObjects(propInitialObjects);
        console.log('✅ 불러온 오브젝트 반영:', propInitialObjects);
      } else {
        // null이거나 빈 배열이면 기본값으로 초기화
        setObjects(defaultInitialObjects);
        console.log('✅ 초기 오브젝트로 초기화');
      }
    }
  }, [propInitialObjects]);

  // 새 오브젝트 추가
  const addObject = () => {
    let newObject: ObjectInfo;
    
    switch (objectTypeToAdd) {
      case 'wall':
        newObject = {
          id: `wall-${Date.now()}`,
          type: 'wall',
          position: [0, wallHeight / 2, 0],
          size: [2, wallHeight, wallThickness]
        };
        break;
      case 'zone':
        newObject = {
          id: `zone-${Date.now()}`,
          type: 'zone',
          position: [0, wallHeight / 2, 0],
          size: [2, wallHeight, 2],
          zone: {
            zoneId: `zone-${Date.now()}`,
            fireLevel: 0,
            smokeLevel: 0,
            knife: false,
            extinguisher: false,
            stair: false,
            people_cnt: 0
          },
          zoneName: '새 구역'
        };
        break;
      case 'extinguisher':
        newObject = {
          id: `extinguisher-${Date.now()}`,
          type: 'extinguisher',
          position: [0, 0, 0],
          size: [0.5, 0.7, 0.5]
        };
        break;
      case 'stairs':
        newObject = {
          id: `stairs-${Date.now()}`,
          type: 'stairs',
          position: [0, 0, 0],
          size: [1, wallHeight, 0.5] // [width, height, depth]
        };
        break;
      case 'elevator':
        newObject = {
          id: `elevator-${Date.now()}`,
          type: 'elevator',
          position: [0, 0, 0],
          size: [1.5, 2.5, 1.2] // [width, height, depth]
        };
        break;
      case 'firehydrant':
        newObject = {
          id: `firehydrant-${Date.now()}`,
          type: 'firehydrant',
          position: [0, wallHeight / 2, 0], // 벽 가운데 높이
          size: [0.4, 0.5, 0.1] // [width, height, depth] - 위아래 공백 0.1씩
        };
        break;
    }
    
    setObjects([...objects, newObject]);
    setSelectedObjectId(newObject.id);
  };

  // 오브젝트 삭제
  const deleteObject = () => {
    if (selectedObjectId) {
      setObjects(objects.filter(o => o.id !== selectedObjectId));
      setSelectedObjectId(null);
    }
  };

  // 선택된 오브젝트 정보 업데이트
  const updateSelectedObject = (updates: Partial<ObjectInfo>) => {
    if (selectedObjectId) {
      setObjects(objects.map(o => 
        o.id === selectedObjectId 
          ? { ...o, ...updates }
          : o
      ));
    }
  };

  // 오브젝트 클릭 핸들러
  const handleObjectClick = (objectId: string) => {
    if (selectedObjectId === objectId) {
      // 선택된 오브젝트를 다시 클릭하면 선택 해제
      setSelectedObjectId(null);
    } else {
      // 새로운 오브젝트 선택
      setSelectedObjectId(objectId);
    }
  };

  // 방향키로 오브젝트 이동, 스페이스바로 회전, 백스페이스로 삭제
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // input, textarea 등에서 입력 중일 때는 단축키 무시
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // 백스페이스: 선택된 오브젝트 삭제
      if (e.key === 'Backspace' && selectedObjectId) {
        e.preventDefault();
        setObjects(prevObjects => prevObjects.filter(obj => obj.id !== selectedObjectId));
        setSelectedObjectId(null);
        return;
      }

      if (!selectedObjectId) return;

      const moveAmount = e.shiftKey ? 0.05 : 0.1; // Shift 키로 미세 조정 (0.05), 일반 (0.1)
      const rotateAmount = e.shiftKey ? (Math.PI / 36) : (Math.PI / 4); // Shift: 5도, 일반: 45도
      let actionTaken = false;

      setObjects(prevObjects => prevObjects.map(obj => {
        if (obj.id !== selectedObjectId) return obj;

        let newPosition: [number, number, number] = [...obj.position];
        let newRotation: [number, number, number] = obj.rotation ? [...obj.rotation] : [0, 0, 0];

        switch (e.key) {
          case 'ArrowLeft':
            newPosition[0] -= moveAmount;
            actionTaken = true;
            break;
          case 'ArrowRight':
            newPosition[0] += moveAmount;
            actionTaken = true;
            break;
          case 'ArrowUp':
            newPosition[2] -= moveAmount;
            actionTaken = true;
            break;
          case 'ArrowDown':
            newPosition[2] += moveAmount;
            actionTaken = true;
            break;
          case ' ': // 스페이스바
            newRotation[1] += rotateAmount;
            // 360도 범위 내로 정규화
            if (newRotation[1] >= Math.PI * 2) {
              newRotation[1] -= Math.PI * 2;
            }
            actionTaken = true;
            break;
        }

        if (actionTaken) {
          e.preventDefault();
          return { ...obj, position: newPosition, rotation: newRotation };
        }
        return obj;
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId]);

  const selectedObject = objects.find(o => o.id === selectedObjectId);

  return (
    <div className="w-full h-full relative overflow-hidden">

      {/* 3D 뷰 */}
      <div className="w-full h-full">
        <Canvas>
          <color attach="background" args={['#f0f0f0']} />
          <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={60} />
          
          {/* 조명 */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />
          
          {/* 바닥 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#e8e8e8" />
          </mesh>
          
          {/* 그리드 */}
          <gridHelper args={[30, 30, '#888888', '#cccccc']} />
          
          {/* 오브젝트들 */}
          {objects.map((object) => (
            <EditableObject
              key={object.id}
              object={object}
              isSelected={object.id === selectedObjectId}
              onClick={() => handleObjectClick(object.id)}
            />
          ))}
          
          {/* 카메라 컨트롤 */}
          <OrbitControls
            enabled={true}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={30}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
          />
        </Canvas>
      </div>

      {/* 편집 패널 토글 버튼 */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white p-3 rounded-l-lg shadow-lg hover:bg-blue-700 transition-all ${
          isPanelOpen ? 'right-80' : 'right-0'
        }`}
      >
        {isPanelOpen ? '›' : '‹'}
      </button>

      {/* 편집 패널 */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl transition-transform duration-300 py-5 ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {buildingInfo ? '도면 편집' : '새로운 도면 생성'}
          </h2>

          {/* 불러온 도면 정보 표시 (Edit 페이지에서만) */}
          {buildingInfo && (
            <div className="mb-4 pb-4 border-b border-gray-200 bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-1">현재 편집 중인 도면</p>
              <p className="text-sm font-bold text-gray-800">{buildingInfo.buildingName}</p>
              <p className="text-sm font-semibold text-blue-600">
                {buildingInfo.floor > 0 ? `${buildingInfo.floor}층` : `지하${Math.abs(buildingInfo.floor)}층`}
              </p>
            </div>
          )}

        {/* 오브젝트 타입 선택 */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">추가할 오브젝트</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setObjectTypeToAdd('wall')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                objectTypeToAdd === 'wall' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              벽
            </button>
            <button
              onClick={() => setObjectTypeToAdd('zone')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                objectTypeToAdd === 'zone' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              구역
            </button>
            <button
              onClick={() => setObjectTypeToAdd('extinguisher')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                objectTypeToAdd === 'extinguisher' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              소화기
            </button>
            <button
              onClick={() => setObjectTypeToAdd('stairs')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                objectTypeToAdd === 'stairs' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              계단(비상구)
            </button>
            <button
              onClick={() => setObjectTypeToAdd('elevator')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                objectTypeToAdd === 'elevator' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              엘리베이터
            </button>
            <button
              onClick={() => setObjectTypeToAdd('firehydrant')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                objectTypeToAdd === 'firehydrant' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              소화전
            </button>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mb-4 space-y-2">
          <button
            onClick={addObject}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + 오브젝트 추가
          </button>
          {selectedObjectId && (
            <button
              onClick={deleteObject}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              선택된 오브젝트 삭제
            </button>
          )}
        </div>

        {/* 선택된 오브젝트 편집 */}
        {selectedObject && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              선택된 {selectedObject.type === 'wall' ? '벽' : selectedObject.type === 'zone' ? '구역' : selectedObject.type === 'extinguisher' ? '소화기' : selectedObject.type === 'stairs' ? '계단' : selectedObject.type === 'elevator' ? '엘리베이터' : '소화전'} 편집
            </h3>
            
            {/* 위치 */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">위치</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500">X</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedObject.position[0]}
                    onChange={(e) => updateSelectedObject({
                      position: [parseFloat(e.target.value), selectedObject.position[1], selectedObject.position[2]]
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Y</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObject.position[1]}
                    onChange={(e) => updateSelectedObject({
                      position: [selectedObject.position[0], parseFloat(e.target.value), selectedObject.position[2]]
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Z</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedObject.position[2]}
                    onChange={(e) => updateSelectedObject({
                      position: [selectedObject.position[0], selectedObject.position[1], parseFloat(e.target.value)]
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 크기 */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">크기</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500">
                    {selectedObject.type === 'stairs' ? '너비' : '폭'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObject.size[0]}
                    onChange={(e) => updateSelectedObject({
                      size: [parseFloat(e.target.value), selectedObject.size[1], selectedObject.size[2]]
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  {selectedObject.type === 'stairs' && (
                    <p className="text-xs text-gray-400 mt-1">각 계단의 너비 (간격은 자동 계산)</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500">높이</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObject.size[1]}
                    onChange={(e) => updateSelectedObject({
                      size: [selectedObject.size[0], parseFloat(e.target.value), selectedObject.size[2]]
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">깊이</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedObject.size[2]}
                    onChange={(e) => updateSelectedObject({
                      size: [selectedObject.size[0], selectedObject.size[1], parseFloat(e.target.value)]
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 회전 */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">회전 (Y축)</p>
              <input
                type="number"
                step="15"
                value={((selectedObject.rotation?.[1] || 0) * 180 / Math.PI).toFixed(0)}
                onChange={(e) => {
                  const degrees = parseFloat(e.target.value);
                  const radians = degrees * Math.PI / 180;
                  updateSelectedObject({
                    rotation: [0, radians, 0]
                  });
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">각도 (0-360°)</p>
            </div>
          </div>
        )}

        {/* 오브젝트 목록 */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">오브젝트 목록</h3>
          <div className="space-y-2">
            {objects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => setSelectedObjectId(obj.id)}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  obj.id === selectedObjectId
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <p className="text-sm font-medium text-gray-800">
                  {obj.type === 'wall' ? '벽' : obj.type === 'zone' ? '구역' : obj.type === 'extinguisher' ? '소화기' : obj.type === 'stairs' ? '계단' : obj.type === 'elevator' ? '엘리베이터' : '소화전'} - {obj.id}
                </p>
                <p className="text-xs text-gray-500">
                  위치: ({obj.position[0].toFixed(1)}, {obj.position[2].toFixed(1)})
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 저장 */}
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
          <button
            onClick={() => {
              if (onSave) {
                onSave(objects);
              } else {
                const data = JSON.stringify(objects, null, 2);
                console.log('저장된 데이터:', data);
                toast.success('콘솔에 데이터가 출력되었습니다.');
              }
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            도면 저장하기
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

