import { lazy, Suspense } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
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
import {
  OnboardingPage,
  PartnerIndex,
  PartnerOrders,
  PartnerOverview,
  PartnerSection,
  PlatformDetail,
  PlatformOverview,
  PlatformSection,
  PlatformSettings,
} from '../features/marketplace-foundation/MarketplacePages';
import { useIdentity } from '../auth/IdentityContext';
import { hasCapability } from '../auth/authorization';
import {
  isPartnerSection,
  partnerCoursePath,
  partnerSections,
  type PartnerDestination,
} from './partner-routes';
const P = ({ title }: { title: string }) => (
  <PlaceholderPage
    title={title}
    phase={`${title} workflows are planned for a future implementation phase.`}
  />
);
const activePartnerMemberships = (
  memberships: ReturnType<typeof useIdentity>['memberships'],
) =>
  memberships.filter(
    (membership) =>
      membership.status === 'active' &&
      hasCapability(membership, 'view_partner_portal'),
  );
function PartnerAlias() {
  const { section = '' } = useParams();
  const { memberships } = useIdentity();
  const membership = activePartnerMemberships(memberships)[0];
  const destination =
    section === 'orders' || isPartnerSection(section)
      ? (section as PartnerDestination)
      : '';
  return (
    <Navigate
      replace
      to={
        membership
          ? partnerCoursePath(membership.courseId, destination)
          : '/partner'
      }
    />
  );
}
function PartnerCourseGuard() {
  const { courseId = '' } = useParams();
  const { state, memberships } = useIdentity();
  if (state.status === 'loading')
    return <p role="status">Loading partner access…</p>;
  const membership = activePartnerMemberships(memberships).find(
    (item) => item.courseId === courseId,
  );
  if (!membership)
    return (
      <div className="portal-page">
        <h1>Course access unavailable</h1>
        <p>
          This course is not part of your active course memberships. Platform
          roles do not grant course access.
        </p>
        <a className="button" href="#/partner">
          Return to Partner Home
        </a>
      </div>
    );
  return <Outlet />;
}
function PartnerUnknownSection() {
  const { courseId = '' } = useParams();
  return (
    <div className="portal-page">
      <h1>Partner section not available</h1>
      <p>This section is not part of the Course Partner demonstration.</p>
      <a className="button" href={`#${partnerCoursePath(courseId)}`}>
        Return to Overview
      </a>
    </div>
  );
}
function NotFound() {
  const location = useLocation();
  const safePath = location.pathname
    .slice(0, 120)
    .replace(/[^a-zA-Z0-9_\-/:]/g, '');
  return (
    <div className="page not-found">
      <h1>Page not found</h1>
      <p>
        The requested demo path <code>{safePath}</code> is not available.
      </p>
      <div className="button-row">
        <a className="button" href="#/discover">
          Find a Course
        </a>
        <a className="button secondary" href="#/discover">
          Return Home
        </a>
        <a className="button secondary" href="#/partner">
          Course Partner Portal
        </a>
        <a className="button secondary" href="#/account">
          Account
        </a>
      </div>
    </div>
  );
}
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
        <Route index element={<PartnerIndex />} />
        <Route path="join" element={<OnboardingPage />} />
        <Route path="claim" element={<OnboardingPage />} />
        <Route path="application/:applicationId" element={<OnboardingPage />} />
        <Route
          path="application/:applicationId/setup"
          element={<OnboardingPage />}
        />
        <Route
          path="application/:applicationId/preview"
          element={<OnboardingPage />}
        />
        <Route path=":section" element={<PartnerAlias />} />
        <Route path="course/:courseId" element={<PartnerCourseGuard />}>
          <Route index element={<PartnerOverview />} />
          <Route path="orders" element={<PartnerOrders />} />
          {partnerSections.map((section) => (
            <Route
              key={section}
              path={section}
              element={<PartnerSection section={section} />}
            />
          ))}
          <Route path="*" element={<PartnerUnknownSection />} />
        </Route>
      </Route>
      <Route path="/platform" element={<PlatformLayout />}>
        <Route index element={<PlatformOverview />} />
        <Route path="settings" element={<PlatformSettings />} />
        <Route path=":section" element={<PlatformSection />} />
        <Route path="courses/:courseId" element={<PlatformDetail />} />
        <Route
          path="applications/:applicationId"
          element={<PlatformDetail />}
        />
        <Route path="users/:userId" element={<PlatformDetail />} />
        <Route path="orders/:orderId" element={<PlatformDetail />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
