import { Zone } from '../types/zone';

interface ZonePopupProps {
  zone: Zone;
  zoneName: string;
  onClose: () => void;
}

/**
 * 구역 상태 정보를 보여주는 팝업
 */
export default function ZonePopup({ zone, zoneName, onClose }: ZonePopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{zoneName} 상태 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 구역 ID */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">구역 ID</p>
          <p className="text-base font-semibold text-gray-800">{zone.zoneId}</p>
        </div>

        {/* 화재/연기 정보 */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">화재 강도</span>
              <span className="text-sm font-bold text-red-600">{(zone.fireLevel * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${zone.fireLevel * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">연기 농도</span>
              <span className="text-sm font-bold text-orange-600">{(zone.smokeLevel * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${zone.smokeLevel * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 위험 상태 */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">위험 상태</p>
          <div className="flex items-center gap-2">
            {zone.knife ? (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                ⚠️ 칼부림 발생
              </span>
            ) : (
              (zone.fireLevel > 0 || zone.smokeLevel > 0) ? (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                  🔥 화재/연기
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                  ✅ 정상
                </span>
              )
            )}
          </div>
        </div>

        {/* 혼잡도 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">혼잡도</span>
            <span className="text-sm font-bold text-blue-600">{zone.people_cnt}명</span>
          </div>
        </div>

        {/* 시설 정보 */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">시설 정보</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${zone.extinguisher ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">소화기</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${zone.stair ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">계단</span>
            </div>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

