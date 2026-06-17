import Navbar from './Navbar.jsx';

export default function PageShell({ children, showNavbar = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      {showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
