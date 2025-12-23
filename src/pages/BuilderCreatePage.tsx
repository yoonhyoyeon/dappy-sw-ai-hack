import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import BuilderScene from '../components/BuilderScene';
import { saveFloorPlan, getAllBuildings, getBuildingFloors } from '../lib/firebase';

/**
 * 도면 생성 페이지
 */
export default function BuilderCreatePage() {
  const navigate = useNavigate();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveOption, setSaveOption] = useState<'new' | 'existing'>('new');
  const [newBuildingName, setNewBuildingName] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [existingBuildings, setExistingBuildings] = useState<string[]>([]);
  const [existingBuilding, setExistingBuilding] = useState('');
  const [existingFloors, setExistingFloors] = useState<number[]>([]);
  const [existingFloor, setExistingFloor] = useState(1);
  const [objectsToSave, setObjectsToSave] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // "기존 건물에 추가" 선택 시 건물 목록 불러오기
  useEffect(() => {
    if (saveOption === 'existing' && showSaveModal) {
      const fetchBuildings = async () => {
        try {
          const buildings = await getAllBuildings();
          setExistingBuildings(buildings);
          if (buildings.length > 0) {
            setExistingBuilding(buildings[0]);
          }
        } catch (error) {
          console.error('건물 목록 불러오기 실패:', error);
        }
      };
      fetchBuildings();
    }
  }, [saveOption, showSaveModal]);

  // 선택된 건물의 층 목록 불러오기
  useEffect(() => {
    if (existingBuilding && saveOption === 'existing') {
      const fetchFloors = async () => {
        try {
          const floors = await getBuildingFloors(existingBuilding);
          setExistingFloors(floors);
        } catch (error) {
          console.error('층 목록 불러오기 실패:', error);
        }
      };
      fetchFloors();
    }
  }, [existingBuilding, saveOption]);

  const handleSaveClick = (objects: any) => {
    console.log('저장할 오브젝트 데이터:', objects);
    setObjectsToSave(objects);
    setShowSaveModal(true);
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const buildingName = saveOption === 'new' ? newBuildingName : existingBuilding;
      const floor = saveOption === 'new' ? newFloor : existingFloor;

      if (saveOption === 'new' && !newBuildingName.trim()) {
        toast.error('건물 이름을 입력해주세요.');
        setIsSaving(false);
        return;
      }

      // Firebase에 저장
      await saveFloorPlan(buildingName, floor, objectsToSave);
      
      const floorText = floor > 0 ? `${floor}층` : `지하${Math.abs(floor)}층`;
      toast.success(`${buildingName} ${floorText}에 저장되었습니다!`);
      setShowSaveModal(false);
      
      // 1초 후 빌더 인트로로 리다이렉트
      setTimeout(() => {
        navigate({ to: '/builder' });
      }, 1000);
    } catch (error: any) {
      if (error.message && error.message.includes('이미')) {
        toast.error(error.message);
      } else {
        toast.error('저장에 실패했습니다. Firebase 설정을 확인해주세요.');
        console.error('저장 실패:', error);
      }
    } finally {
      setIsSaving(false);
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
      <BuilderScene onSave={handleSaveClick} />

      {/* 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">도면 저장</h3>
            
            {/* 저장 옵션 선택 */}
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSaveOption('new')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    saveOption === 'new'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  새 건물 생성
                </button>
                <button
                  onClick={() => setSaveOption('existing')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    saveOption === 'existing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  기존 건물에 추가
                </button>
              </div>
            </div>

            {/* 새 건물 생성 */}
            {saveOption === 'new' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    건물 이름
                  </label>
                  <input
                    type="text"
                    value={newBuildingName}
                    onChange={(e) => setNewBuildingName(e.target.value)}
                    placeholder="예: 광개토관"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    층 (음수는 지하)
                  </label>
                  <input
                    type="number"
                    value={newFloor}
                    onChange={(e) => setNewFloor(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newFloor > 0 ? `${newFloor}층` : newFloor < 0 ? `지하${Math.abs(newFloor)}층` : '0층'}
                  </p>
                </div>
              </div>
            )}

            {/* 기존 건물에 추가 */}
            {saveOption === 'existing' && (
              <div className="space-y-3">
                {existingBuildings.length === 0 ? (
                  <p className="text-sm text-gray-600 py-4 text-center">
                    저장된 건물이 없습니다.<br />
                    "새 건물 생성"을 선택해주세요.
                  </p>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        건물 선택
                      </label>
                      <select 
                        value={existingBuilding}
                        onChange={(e) => setExistingBuilding(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {existingBuildings.map(building => (
                          <option key={building} value={building}>{building}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        층 (음수는 지하)
                      </label>
                      <input
                        type="number"
                        value={existingFloor}
                        onChange={(e) => setExistingFloor(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {existingFloor > 0 ? `${existingFloor}층` : existingFloor < 0 ? `지하${Math.abs(existingFloor)}층` : '0층'}
                      </p>
                      {existingFloors.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          기존 층: {existingFloors.map(f => f > 0 ? `${f}층` : `지하${Math.abs(f)}층`).join(', ')}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 py-2 text-white rounded-lg font-medium transition-colors ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                disabled={isSaving}
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

