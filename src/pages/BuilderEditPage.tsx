import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import BuilderScene from '../components/BuilderScene';
import { getAllBuildings, getBuildingFloors, loadFloorPlan, updateFloorPlan } from '../lib/firebase';

/**
 * 도면 편집 페이지
 */
export default function BuilderEditPage() {
  const navigate = useNavigate();
  const [showLoadModal, setShowLoadModal] = useState(true);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [floors, setFloors] = useState<number[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [loadedObjects, setLoadedObjects] = useState<any[] | null>(null);
  const [loadedBuildingInfo, setLoadedBuildingInfo] = useState<{ buildingName: string; floor: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 편집 후 저장
  const handleSave = async (objects: any[]) => {
    if (!loadedBuildingInfo) {
      toast.error('도면을 먼저 불러와주세요.');
      return;
    }

    try {
      await updateFloorPlan(loadedBuildingInfo.buildingName, loadedBuildingInfo.floor, objects);
      toast.success('도면이 업데이트되었습니다!');
      
      // 1초 후 빌더 인트로로 리다이렉트
      setTimeout(() => {
        navigate({ to: '/builder' });
      }, 1000);
    } catch (error) {
      toast.error('업데이트에 실패했습니다.');
      console.error('업데이트 실패:', error);
    }
  };

  // 건물 목록 불러오기
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const buildingList = await getAllBuildings();
        setBuildings(buildingList);
        if (buildingList.length > 0) {
          setSelectedBuilding(buildingList[0]);
        }
      } catch (error) {
        console.error('건물 목록 불러오기 실패:', error);
      }
    };
    fetchBuildings();
  }, []);

  // 선택된 건물의 층 목록 불러오기
  useEffect(() => {
    if (!selectedBuilding) return;

    const fetchFloors = async () => {
      try {
        const floorList = await getBuildingFloors(selectedBuilding);
        setFloors(floorList);
        if (floorList.length > 0) {
          setSelectedFloor(floorList[0]);
        }
      } catch (error) {
        console.error('층 목록 불러오기 실패:', error);
      }
    };
    fetchFloors();
  }, [selectedBuilding]);

  const handleLoad = async () => {
    if (!selectedBuilding) {
      toast.error('건물을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const floorPlan = await loadFloorPlan(selectedBuilding, selectedFloor);
      
      if (floorPlan) {
        setLoadedObjects(floorPlan.objects);
        setLoadedBuildingInfo({ buildingName: selectedBuilding, floor: selectedFloor });
        setShowLoadModal(false);
        console.log('불러온 도면:', floorPlan);
        toast.success('도면을 불러왔습니다!');
      } else {
        toast.error('해당 도면을 찾을 수 없습니다.');
      }
    } catch (error) {
      toast.error('불러오기에 실패했습니다. Firebase 설정을 확인해주세요.');
      console.error('불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 relative">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate({ to: '/builder' })}
        className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg hover:bg-white transition-all flex items-center gap-2"
      >
        <span className="text-xl">←</span>
        <span className="text-sm font-medium">돌아가기</span>
      </button>

      {/* BuilderScene */}
      <BuilderScene 
        initialObjects={loadedObjects}
        buildingInfo={loadedBuildingInfo}
        onSave={handleSave}
      />

      {/* 불러오기 모달 */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">도면 불러오기</h3>
            
            {buildings.length === 0 ? (
              <p className="text-sm text-gray-600 mb-4">
                저장된 건물이 없습니다.
              </p>
            ) : (
              <>
                {/* 건물 선택 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    건물 선택
                  </label>
                  <select 
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {buildings.map(building => (
                      <option key={building} value={building}>{building}</option>
                    ))}
                  </select>
                </div>

                {/* 층 선택 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    층 선택
                  </label>
                  <select 
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {floors.map(floor => (
                      <option key={floor} value={floor}>
                        {floor > 0 ? `${floor}층` : `지하${Math.abs(floor)}층`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-2">
              {buildings.length > 0 && (
                <button
                  onClick={handleLoad}
                  disabled={isLoading}
                  className={`flex-1 py-2 text-white rounded-lg transition-colors ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? '불러오는 중...' : '불러오기'}
                </button>
              )}
              <button
                onClick={() => navigate({ to: '/builder' })}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

