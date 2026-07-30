import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';
import api from '../../lib/api';

export default function Layout() {
  const loc = useLocation();
  const isHome = loc.pathname === '/';

  useEffect(() => {
    const ua = navigator.userAgent;
    const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
    api.post('/visitor/track', {
      page: loc.pathname,
      referrer: document.referrer || 'Direct',
      device,
    }).catch(() => {});
  }, [loc.pathname]);

  return (
    <>
      <Navbar />
      <ScrollToTop />
      <main className={`min-h-screen ${!isHome ? 'pt-[72px]' : ''}`}>
        <Outlet />
      </main>
      {!isHome && <Footer />}
    </>
  );
}
