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

/* -------------------------------------------------------
   Responsive navigation item
------------------------------------------------------- */

function NavItem({
  to,
  icon: Icon,
  label,
  end,
  badge,
  mobileHide = false,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        `
        group relative flex shrink-0 flex-col items-center justify-center
        gap-0.5 rounded-lg px-2 py-1.5
        text-[10px] font-semibold
        transition
        sm:px-2.5
        md:gap-1 md:px-3
        md:py-1.5
        md:text-[11px]
        ${mobileHide ? "hidden md:flex" : "flex"}
        ${
          isActive
            ? "text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }
        `
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative flex items-center justify-center">
            <Icon
              size={20}
              strokeWidth={isActive ? 2.4 : 2}
              className="md:h-[21px] md:w-[21px]"
            />

            {badge > 0 && (
              <span
                className="
                  absolute -right-2 -top-1.5
                  flex h-4 min-w-4 items-center justify-center
                  rounded-full bg-rose-600 px-1
                  text-[9px] font-bold text-white
                  ring-2 ring-white
                "
              >
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </span>

          {/* Labels only on tablet/desktop */}
          <span className="hidden sm:block">{label}</span>

          {/* Active indicator */}
          <span
            className={`
              hidden h-0.5 w-full rounded-full bg-slate-900
              transition-opacity sm:block
              ${isActive ? "opacity-100" : "opacity-0"}
            `}
          />
        </>
      )}
    </NavLink>
  );
}

