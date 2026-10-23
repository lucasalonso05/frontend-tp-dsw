import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl p-4 md:p-6">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
