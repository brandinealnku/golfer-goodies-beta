import { NavLink, Outlet } from 'react-router-dom';
import { EnvironmentBadge } from '../components/ui';
const Nav = ({
  label,
  items,
}: {
  label: string;
  items: [string, string][];
}) => (
  <nav aria-label={label}>
    <ul>
      {items.map(([name, to]) => (
        <li key={name}>
          <NavLink to={to}>{name}</NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
const Shell = ({
  role,
  items,
}: {
  role: string;
  items: [string, string][];
}) => (
  <>
    <a className="skip-link" href="#main-content">
      Skip to main content
    </a>
    <header className="site-header">
      <a className="brand" href="#/discover">
        Golfer Goodies
      </a>
      <EnvironmentBadge />
      <Nav label={`${role} navigation`} items={items} />
    </header>
    <main id="main-content">
      <Outlet />
    </main>
    <footer>
      <p>Fictional demo data. No orders or payments are processed.</p>
    </footer>
  </>
);
export const GolferLayout = () => (
  <Shell
    role="Golfer"
    items={[
      ['Discover', '/discover'],
      ['Order', '/cart'],
      ['Track', '/order/demo-order'],
      ['Account', '/account'],
    ]}
  />
);
export const PartnerLayout = () => (
  <Shell
    role="Partner"
    items={[
      ['Overview', '/partner'],
      ['Orders', '/partner/orders'],
      ['Storefront', '/partner/storefront'],
      ['Menu', '/partner/menu'],
      ['Fulfillment', '/partner/fulfillment'],
      ['Promotions', '/partner/promotions'],
      ['Analytics', '/partner/analytics'],
      ['Team', '/partner/team'],
      ['Settings', '/partner/settings'],
    ]}
  />
);
export const PlatformLayout = () => (
  <Shell
    role="Platform"
    items={[
      ['Marketplace', '/platform'],
      ['Courses', '/platform/courses'],
      ['Applications', '/platform/applications'],
      ['Promotions', '/platform/promotions'],
      ['Support', '/platform/support'],
      ['Reports', '/platform/reports'],
      ['Settings', '/platform/settings'],
    ]}
  />
);
