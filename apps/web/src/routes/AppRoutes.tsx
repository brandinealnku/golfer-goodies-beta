import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CoursePage } from '../features/courses/CoursePage';
import { DiscoverPage } from '../features/marketplace/DiscoverPage';
import { ExternalCoursePage } from '../features/marketplace/ExternalCoursePage';
import { PlaceholderPage } from '../features/PlaceholderPage';
import { CartPage } from '../features/cart/CartPage';
import { OrdersPage } from '../features/orders/OrdersPage';
import { OrderTrackingPage } from '../features/orders/OrderTrackingPage';
import { AccountPage } from '../features/account/AccountPage';
import {
  CourseManagementPage,
  ManageIndex,
} from '../features/management/ManagementPages';
const EmulatorDiagnosticsPage = lazy(() =>
  import('../features/development/EmulatorDiagnosticsPage').then((module) => ({
    default: module.EmulatorDiagnosticsPage,
  })),
);
import {
  GolferLayout,
  PartnerLayout,
  PlatformLayout,
} from '../layouts/Layouts';
const P = ({ title }: { title: string }) => (
  <PlaceholderPage
    title={title}
    phase={`${title} workflows are planned for a future implementation phase.`}
  />
);
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GolferLayout />}>
        <Route path="/" element={<Navigate to="/discover" replace />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route
          path="/discover/course/:placeId"
          element={<ExternalCoursePage />}
        />
        <Route
          path="/dev/emulators"
          element={
            <Suspense
              fallback={<p role="status">Loading local diagnostics…</p>}
            >
              <EmulatorDiagnosticsPage />
            </Suspense>
          }
        />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order/:orderId" element={<OrderTrackingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/manage" element={<ManageIndex />} />
        <Route
          path="/manage/course/:courseId"
          element={<CourseManagementPage />}
        />
        <Route
          path="/manage/course/:courseId/products"
          element={<CourseManagementPage />}
        />
        <Route
          path="/manage/course/:courseId/settings"
          element={<CourseManagementPage />}
        />
        {[
          ['recent', 'Recent courses'],
          ['rewards', 'Rewards'],
          ['demo', 'Demo guide'],
        ].map(([path, title]) => (
          <Route key={path} path={path} element={<P title={title} />} />
        ))}
      </Route>
      <Route path="/partner" element={<PartnerLayout />}>
        <Route index element={<P title="Partner overview" />} />
        {[
          ['orders', 'Staff orders'],
          ['menu', 'Menu management'],
          ['fulfillment', 'Fulfillment management'],
          ['promotions', 'Promotions'],
          ['analytics', 'Analytics'],
        ].map(([path, title]) => (
          <Route key={path} path={path} element={<P title={title} />} />
        ))}
        <Route path="*" element={<P title="Partner workspace" />} />
      </Route>
      <Route path="/platform" element={<PlatformLayout />}>
        <Route index element={<P title="Platform overview" />} />
        <Route path="courses" element={<P title="Platform courses" />} />
        <Route
          path="applications"
          element={<P title="Course applications" />}
        />
        <Route path="*" element={<P title="Platform workspace" />} />
      </Route>
      <Route
        path="*"
        element={
          <div className="page">
            <h1>Page not found</h1>
            <p>The route does not exist in this demo foundation.</p>
            <a className="button" href="#/discover">
              Return to Discover
            </a>
          </div>
        }
      />
    </Routes>
  );
}
