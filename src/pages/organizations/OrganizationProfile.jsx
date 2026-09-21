import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Globe, Mail, Phone, MapPin, BadgeCheck } from "lucide-react";
import { organizationApi, eventApi } from "../../lib/endpoints";
import { Card, Badge, Avatar, EmptyState, PageSpinner, formatDate, titleCase } from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

export default function OrganizationProfile() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await organizationApi.getById(id);
        setOrg(data?.organization || data);
        const evData = await eventApi.browse({ organizationId: id, status: "PUBLISHED" }).catch(() => null);
        setEvents(evData?.events || evData || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <PageSpinner label="Loading organization..." />;
  if (error || !org) return <EmptyState title="Organization not found" description={error} />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="overflow-hidden">
          <div
            className="h-28 bg-gradient-to-r from-brand-700 to-brand-900"
            style={org.coverImageUrl ? { backgroundImage: `url(${org.coverImageUrl})`, backgroundSize: "cover" } : {}}
          />
          <div className="px-5 pb-5">
            <div className="-mt-10 flex items-end gap-3">
              <Avatar name={org.name} src={org.logoUrl} size={80} />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-slate-900">{org.name}</h1>
              {org.verificationStatus === "VERIFIED" && <BadgeCheck size={18} className="text-brand-600" />}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge tone="brand">{titleCase(org.type)}</Badge>
              {org.sports?.map((s) => (
                <Badge key={s}>{titleCase(s)}</Badge>
              ))}
            </div>
            {org.location?.city && (
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <MapPin size={13} /> {org.location.city}
                {org.location.state ? `, ${org.location.state}` : ""}, {org.location.country}
              </p>
            )}
            {org.description && <p className="mt-4 whitespace-pre-line text-sm text-slate-600">{org.description}</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Open opportunities</h2>
          {events.length === 0 ? (
            <p className="text-sm text-slate-400">No published events right now.</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <Link
                  key={ev._id}
                  to={`/events/${ev._id}`}
                  className="block rounded-lg border border-slate-100 p-3 hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {titleCase(ev.sport)} Â· {titleCase(ev.type)} Â· {formatDate(ev.startDate)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Contact</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            {org.email && (
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" /> {org.email}
              </li>
            )}
            {org.phone && (
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" /> {org.phone}
              </li>
            )}
            {org.website && (
              <li className="flex items-center gap-2">
                <Globe size={14} className="text-slate-400" />
                <a href={org.website} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                  {org.website}
                </a>
              </li>
            )}
            {!org.email && !org.phone && !org.website && <li className="text-slate-400">No contact info shared.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

