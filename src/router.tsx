import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import ViewerPage from './pages/ViewerPage';
import BuilderIntroPage from './pages/BuilderIntroPage';
import BuilderCreatePage from './pages/BuilderCreatePage';
import BuilderEditPage from './pages/BuilderEditPage';

// Root 라우트
const rootRoute = createRootRoute({
  component: () => (
    <div className="w-full h-screen">
      <Outlet />
    </div>
  ),
});

// 뷰어 페이지 라우트 (/)
const viewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ViewerPage,
});

// 빌더 인트로 페이지 라우트 (/builder)
const builderIntroRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/builder',
  component: BuilderIntroPage,
});

// 도면 생성 페이지 라우트 (/builder/create)
const builderCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/builder/create',
  component: BuilderCreatePage,
});

// 도면 편집 페이지 라우트 (/builder/edit)
const builderEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/builder/edit',
  component: BuilderEditPage,
});

// 라우트 트리 생성
const routeTree = rootRoute.addChildren([
  viewerRoute,
  builderIntroRoute,
  builderCreateRoute,
  builderEditRoute,
]);

// 라우터 생성
export const router = createRouter({ routeTree });

// 타입 선언
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

