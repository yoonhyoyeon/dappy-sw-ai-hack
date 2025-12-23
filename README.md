# DAPPY - 재난 대응 가이드 시스템

캠퍼스 건물 내부 재난 상황에서 사용자를 안전 지역으로 안내하기 위한 실시간 재난 대응 가이드 시스템입니다.

## 기술 스택

- **React** + **TypeScript** + **Vite**
- **TailwindCSS** - 스타일링
- **Three.js** + **@react-three/fiber** + **@react-three/drei** - 3D 도면 렌더링
- **PWA** - 모바일 앱 형태 제공

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 미리보기

```bash
npm run preview
```

## 환경 변수

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```
VITE_AI_SERVER_URL=http://localhost:8000
```

## 프로젝트 구조

```
src/
├── components/      # React 컴포넌트
├── hooks/           # 커스텀 훅
├── types/           # TypeScript 타입 정의
├── utils/           # 유틸리티 함수
├── App.tsx          # 메인 앱 컴포넌트
├── main.tsx         # 진입점
└── index.css        # 글로벌 스타일
```

## 주요 기능

- 3D 도면 기반 Zone 시각화
- 실시간 재난 상황 모니터링 (1초 주기 polling)
- 동적 대피 경로 안내
- 초기 진압 가능 여부 판단
- PWA 지원 (모바일 앱 설치 가능)

## 개발 명세서

자세한 개발 명세는 `개발명세서.md` 파일을 참고하세요.

