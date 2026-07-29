import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { environment } from '../config/environment';
import { useCourseContext } from '../state/course-context';
import { useCart } from '../state/cart';
import { demoCourses } from '../data/demo-data';
import { formatUsd } from '../utils/format';
import { useIdentity } from '../auth/IdentityContext';
import { hasCapability } from '../auth/authorization';
import {
  partnerCoursePath,
  partnerNavigation,
  type PartnerDestination,
} from '../routes/partner-routes';

const Icon = ({ children }: { children: string }) => (
  <span aria-hidden="true">{children}</span>
);
export function DesktopAppBar() {
  const { state, memberships } = useIdentity();
  const { context } = useCourseContext();
  const { itemCount } = useCart();
  const course = context.selectedCourseId
    ? demoCourses.find((c) => c.id === context.selectedCourseId)
    : undefined;
  return (
    <header className="desktop-app-bar">
      <NavLink className="brand" to="/discover">
        Golfer Goodies
      </NavLink>
      <nav aria-label="Main navigation">
        <NavLink to="/discover">Find a Course</NavLink>
        <NavLink to="/discover">How It Works</NavLink>
        <NavLink to="/partner">For Golf Courses</NavLink>
        <NavLink to="/demo">Demo Guide</NavLink>
        <NavLink to={course ? `/course/${course.id}` : '/discover'}>
          {course ? 'Course' : 'Discover'}
        </NavLink>
        <NavLink to="/orders">Orders</NavLink>
        {memberships.some((m) =>
          hasCapability(m, 'view_management_workspace'),
        ) && <NavLink to="/manage">Manage</NavLink>}
        <NavLink to="/account">
          {state.status === 'signed_in'
            ? state.user.displayName.split(' ')[0]
            : 'Account'}
        </NavLink>
      </nav>
      <NavLink
        className="cart-button"
        to="/cart"
        aria-label={`Cart, ${itemCount} items`}
      >
        Cart <strong>{itemCount}</strong>
      </NavLink>
    </header>
  );
}
export function MobileAppBar() {
  const { context } = useCourseContext();
  const { itemCount } = useCart();
  return (
    <header className="mobile-app-bar">
      <NavLink className="brand" to="/discover">
        GG
      </NavLink>
      {context.selectedCourseId && (
        <NavLink
          className="course-shortcut"
          to={`/course/${context.selectedCourseId}`}
        >
          Your course
        </NavLink>
      )}
      <NavLink
        className="icon-link"
        to="/cart"
        aria-label={`Cart, ${itemCount} items`}
      >
        <Icon>▣</Icon>
        <b>{itemCount}</b>
      </NavLink>
      <NavLink className="icon-link" to="/account" aria-label="Account">
        <Icon>●</Icon>
      </NavLink>
    </header>
  );
}
export function MobileBottomNav() {
  const { memberships } = useIdentity();
  const { context } = useCourseContext();
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <NavLink to="/discover">
        <Icon>⌂</Icon>Home
      </NavLink>
      <NavLink
        to={
          context.selectedCourseId
            ? `/course/${context.selectedCourseId}`
            : '/discover'
        }
      >
        <Icon>⚑</Icon>
        {context.selectedCourseId ? 'Course' : 'Courses'}
      </NavLink>
      <NavLink to="/orders">
        <Icon>≡</Icon>Orders
      </NavLink>
      <NavLink to="/account">
        <Icon>●</Icon>Account
      </NavLink>
      {memberships.some((m) =>
        hasCapability(m, 'view_management_workspace'),
      ) && (
        <NavLink to="/manage">
          <Icon>⚙</Icon>Manage
        </NavLink>
      )}
    </nav>
  );
}
export function CourseContextBar() {
  const { context, endOrderingSession } = useCourseContext();
  if (!context.selectedCourseId) return null;
  const course = demoCourses.find((c) => c.id === context.selectedCourseId);
  if (!course) return null;
  return (
    <aside className="course-context-bar" aria-label="Current course">
      <strong>
        {context.mode === 'ordering_session'
          ? `Ordering unlocked at ${course.name}`
          : `${course.name} · Browse menu`}
      </strong>
      <span>
        {context.mode === 'ordering_session'
          ? 'Ordering Session · up to 2 hours remaining'
          : 'Verify when you’re ready to add an item'}
      </span>
      {context.mode === 'ordering_session' && (
        <button
          type="button"
          className="link-button"
          onClick={endOrderingSession}
        >
          End ordering session
        </button>
      )}
    </aside>
  );
}
export function FloatingCartBar() {
  const { itemCount, subtotalCents } = useCart();
  if (!itemCount) return null;
  return (
    <NavLink className="floating-cart" to="/cart">
      <span>
        <strong>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </strong>
        <small>{formatUsd(subtotalCents)}</small>
      </span>
      <b>View cart →</b>
    </NavLink>
  );
}
export function ToastRegion() {
  const cart = useCart();
  const course = useCourseContext();
  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {cart.announcement || course.announcement}
    </div>
  );
}
export function OfflineBanner() {
  return (
    <div className="offline-banner" hidden={navigator.onLine} role="status">
      You’re offline. Saved demo browsing and orders remain available.
    </div>
  );
}
export function DemoIndicator() {
  return environment.mode !== 'connected' ? (
    <span className="demo-indicator">Demo · no real orders</span>
  ) : null;
}
export function AppShell() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <OfflineBanner />
      <DesktopAppBar />
      <MobileAppBar />
      <DemoIndicator />
      <CourseContextBar />
      <main id="main-content">
        <Outlet />
      </main>
      <FloatingCartBar />
      <MobileBottomNav />
      <ToastRegion />
      <footer>
        <nav aria-label="Footer navigation">
          <NavLink to="/discover">About</NavLink>
          <NavLink to="/discover">Find a Course</NavLink>
          <NavLink to="/discover">How It Works</NavLink>
          <NavLink to="/partner">Course Partner Portal</NavLink>
          <NavLink to="/partner/join">Start Demo Application</NavLink>
          <NavLink to="/demo">Demo Guide</NavLink>
          <NavLink to="/account">Account</NavLink>
          <NavLink to="/platform">Platform Admin Demo</NavLink>
          <NavLink to="/demo">Privacy &amp; demo terms</NavLink>
          <a href="mailto:demo@example.com">Contact placeholder</a>
        </nav>
        <p>Local demonstration only · No payment will be charged.</p>
      </footer>
    </>
  );
}
export const GolferLayout = AppShell;
const platformItems = [
  'Overview',
  'Courses',
  'Applications',
  'Users',
  'Orders',
  'Payments',
  'Disputes',
  'Moderation',
  'Reports',
  'Platform Settings',
  'Audit Log',
];
const Workspace = ({
  portal,
  items,
  base,
  courseId,
}: {
  portal: string;
  items: string[];
  base: string;
  courseId?: string;
}) => (
  <div className={`workspace workspace-${base}`}>
    <a className="skip-link" href="#main-content">
      Skip to main content
    </a>
    <header className="workspace-header">
      <a className="brand" href="#/discover">
        Golfer Goodies
      </a>
      <strong>{portal}</strong>
      <DemoIndicator />
    </header>
    <aside className="workspace-sidebar">
      <nav aria-label={`${portal} navigation`}>
        {items.map((label) => {
          const segment =
            label === 'Overview'
              ? ''
              : label
                  .toLowerCase()
                  .replaceAll(' ', '-')
                  .replace('platform-', '')
                  .replace('audit-log', 'audit');
          const root = courseId ? `/${base}/course/${courseId}` : `/${base}`;
          return (
            <NavLink
              key={label}
              end={!segment}
              to={segment ? `${root}/${segment}` : root}
            >
              {label}
            </NavLink>
          );
        })}
      </nav>
      <a href="#/discover" className="workspace-exit">
        Return to golfer marketplace
      </a>
    </aside>
    <main id="main-content">
      <Outlet />
    </main>
  </div>
);
export const PartnerLayout = () => {
  const { state, memberships } = useIdentity();
  const { courseId: routeCourseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const active =
    state.status === 'signed_in'
      ? memberships.filter(
          (membership) =>
            membership.status === 'active' &&
            hasCapability(membership, 'view_partner_portal'),
        )
      : [];
  const courseId = active.some(
    (membership) => membership.courseId === routeCourseId,
  )
    ? routeCourseId
    : active[0]?.courseId;
  const course = demoCourses.find((item) => item.id === courseId);
  const current = location.pathname.split('/').at(-1) ?? '';
  const destination: PartnerDestination =
    current === courseId
      ? ''
      : partnerNavigation.some((item) => item.destination === current)
        ? (current as PartnerDestination)
        : '';
  return (
    <div className="workspace workspace-partner">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="workspace-header">
        <a className="brand" href="#/discover">
          Golfer Goodies
        </a>
        <strong>Course Partner</strong>
        <DemoIndicator />
      </header>
      <aside className="workspace-sidebar">
        {courseId ? (
          <>
            <p>
              <strong>{course?.name ?? courseId}</strong>
            </p>
            {active.length > 1 && (
              <label>
                Current course
                <select
                  value={courseId}
                  onChange={(event) =>
                    navigate(partnerCoursePath(event.target.value, destination))
                  }
                >
                  {active.map((membership) => (
                    <option
                      key={membership.courseId}
                      value={membership.courseId}
                    >
                      {demoCourses.find(
                        (item) => item.id === membership.courseId,
                      )?.name ?? membership.courseId}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <nav aria-label="Course Partner navigation">
              {partnerNavigation.map((item) => (
                <NavLink
                  key={item.label}
                  end={!item.destination}
                  to={partnerCoursePath(courseId, item.destination)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </>
        ) : (
          <nav aria-label="Course Partner navigation">
            <NavLink end to="/partner">
              Partner Home
            </NavLink>
            <NavLink to="/partner/join">Join the Platform</NavLink>
            <NavLink to="/partner/claim">Claim a Course</NavLink>
            <NavLink to="/account">Choose Demo Identity</NavLink>
            <NavLink to="/discover">Return to Golfer Marketplace</NavLink>
          </nav>
        )}
        <a href="#/discover" className="workspace-exit">
          Return to golfer marketplace
        </a>
      </aside>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
};
export const PlatformLayout = () => (
  <Workspace
    portal="Platform Administration"
    items={platformItems}
    base="platform"
  />
);
