import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from './Footer';

const NO_FOOTER_PREFIXES = ['/workspace/'];

const MainLayout = () => {
  const location = useLocation();
  const hideFooter = NO_FOOTER_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

  return (
    <div className="min-h-dvh flex flex-col page-mesh">
      <div className="fixed inset-0 page-grid pointer-events-none -z-10" aria-hidden="true" />
      <Navbar />
      <main className="flex-1 pt-[var(--nav-height)]">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
