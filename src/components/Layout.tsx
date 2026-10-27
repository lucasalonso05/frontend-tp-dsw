import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