/* -------------------------------------------------------
   Main Layout
------------------------------------------------------- */

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const menuRef = useRef(null);

  const isOrg = ORG_ROLES.includes(user?.role);

  /* -----------------------------------------------------
     Close profile menu when clicking outside
  ----------------------------------------------------- */

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  /* -----------------------------------------------------
     Load notification badge counts
  ----------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [connectionData, conversationData] =
          await Promise.allSettled([
            connectionApi.mine(),
            messageApi.conversations(),
          ]);

        /* Network pending requests */
        if (!cancelled && connectionData.status === "fulfilled") {
          const list = connectionData.value?.connections || [];

          const incoming = list.filter(
            (c) =>
              c.direction === "INCOMING" &&
              c.status === "PENDING"
          );

          setPendingRequests(incoming.length);
        }

        /* Unread messages */
        if (!cancelled && conversationData.status === "fulfilled") {
          const list =
            conversationData.value?.conversations || [];

          const unread = list.reduce(
            (sum, c) => sum + (c.unreadCount || 0),
            0
          );

          setUnreadMessages(unread);
        }
      } catch {
        // Badge counts are optional.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -----------------------------------------------------
     Logout
  ----------------------------------------------------- */

  const handleLogout = async () => {
    setMenuOpen(false);

    await logout();

    navigate("/login");
  };

  /* -----------------------------------------------------
     Search
  ----------------------------------------------------- */

  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    navigate(
      `/athletes?sport=${encodeURIComponent(value)}`
    );
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100">

      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
          sticky top-0 z-40
          w-full
          border-b border-slate-200
          bg-white
          shadow-[0_1px_0_rgba(15,23,42,0.03)]
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-full
            max-w-[1600px]
            items-center
            gap-1
            px-2
            sm:gap-2
            sm:px-3
            md:px-5
            lg:px-6
          "
        >

          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            aria-label="SportLinked Home"
            className="
              flex
              shrink-0
              items-center
              gap-1.5
              text-brand-600
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-brand-600
                text-white
                shadow-sm
              "
            >
              <Trophy size={18} />
            </span>

            {/* Hide brand name on small screens */}
            <span
              className="
                hidden
                text-lg
                font-extrabold
                tracking-tight
                text-slate-900
                lg:block
              "
            >
              Sport<span className="text-brand-600">Linked</span>
            </span>
          </Link>

          {/* =================================================
              SEARCH
          ================================================= */}

          <form
            onSubmit={handleSearch}
            className="
              hidden
              min-w-0
              max-w-xs
              flex-1
              md:block
            "
          >
            <div className="relative">
              <Search
                size={16}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sport, e.g. football"
                className="
                  w-full
                  rounded-full
                  border
                  border-transparent
                  bg-slate-100
                  py-2
                  pl-9
                  pr-3
                  text-sm
                  outline-none
                  transition
                  focus:border-brand-300
                  focus:bg-white
                  focus:ring-2
                  focus:ring-brand-100
                "
              />
            </div>
          </form>

          {/* =================================================
              NAVIGATION

              IMPORTANT:
              overflow-visible allows profile dropdown
              to appear outside the navigation container.
          ================================================= */}

          <nav
            className="
              flex
              min-w-0
              flex-1
              items-center
              justify-end
              gap-0
              overflow-visible
              sm:gap-0.5
              md:gap-1
            "
          >

            {/* Main navigation */}

            <NavItem
              to="/"
              end
              icon={Home}
              label="Home"
            />

            <NavItem
              to="/events"
              icon={CalendarDays}
              label="Events"
            />

            <NavItem
              to="/athletes"
              icon={Users}
              label="Athletes"
            />

            <NavItem
              to="/network"
              icon={NetworkIcon}
              label="Network"
              badge={pendingRequests}
            />

            <NavItem
              to="/messages"
              icon={MessageCircle}
              label="Messaging"
              badge={unreadMessages}
            />

            {/* Applications only desktop/tablet */}

            {!isOrg && (
              <NavItem
                to="/applications"
                icon={ClipboardList}
                label="Applications"
                mobileHide
              />
            )}

            {/* Organization only desktop/tablet */}

            {isOrg && (
              <NavItem
                to="/organization"
                icon={Building2}
                label="Org"
                mobileHide
              />
            )}

            {/* =================================================
                PROFILE MENU
            ================================================= */}

            <div
              ref={menuRef}
              className="
                relative
                z-50
                ml-1
                shrink-0
                border-l
                border-slate-200
                pl-1
                sm:ml-1.5
                sm:pl-2
                md:ml-2
                md:pl-3
              "
            >

              {/* Profile Button */}

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Open profile menu"
                aria-expanded={menuOpen}
                className="
                  flex
                  h-10
                  shrink-0
                  items-center
                  gap-1
                  rounded-full
                  p-1
                  transition
                  hover:bg-slate-100
                  focus:outline-none
                  focus:ring-2
                  focus:ring-brand-200
                "
              >
                <Avatar
                  name={`${user?.firstName || ""} ${
                    user?.lastName || ""
                  }`}
                  src={user?.avatar}
                  size={32}
                />

                <ChevronDown
                  size={14}
                  className={`
                    hidden
                    text-slate-500
                    transition-transform
                    sm:block
                    ${menuOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {/* =================================================
                  PROFILE DROPDOWN
              ================================================= */}

              {menuOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-full
                    z-[100]
                    mt-2
                    w-[calc(100vw-1rem)]
                    max-w-60
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    py-1
                    shadow-xl
                  "
                >

                  {/* User info */}

                  <div
                    className="
                      border-b
                      border-slate-100
                      px-3.5
                      py-3
                    "
                  >
                    <div className="flex items-center gap-2.5">

                      <Avatar
                        name={`${user?.firstName || ""} ${
                          user?.lastName || ""
                        }`}
                        src={user?.avatar}
                        size={38}
                      />

                      <div className="min-w-0">

                        <p
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-slate-900
                          "
                        >
                          {user?.firstName} {user?.lastName}
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            font-medium
                            text-brand-600
                          "
                        >
                          {user?.role}
                        </p>

                      </div>
                    </div>
                  </div>

                  {/* Athlete Profile */}

                  {user?.role === "ATHLETE" && (
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="
                        flex
                        items-center
                        gap-2
                        px-3.5
                        py-2
                        text-sm
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      <UserCircle size={16} />
                      My Profile
                    </Link>
                  )}

                  {/* Organization */}

                  {isOrg && (
                    <Link
                      to="/organization"
                      onClick={() => setMenuOpen(false)}
                      className="
                        flex
                        items-center
                        gap-2
                        px-3.5
                        py-2
                        text-sm
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      <Building2 size={16} />
                      My Organization
                    </Link>
                  )}

                  {/* Applications */}

                  {!isOrg && (
                    <Link
                      to="/applications"
                      onClick={() => setMenuOpen(false)}
                      className="
                        flex
                        items-center
                        gap-2
                        px-3.5
                        py-2
                        text-sm
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      <ClipboardList size={16} />
                      My Applications
                    </Link>
                  )}

                  {/* Network */}

                  <Link
                    to="/network"
                    onClick={() => setMenuOpen(false)}
                    className="
                      flex
                      items-center
                      gap-2
                      px-3.5
                      py-2
                      text-sm
                      text-slate-700
                      hover:bg-slate-50
                    "
                  >
                    <NetworkIcon size={16} />
                    My Network
                  </Link>

                  {/* Verification */}

                  <Link
                    to="/verification"
                    onClick={() => setMenuOpen(false)}
                    className="
                      flex
                      items-center
                      gap-2
                      px-3.5
                      py-2
                      text-sm
                      text-slate-700
                      hover:bg-slate-50
                    "
                  >
                    <ShieldCheck size={16} />
                    Verification
                  </Link>

                  {/* Admin Review */}

                  {user?.role === "ADMIN" && (
                    <Link
                      to="/admin/verifications"
                      onClick={() => setMenuOpen(false)}
                      className="
                        flex
                        items-center
                        gap-2
                        px-3.5
                        py-2
                        text-sm
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      <ShieldCheck size={16} />
                      Admin Review
                    </Link>
                  )}

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex
                      w-full
                      items-center
                      gap-2
                      border-t
                      border-slate-100
                      px-3.5
                      py-2
                      text-left
                      text-sm
                      text-rose-600
                      hover:bg-rose-50
                    "
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

      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <main
        className="
          mx-auto
          w-full
          max-w-[1600px]
          min-w-0
          px-3
          py-4
          sm:px-4
          sm:py-5
          md:px-5
          md:py-6
          lg:px-6
        "
      >
        <Outlet />
      </main>

    </div>
  );
}