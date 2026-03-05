import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className={`flex-1 ${!isLanding ? 'pt-16 lg:pt-[68px]' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
