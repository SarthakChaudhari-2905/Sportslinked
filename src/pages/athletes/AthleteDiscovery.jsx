import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { athleteProfileApi } from "../../lib/endpoints";
import { Card, Input, Select, Avatar, Badge, EmptyState, PageSpinner, Button, titleCase } from "../../components/ui";

const LEVELS = ["", "BEGINNER", "AMATEUR", "SCHOOL", "COLLEGE", "DISTRICT", "STATE", "NATIONAL", "INTERNATIONAL", "PROFESSIONAL"];

export default function AthleteDiscovery() {
  const [params, setParams] = useSearchParams();
  const [sport, setSport] = useState(params.get("sport") || "");
  const [level, setLevel] = useState(params.get("level") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [athletes, setAthletes] = useState(null);
  const [loading, setLoading] = useState(true);

  const runSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    const query = {};
    if (sport) query.sport = sport;
    if (level) query.level = level;
    if (city) query.city = city;
    setParams(query);
    try {
      const data = await athleteProfileApi.search(query);
      setAthletes(data?.profiles || data?.athletes || data || []);
    } catch {
      setAthletes([]);
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
      <h1 className="text-xl font-bold text-slate-900">Discover athletes</h1>
      <p className="mt-1 text-sm text-slate-500">Search verified athlete profiles by sport, level and location.</p>

      <Card className="mt-4 p-4">
        <form onSubmit={runSearch} className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Sport, e.g. football" value={sport} onChange={(e) => setSport(e.target.value)} />
          <Select value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l ? titleCase(l) : "Any level"}
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
          <PageSpinner label="Searching athletes..." />
        ) : athletes.length === 0 ? (
          <EmptyState title="No athletes found" description="Try a different sport, level or location." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {athletes.map((p) => {
              const u = p.user || {};
              const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
              return (
                <Link key={p._id} to={`/athletes/${u._id}`} className="card p-4 transition hover:border-brand-300">
                  <div className="flex items-center gap-3">
                    <Avatar name={name} src={u.avatar} size={48} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {titleCase(p.primarySport)} {p.position ? `Â· ${titleCase(p.position)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge tone="brand">{titleCase(p.playingLevel)}</Badge>
                    {p.location?.city && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={11} /> {p.location.city}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

