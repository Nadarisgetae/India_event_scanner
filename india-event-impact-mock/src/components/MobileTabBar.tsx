import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Building2, FileText, Grid, MoreHorizontal } from 'lucide-react';

const mainTabs = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/market', label: 'Market', icon: TrendingUp },
  { path: '/company', label: 'Company', icon: Building2 },
  { path: '/reports', label: 'Reports', icon: FileText },
];

const moreItems = [
  { path: '/knowledge/sectors', label: 'Sector Matrix', icon: Grid },
  { path: '/settings', label: 'Settings', icon: MoreHorizontal },
  { path: '/help', label: 'Help', icon: MoreHorizontal },
];

interface MobileTabBarProps {
  currentPath: string;
}

export function MobileTabBar({ currentPath }: MobileTabBarProps) {
  const isMainTab = mainTabs.some(t => currentPath.startsWith(t.path));

  return (
    <nav
      className="no-print fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface border-t border-border"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="grid grid-cols-4">
        {mainTabs.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-2.5 transition-colors ${
                isActive
                  ? 'text-brand'
                  : 'text-text-muted active:text-text'
              }`
            }
            aria-current={currentPath === path ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
        {/* More menu - simplified for now, just links to knowledge */}
        <NavLink
          to="/knowledge/sectors"
          className="flex flex-col items-center gap-1 px-2 py-2.5 text-text-muted active:text-text transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-medium">More</span>
        </NavLink>
      </div>
    </nav>
  );
}