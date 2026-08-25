import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all select-none ${
    isActive
      ? 'bg-neutral-800 text-white shadow-xs'
      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
  }`;

export function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-900">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-6 sm:gap-8">
            <Link to="/admin" className="flex items-center gap-3">
              <img
                src="/ifoa-logoweb (1).png"
                alt="IFOA"
                className="h-8 sm:h-9 w-auto object-contain"
              />
              <span className="rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-300 hidden sm:inline-block">
                Admin
              </span>
            </Link>

            <nav className="flex items-center gap-1.5" aria-label="Admin Navigation">
              <NavLink to="/admin" end className={navLinkClass}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Submissions</span>
              </NavLink>
              <NavLink to="/admin/batches" className={navLinkClass}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Batches</span>
              </NavLink>
              <NavLink to="/admin/form-builder" className={navLinkClass}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Form Builder</span>
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
            >
              <span>Public Form</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
