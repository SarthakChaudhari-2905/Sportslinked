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
import { connectionApi, messageApi } from "../../lib/endpoints";
import { Avatar } from "../ui";

const ORG_ROLES = ["CLUB", "ACADEMY", "AGENCY"];

function NavItem({ to, icon: Icon, label, end, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group relative flex flex-col items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold transition sm:px-3.5 ${
          isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative">
            <Icon size={21} strokeWidth={isActive ? 2.4 : 2} />
            {badge > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </span>
          <span className="hidden sm:block">{label}</span>
          <span
            className={`hidden h-0.5 w-full rounded-full bg-slate-900 transition-opacity sm:block ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const menuRef = useRef(null);

  const isOrg = ORG_ROLES.includes(user?.role);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Light-weight badge counts for the Network and Messages icons.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [connectionData, conversationData] = await Promise.allSettled([
          connectionApi.mine(),
          messageApi.conversations(),
        ]);

        if (!cancelled && connectionData.status === "fulfilled") {
          const list = connectionData.value?.connections || [];
          const incoming = list.filter((c) => c.direction === "INCOMING" && c.status === "PENDING");
          setPendingRequests(incoming.length);
        }

        if (!cancelled && conversationData.status === "fulfilled") {
          const list = conversationData.value?.conversations || [];
          const unread = list.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadMessages(unread);
        }
      } catch {
        // Badges are a nice-to-have; silently ignore failures.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/athletes?sport=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)]">
        <div className="container-page flex h-14 items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-1.5 text-brand-600">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Trophy size={18} />
            </span>
            <span className="hidden text-lg font-extrabold tracking-tight text-slate-900 sm:block">
              Sport<span className="text-brand-600">Linked</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xs md:block">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sport, e.g. football"
                className="w-full rounded-full border border-transparent bg-slate-100 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </form>

          <nav className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1.5">
            <NavItem to="/" end icon={Home} label="Home" />
            <NavItem to="/events" icon={CalendarDays} label="Events" />
            <NavItem to="/athletes" icon={Users} label="Athletes" />
            <NavItem to="/network" icon={NetworkIcon} label="Network" badge={pendingRequests} />
            <NavItem to="/messages" icon={MessageCircle} label="Messaging" badge={unreadMessages} />

            {!isOrg && <NavItem to="/applications" icon={ClipboardList} label="Applications" />}
            {isOrg && <NavItem to="/organization" icon={Building2} label="Org" />}

            <div className="relative ml-1 border-l border-slate-200 pl-2 sm:ml-2 sm:pl-3" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full p-1 hover:bg-slate-100"
              >
                <Avatar name={`${user?.firstName || ""} ${user?.lastName || ""}`} src={user?.avatar} size={32} />
                <ChevronDown size={14} className="hidden text-slate-500 sm:block" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-slate-100 px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${user?.firstName || ""} ${user?.lastName || ""}`} src={user?.avatar} size={38} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="truncate text-xs font-medium text-brand-600">{user?.role}</p>
                      </div>
                    </div>
                  </div>
                  {user?.role === "ATHLETE" && (
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <UserCircle size={16} /> My Profile
                    </Link>
                  )}
                  {isOrg && (
                    <Link
                      to="/organization"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Building2 size={16} /> My Organization
                    </Link>
                  )}
                  <Link
                    to="/network"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <NetworkIcon size={16} /> My Network
                  </Link>
                  <Link
                    to="/verification"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck size={16} /> Verification
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      to="/admin/verifications"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <ShieldCheck size={16} /> Admin Review
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 border-t border-slate-100 px-3.5 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut size={16} /> Log out
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

