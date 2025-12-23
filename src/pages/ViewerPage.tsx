import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import F2Scene from '../components/F2Scene';
import { getAllBuildings, getBuildingFloors, loadFloorPlan, FloorPlanData } from '../lib/firebase';

/**
 * 사용자 뷰어 페이지 - 대피 경로 안내
 */
export default function ViewerPage() {
  const [buildings, setBuildings] = useState<string[]>([]);
  const [currentBuilding, setCurrentBuilding] = useState<string>('');
  const [floors, setFloors] = useState<number[]>([]);
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [currentZone, setCurrentZone] = useState<string>('선택 안됨');
  const [floorPlanData, setFloorPlanData] = useState<FloorPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 건물 목록 불러오기
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const buildingList = await getAllBuildings();
        setBuildings(buildingList);
        if (buildingList.length > 0) {
          setCurrentBuilding(buildingList[0]);
        }
      } catch (error) {
        console.error('건물 목록 불러오기 실패:', error);
        toast.error('건물 목록을 불러올 수 없습니다.');
      }
    };
    fetchBuildings();
  }, []);

  // 선택된 건물의 층 목록 불러오기
  useEffect(() => {
    if (!currentBuilding) return;

    const fetchFloors = async () => {
      try {
        const floorList = await getBuildingFloors(currentBuilding);
        setFloors(floorList);
        if (floorList.length > 0) {
          setCurrentFloor(floorList[0]);
        } else {
          setCurrentFloor(1);
        }
      } catch (error) {
        console.error('층 목록 불러오기 실패:', error);
        toast.error('층 목록을 불러올 수 없습니다.');
      }
    };
    fetchFloors();
  }, [currentBuilding]);

  // 건물/층이 변경될 때 도면 불러오기
  useEffect(() => {
    if (!currentBuilding || !currentFloor) return;

    const loadFloorPlanData = async () => {
      try {
        setIsLoading(true);
        const data = await loadFloorPlan(currentBuilding, currentFloor);
        if (data) {
          setFloorPlanData(data);
          console.log('도면 불러오기 성공:', data);
        } else {
          setFloorPlanData(null);
          toast.error('해당 도면을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('도면 불러오기 실패:', error);
        toast.error('도면을 불러올 수 없습니다.');
        setFloorPlanData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFloorPlanData();
  }, [currentBuilding, currentFloor]);

  return (
    <div className="w-full h-screen bg-gray-100 text-black relative flex flex-col">
      {/* 상단바 */}
      <div className="w-full bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 shadow-sm z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          {/* 로고 */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">D</span>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">DAPPY</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">재난 대응 가이드</p>
            </div>
          </div>

          {/* 중앙: 건물 선택, 층 선택 및 현재 위치 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* 건물 선택 */}
            <div className="flex items-center gap-1 sm:gap-2">
              <label htmlFor="building-select" className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                건물:
              </label>
              <select
                id="building-select"
                value={currentBuilding}
                onChange={(e) => setCurrentBuilding(e.target.value)}
                disabled={isLoading || buildings.length === 0}
                className="px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] sm:min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buildings.length === 0 ? (
                  <option value="">저장된 건물 없음</option>
                ) : (
                  buildings.map((building) => (
                    <option key={building} value={building}>
                      {building}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* 층 선택 */}
            <div className="flex items-center gap-1 sm:gap-2">
              <label htmlFor="floor-select" className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                층:
              </label>
              <select
                id="floor-select"
                value={currentFloor}
                onChange={(e) => setCurrentFloor(parseInt(e.target.value))}
                disabled={isLoading || floors.length === 0}
                className="px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {floors.length === 0 ? (
                  <option value="">층 없음</option>
                ) : (
                  floors.map((floor) => (
                    <option key={floor} value={floor}>
                      {floor > 0 ? `${floor}층` : `지하${Math.abs(floor)}층`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* 현재 위치 */}
            <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial">
              <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:inline">
                현재 위치:
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap sm:hidden">
                위치:
              </span>
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-none">
                {currentZone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D 렌더링 공간 */}
      <div className="flex-1 w-full relative bg-gray-50">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">도면을 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <F2Scene 
            onZoneSelect={(zoneName) => setCurrentZone(zoneName)}
            floorPlanData={floorPlanData}
            currentZone={currentZone}
          />
        )}
      </div>
    </div>
  );
}

