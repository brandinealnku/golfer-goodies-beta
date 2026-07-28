import { NavLink, Outlet } from 'react-router-dom';
import { environment } from '../config/environment';
import { useCourseContext } from '../state/course-context';
import { useCart } from '../state/cart';
import { demoCourses } from '../data/demo-data';
import { formatUsd } from '../utils/format';

const Icon = ({ children }: { children: string }) => (
  <span aria-hidden="true">{children}</span>
);
export function DesktopAppBar() {
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
        <NavLink to={course ? `/course/${course.id}` : '/discover'}>
          {course ? 'Course' : 'Discover'}
        </NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <NavLink to="/account">Account</NavLink>
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
        <p>Local demonstration only · No payment will be charged.</p>
      </footer>
    </>
  );
}
export const GolferLayout = AppShell;
const Workspace = ({ name }: { name: string }) => (
  <>
    <header className="site-header">
      <a className="brand" href="#/discover">
        Golfer Goodies
      </a>
      <strong>{name}</strong>
    </header>
    <main id="main-content">
      <Outlet />
    </main>
  </>
);
export const PartnerLayout = () => <Workspace name="Partner workspace" />;
export const PlatformLayout = () => <Workspace name="Platform workspace" />;
