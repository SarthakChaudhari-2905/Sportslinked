import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, CalendarDays, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { eventApi } from "../../lib/endpoints";
import { Card, Input, Select, Badge, EmptyState, PageSpinner, Button, formatDate, titleCase } from "../../components/ui";

const EVENT_TYPES = ["", "MATCH", "TRIAL", "TOURNAMENT", "TRAINING", "CAMP", "SCOUTING_SESSION", "OTHER"];
const ORG_ROLES = ["CLUB", "ACADEMY", "AGENCY"];

export default function EventsBrowse() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [sport, setSport] = useState(params.get("sport") || "");
  const [type, setType] = useState(params.get("type") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const isOrg = ORG_ROLES.includes(user?.role);

  const runSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    const query = { status: "PUBLISHED" };
    if (sport) query.sport = sport;
    if (type) query.type = type;
    if (city) query.city = city;
    setParams({ sport, type, city });
    try {
      const data = await eventApi.browse(query);
      setEvents(data?.events || data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Browse opportunities</h1>
          <p className="mt-1 text-sm text-slate-500">Trials, matches, camps and tournaments from verified organizations.</p>
        </div>
        {isOrg && (
          <Link to="/events/new" className="btn-primary">
            <Plus size={16} /> Post event
          </Link>
        )}
      </div>

      <Card className="mt-4 p-4">
        <form onSubmit={runSearch} className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Sport" value={sport} onChange={(e) => setSport(e.target.value)} />
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t ? titleCase(t) : "Any type"}
              </option>
            ))}
          </Select>
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Button type="submit">
            <Search size={16} /> Search
          </Button>
        </form>
      </Card>

      <div className="mt-5">
        {loading ? (
          <PageSpinner label="Loading events..." />
        ) : events.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events found" description="Try different filters." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((ev) => (
              <Link key={ev._id} to={`/events/${ev._id}`} className="card p-4 transition hover:border-brand-300">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                  <Badge tone="brand">{titleCase(ev.type)}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{titleCase(ev.sport)}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} /> {formatDate(ev.startDate)}
                  </span>
                  {ev.location?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {ev.location.city}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

