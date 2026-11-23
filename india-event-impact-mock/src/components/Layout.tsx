import { ReactNode } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { DemoBanner } from './DemoBanner';
import { MacroTicker } from './MacroTicker';
import { MobileTabBar } from './MobileTabBar';
import { Footer } from './Footer';

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Demo Banner - sticky, dismissible per session */}
      <DemoBanner />

      {/* Top Bar */}
      <TopBar />

      {/* Macro Ticker Strip */}
      <MacroTicker />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Tab Bar */}
      <MobileTabBar currentPath={location.pathname} />
    </div>
  );
}