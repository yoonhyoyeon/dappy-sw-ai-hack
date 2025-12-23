import { useNavigate } from '@tanstack/react-router';

/**
 * 빌더 인트로 페이지
 */
export default function BuilderIntroPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        {/* 로고 */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-3xl">D</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">DAPPY</h1>
            <p className="text-sm text-gray-500">건물 도면 생성 도구</p>
          </div>
        </div>

        {/* 설명 */}
        <p className="text-center text-gray-600 mb-8">
          건물의 3D 도면을 생성하거나 편집할 수 있습니다
        </p>

        {/* 버튼들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* 도면 생성하기 */}
          <button
            onClick={() => navigate({ to: '/builder/create' })}
            className="group aspect-square bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 flex flex-col items-center justify-center border-2 border-transparent hover:border-blue-500"
          >
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-4xl">+</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">도면 생성하기</h2>
            <p className="text-sm text-gray-500 text-center">
              빈 도면에서 새로운<br />건물 구조를 그립니다
            </p>
          </button>

          {/* 도면 편집하기 */}
          <button
            onClick={() => navigate({ to: '/builder/edit' })}
            className="group aspect-square bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 flex flex-col items-center justify-center border-2 border-transparent hover:border-blue-500"
          >
            <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-white text-4xl">✏️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">도면 편집하기</h2>
            <p className="text-sm text-gray-500 text-center">
              기존 건물 구조를<br />불러와서 편집합니다
            </p>
          </button>
        </div>

        {/* 안내 문구 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            키보드 단축키: 방향키(이동), 스페이스바(회전), 백스페이스(삭제)
          </p>
        </div>
      </div>
    </div>
  );
}

