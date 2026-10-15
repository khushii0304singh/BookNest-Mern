import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const link = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-brand-soft text-brand' : 'text-ink/80 hover:text-ink'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-ink/10 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3">
        <Link to="/" className="mr-auto font-display text-xl font-extrabold tracking-tight text-brand">
          BookNest
        </Link>
        <NavLink to="/" end className={link}>Books</NavLink>
        {user ? (
          <>
            <NavLink to="/add-book" className={link}>Add Book</NavLink>
            <NavLink to="/my-reviews" className={link}>My Reviews</NavLink>
            <span className="hidden px-2 text-sm text-ink/60 sm:inline">Hi, {user.name.split(' ')[0]}</span>
            <button onClick={handleLogout} className="btn-ghost py-1.5">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={link}>Login</NavLink>
            <Link to="/register" className="btn-primary py-1.5">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
