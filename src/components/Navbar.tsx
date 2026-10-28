import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarCog, CalendarDays, LogOut, MapPin, Menu, Ticket, Users, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLE_LABELS } from '../types/user';
import type { UserRole } from '../types/user';
import Badge from './Badge';
import Button from './Button';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Si se indica, el enlace solo lo ven estos roles. Sin roles, lo ven todos. */
  roles?: UserRole[];
}

const links: NavItem[] = [
  { to: '/', label: 'Cartelera', icon: CalendarDays },
  {
    to: '/eventos', label: 'Eventos', icon: CalendarCog, roles: ['ORGANISER', 'ADMIN'],
  },
  {
    to: '/lugares', label: 'Lugares', icon: MapPin, roles: ['ORGANISER', 'ADMIN'],
  },
  {
    to: '/personas', label: 'Personas', icon: Users, roles: ['ADMIN'],
  },
];

const linkClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-100'}`;

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Cada usuario ve solo los enlaces de su rol.
  const visibleLinks = links.filter(
    (link) => !link.roles || (user !== null && link.roles.includes(user.role)),
  );

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-blue-800">
          <Ticket className="size-6" />
          Eventify
        </Link>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 lg:hidden"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
          Menú
        </button>

        <div
          id="menu"
          className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-3 pt-3 lg:flex lg:w-auto lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:pt-0`}
        >
          <ul className="flex flex-col gap-1 lg:flex-row">
            {visibleLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} onClick={close} className={linkClass}>
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 lg:border-0 lg:pt-0">
            {user ? (
              <>
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  {user.name} {user.surname}
                  <Badge>{USER_ROLE_LABELS[user.role]}</Badge>
                </span>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/ingresar" onClick={close} className={linkClass}>
                  Ingresar
                </NavLink>
                <Button to="/registrarse" size="sm" onClick={close}>
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
