import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ClipboardList, ShieldCheck, ArrowRight, MapPin, Sparkles, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { eventApi, applicationApi, athleteProfileApi, organizationApi } from "../lib/endpoints";
import { Card, Badge, Avatar, EmptyState, PageSpinner, formatDate, titleCase } from "../components/ui";
import SpotlightCarousel from "../components/dashboard/SpotlightCarousel";
const ORG_ROLES = ["CLUB", "ACADEMY", "AGENCY"];

export default function Dashboard() {
  const { user } = useAuth();
  const isOrg = ORG_ROLES.includes(user?.role);
  const isScoutLike = isOrg || user?.role === "SCOUT";
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [org, setOrg] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        eventApi.browse({ status: "PUBLISHED", limit: 5 }),
        user.role === "ATHLETE" ? applicationApi.getMine() : Promise.resolve([]),
        user.role === "ATHLETE" ? athleteProfileApi.getMine() : Promise.resolve(null),
        isOrg ? organizationApi.getMine() : Promise.resolve([]),
      ]);

      if (results[0].status === "fulfilled") setEvents(results[0].value?.events || results[0].value || []);
      if (results[1].status === "fulfilled") setApplications(results[1].value?.applications || results[1].value || []);
      if (results[2].status === "fulfilled") setProfile(results[2].value?.profile || null);

      let resolvedOrg = null;
      if (results[3].status === "fulfilled") {
        const memberships = results[3].value?.organizations || results[3].value || [];
        resolvedOrg = memberships[0]?.organization || null;
        setOrg(resolvedOrg);
      }

      // Suggested connections
      try {
        if (user.role === "ATHLETE" && results[2].status === "fulfilled" && results[2].value?.profile?.primarySport) {
          const data = await athleteProfileApi.search({
            sport: results[2].value.profile.primarySport,
            excludeSelf: true,
            limit: 6,
          });
          setSuggestions(data?.profiles || data || []);
        } else if (isScoutLike) {
          const sport = resolvedOrg?.sports?.[0];
          const data = await athleteProfileApi.search({ sport, limit: 6 });
          setSuggestions(data?.profiles || data || []);
        }
      } catch {
        setSuggestions([]);
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOrg]);

  if (loading) return <PageSpinner label="Loading your dashboard..." />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-5 py-6 text-white">
            <p className="text-sm text-brand-100">Welcome back,</p>
            <h1 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-1 text-sm text-brand-100">
              {user.role === "ATHLETE"
                ? "Here's what's new for you today."
                : "Here's what's happening on SportLinked."}
            </p>
          </div>
          {events.length > 0 && (
  <SpotlightCarousel
    events={events}
  />
)}

          {user.role === "ATHLETE" && !profile && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-sm text-slate-600">Complete your athlete profile to get discovered by scouts.</p>
              <Link to="/profile/edit" className="btn-primary py-1.5">
                Set up profile <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {isOrg && !org && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-sm text-slate-600">Set up your organization to start posting opportunities.</p>
              <Link to="/organization" className="btn-primary py-1.5">
                Create org <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CalendarDays size={16} className="text-brand-600" /> Latest opportunities
            </h2>
            <Link to="/events" className="text-xs font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          </div>

          {events.length === 0 ? (
            <EmptyState title="No published events yet" description="Check back soon or explore organizations." />
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <Link
                  key={ev._id}
                  to={`/events/${ev._id}`}
                  className="block rounded-lg border border-slate-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {titleCase(ev.sport)} - {titleCase(ev.type)}
                        {ev.organization?.name ? ` - ${ev.organization.name}` : ""}
                      </p>
                    </div>
                    <Badge tone="brand">{formatDate(ev.startDate)}</Badge>
                  </div>
                  {ev.location?.city && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} /> {ev.location.city}
                      {ev.location?.state ? `, ${ev.location.state}` : ""}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Card>

        {suggestions.length > 0 && (
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles size={16} className="text-brand-600" />
                {user.role === "ATHLETE" ? "Athletes you may want to connect with" : "Suggested athletes to scout"}
              </h2>
              <Link to="/athletes" className="text-xs font-semibold text-brand-700 hover:underline">
                See more
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((p) => {
                const u = p.user || {};
                const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
                return (
                  <Link
                    key={p._id}
                    to={`/athletes/${u._id}`}
                    className="rounded-lg border border-slate-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={name} src={u.avatar} size={38} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {titleCase(p.primarySport)}
                          {p.position ? ` - ${titleCase(p.position)}` : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        {user.role === "ATHLETE" && (
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ClipboardList size={16} className="text-brand-600" /> My applications
              </h2>
              <Link to="/applications" className="text-xs font-semibold text-brand-700 hover:underline">
                View all
              </Link>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-slate-500">You haven't applied to anything yet.</p>
            ) : (
              <ul className="space-y-2">
                {applications.slice(0, 4).map((app) => (
                  <li key={app._id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-slate-700">{app.event?.title || "Event"}</span>
                    <Badge tone={statusTone(app.status)}>{titleCase(app.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {isScoutLike && (
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Users size={16} className="text-brand-600" /> Find talent
            </h2>
            <p className="text-sm text-slate-500">Search athletes by sport, level and location.</p>
            <Link to="/athletes" className="btn-secondary mt-3 w-full">
              Browse athletes
            </Link>
          </Card>
        )}

        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ShieldCheck size={16} className="text-brand-600" /> Verification
          </h2>
          <p className="text-sm text-slate-500">
            Verified profiles get significantly more visibility to clubs and scouts.
          </p>
          <Link to="/verification" className="btn-secondary mt-3 w-full">
            Manage verification
          </Link>
        </Card>
      </div>
    </div>
  );
}

function statusTone(status) {
  return (
    {
      APPLIED: "slate",
      UNDER_REVIEW: "amber",
      SHORTLISTED: "brand",
      SELECTED: "green",
      REJECTED: "rose",
      WITHDRAWN: "slate",
    }[status] || "slate"
  );
}

