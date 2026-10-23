import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLE_LABELS } from '../types/user';
import type { UserRole } from '../types/user';

interface NavItem {
  to: string;
  label: string;
  /** Si se indica, el enlace solo lo ven estos roles. Sin roles, lo ven todos. */
  roles?: UserRole[];
}

const links: NavItem[] = [
  { to: '/', label: 'Cartelera' },
  { to: '/eventos', label: 'Eventos', roles: ['ORGANISER', 'ADMIN'] },
  { to: '/lugares', label: 'Lugares', roles: ['ORGANISER', 'ADMIN'] },
  { to: '/personas', label: 'Personas', roles: ['ADMIN'] },
];

const linkClass = ({ isActive }: { isActive: boolean }) => `block rounded px-2 py-2 ${isActive ? 'font-semibold text-blue-600' : 'text-slate-700 hover:text-blue-600'}`;

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Cada usuario ve solo los enlaces de su rol.
  const visibleLinks = links.filter(
    (link) => !link.roles || (user !== null && link.roles.includes(user.role)),
  );

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between p-4">
        <Link to="/" className="text-xl font-bold text-blue-600">
          Eventify
        </Link>

        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-2 md:hidden"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen(!open)}
        >
          Menú
        </button>

        <ul
          id="menu"
          className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-1 pt-4 md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:pt-0`}
        >
          {visibleLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          <li className="border-t border-slate-200 pt-2 md:border-t-0 md:border-l md:pt-0 md:pl-4">
            {user ? (
              <div className="flex items-center justify-between gap-3 px-2 py-2">
                <span className="text-sm text-slate-600">
                  {user.name} {user.surname}
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                    {USER_ROLE_LABELS[user.role]}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-red-700 hover:underline"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/ingresar" onClick={() => setOpen(false)} className={linkClass}>
                  Ingresar
                </NavLink>
                <NavLink
                  to="/registrarse"
                  onClick={() => setOpen(false)}
                  className="block rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                >
                  Registrarse
                </NavLink>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
