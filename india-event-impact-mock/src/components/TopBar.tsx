import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Building2, ShieldAlert, FileText, BookOpen, HelpCircle, Sun, Moon, Zap, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function TopBar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initial = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/market', label: 'Market Impact', icon: TrendingUp },
    { path: '/company', label: 'Company Impact', icon: Building2 },
    { path: '/portfolio', label: 'Portfolio Stress', icon: ShieldAlert },
    { path: '/filings', label: 'Exchange Filings', icon: Building2 },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/knowledge/sectors', label: 'Knowledge Base', icon: BookOpen },
    { path: '/help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-brand font-semibold text-lg hover:opacity-80 transition-opacity"
              aria-label="India Event-Impact Home"
            >
              <Zap className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:block">India Event-Impact</span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-light text-brand'
                        : 'text-text-muted hover:text-text hover:bg-surface-2'
                    }`
                  }
                  aria-current={location.pathname === path ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right: Theme toggle + Key health + Mobile menu button */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Key Health Pill (mock) */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-medium border border-brand/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand" />
              </span>
              Keys: 3/3 healthy
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-text-muted hover:text-text hover:bg-surface-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-border animate-slide-down">
            <nav className="flex flex-col gap-1" role="navigation" aria-label="Mobile navigation">
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-light text-brand'
                        : 'text-text-muted hover:text-text hover:bg-surface-2'
                    }`
                  }
                  aria-current={location.pathname === path ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}