import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.tsx'

function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout