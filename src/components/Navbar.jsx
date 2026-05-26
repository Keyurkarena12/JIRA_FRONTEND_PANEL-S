import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser, currentUser } from '../features/authSlice';
import Logo from './ui/Logo';

const navLinks = [
  { to: '/', label: 'Home', auth: false, match: (path) => path === '/' },
  { to: '/workspaces', label: 'Workspaces', auth: true, match: (path) => path.startsWith('/workspace') || path === '/workspaces' },
  { to: '/pricing', label: 'Pricing', auth: false, match: (path) => path === '/pricing' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem('token');
  const isLoggedIn = Boolean(user || token);

  useEffect(() => {
    if (token && !user) {
      dispatch(currentUser());
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    setMobileOpen(false);
    setShowProfileDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const visibleLinks = navLinks.filter((link) => !link.auth || isLoggedIn);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-nav ${
        scrolled ? 'glass-nav-scrolled' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[var(--nav-height)]">
          <Logo />

          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-100/60 border border-slate-200/60" aria-label="Main navigation">
            {visibleLinks.map((link) => {
              const active = link.match(location.pathname);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-pill ${active ? 'nav-pill-active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative profile-dropdown">
                <button
                  type="button"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-transparent hover:border-[var(--surface-border)] hover:bg-white/80 transition-all min-h-[44px]"
                  aria-expanded={showProfileDropdown}
                  aria-haspopup="menu"
                >
                  <img
                    src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="font-semibold text-sm text-[var(--text-primary)] leading-tight">{user?.name || 'User'}</p>
                    <p className="text-xs text-[var(--text-muted)] capitalize">{user?.plan || 'free'} plan</p>
                  </div>
                  <svg className="w-4 h-4 text-[var(--text-muted)] hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[var(--surface-border)] overflow-hidden"
                      role="menu"
                    >
                      <div className="p-4 border-b border-[var(--surface-border)] bg-slate-50/50">
                        <p className="font-semibold text-[var(--text-primary)]">{user?.name || 'User'}</p>
                        <p className="text-sm text-[var(--text-secondary)] truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/settings" className="block px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-slate-50 hover:text-[var(--brand-primary)]" role="menuitem">
                          Settings
                        </Link>
                        <Link to="/workspaces" className="block px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-slate-50 hover:text-[var(--brand-primary)]" role="menuitem">
                          My Workspaces
                        </Link>
                      </div>
                      <div className="border-t border-[var(--surface-border)] p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm px-5">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm px-6 py-3 min-h-[44px]">Get Started</Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden border-t border-[var(--surface-border)] bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {visibleLinks.map((link) => {
                const active = link.match(location.pathname);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-4 py-3 rounded-xl font-medium min-h-[44px] ${
                      active
                        ? 'bg-blue-50 text-[var(--brand-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-slate-50 hover:text-[var(--brand-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {!isLoggedIn ? (
                <div className="pt-3 flex flex-col gap-2">
                  <Link to="/login" className="btn-ghost w-full justify-center">Sign In</Link>
                  <Link to="/register" className="btn-primary w-full justify-center min-h-[48px]">Get Started</Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full mt-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium min-h-[44px]"
                >
                  Sign out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
