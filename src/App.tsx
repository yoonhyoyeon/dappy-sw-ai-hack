import { useState } from 'react'
import F2Scene from './components/F2Scene'
import BuilderScene from './components/BuilderScene'

type Floor = '1f' | '2f'
type Building = 'main' | 'library' | 'gym' | 'dormitory'
type Page = 'view' | 'builder'

const BUILDINGS = [
  { value: 'main', label: '광개토관' },
  { value: 'library', label: '집현관' },
  { value: 'gym', label: '대양ai' },
  { value: 'dormitory', label: '학술정보원' },
] as const

function App() {
  const [currentBuilding, setCurrentBuilding] = useState<Building>('main')
  const [currentFloor, setCurrentFloor] = useState<Floor>('1f')
  const [currentZone, setCurrentZone] = useState<string>('선택 안됨')
  const [currentPage, setCurrentPage] = useState<Page>('view')

  return (
    <div className="w-full h-full bg-gray-100 text-black relative flex flex-col">
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

          {/* 중앙: 페이지 전환, 건물 선택, 층 선택 및 현재 위치 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* 페이지 전환 */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage('view')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  currentPage === 'view'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                보기
              </button>
              <button
                onClick={() => setCurrentPage('builder')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  currentPage === 'builder'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                추가
              </button>
            </div>

            {currentPage === 'view' && (
              <>
            {/* 건물 선택 */}
            <div className="flex items-center gap-1 sm:gap-2">
              <label htmlFor="building-select" className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                건물:
              </label>
              <select
                id="building-select"
                value={currentBuilding}
                onChange={(e) => setCurrentBuilding(e.target.value as Building)}
                className="px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[80px] sm:min-w-[100px]"
              >
                {BUILDINGS.map((building) => (
                  <option key={building.value} value={building.value}>
                    {building.label}
                  </option>
                ))}
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
                onChange={(e) => setCurrentFloor(e.target.value as Floor)}
                className="px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1f">1층</option>
                <option value="2f">2층</option>
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
            </>
            )}
          </div>
        </div>
      </div>

      {/* 3D 렌더링 공간 */}
      <div className="flex-1 w-full relative bg-gray-50">
        {currentPage === 'view' ? (
          <F2Scene onZoneSelect={(zoneName) => setCurrentZone(zoneName)} />
        ) : (
          <BuilderScene />
        )}
      </div>
    </div>
  )
}

export default App

