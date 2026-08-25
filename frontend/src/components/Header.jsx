import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black text-white shadow-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/ifoa-logoweb (1).png"
            alt="International Flight Operations Academy"
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="hidden sm:block text-right">
          <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-300">
            EASA Regulations
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
