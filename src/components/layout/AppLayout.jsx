import { useState, useRef, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Trophy,
  Home,
  CalendarDays,
  Users,
  ShieldCheck,
  ChevronDown,
  LogOut,
  UserCircle,
  Building2,
  ClipboardList,
  Search,
  MessageCircle,
  Network as NetworkIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../ui";

const ORG_ROLES = ["CLUB", "ACADEMY", "AGENCY"];

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition ${
          isActive ? "text-brand-700" : "text-slate-500 hover:text-slate-800"
        }`
      }
    >
      <Icon size={20} />
      <span className="hidden sm:block">{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);

  const isOrg = ORG_ROLES.includes(user?.role);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }


  , []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim())
      navigate(`/athletes?sport=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-14 items-center gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-1.5 text-brand-700">
            <Trophy size={24} />
            <span className="hidden text-lg font-extrabold tracking-tight sm:block">
              SportLinked
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xs md:block">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sport, e.g. football"
                className="w-full rounded-full border border-slate-200 bg-slate-100 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:bg-white"
              />
            </div>
          </form>

          <nav className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <NavItem to="/" end icon={Home} label="Home" />
            <NavItem to="/events" icon={CalendarDays} label="Events" />
            <NavItem to="/athletes" icon={Users} label="Athletes" />
            <NavItem to="/network" icon={NetworkIcon} label="Network" />
            <NavItem to="/messages" icon={MessageCircle} label="Messages" />
            
            {!isOrg && (
              <NavItem to="/applications" icon={ClipboardList} label="Applications" />
            )}
            {isOrg && <NavItem to="/organization" icon={Building2} label="Org" />}

            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full p-1 hover:bg-slate-100"
              >
                <Avatar
                  name={`${user?.firstName || ""} ${user?.lastName || ""}`}
                  src={user?.avatar}
                  size={32}
                />
                <ChevronDown size={14} className="hidden text-slate-500 sm:block" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{user?.role}</p>
                  </div>

                  {user?.role === "ATHLETE" && (
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <UserCircle size={16} />
                      My Profile
                    </Link>
                  )}

                  {isOrg && (
                    <Link
                      to="/organization"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Building2 size={16} />
                      My Organization
                    </Link>
                  )}

                  <Link
                    to="/verification"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck size={16} />
                    Verification
                  </Link>

                  {user?.role === "ADMIN" && (
                    <Link
                      to="/admin/verifications"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <ShieldCheck size={16} />
                      Admin Review
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="container-page py-6">
        <Outlet />
      </main>
    </div>
  );
}
