import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Users, Pencil, UploadCloud, Trash2 } from "lucide-react";
import { eventApi } from "../../lib/endpoints";
import { Card, Badge, Button, EmptyState, PageSpinner, ErrorBanner, formatDateTime, titleCase } from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

export default function OrgEventsManage() {
  const { id } = useParams();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const data = await eventApi.getForOrganization(id);
      setEvents(data?.events || data || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setEvents([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePublish = async (eventId) => {
    setBusyId(eventId);
    try {
      await eventApi.publish(eventId);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Delete this event?")) return;
    setBusyId(eventId);
    try {
      await eventApi.remove(eventId);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (events === null) return <PageSpinner label="Loading events..." />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Manage events</h1>
        <Link to="/events/new" className="btn-primary">
          <Plus size={16} /> Post event
        </Link>
      </div>

      <ErrorBanner message={error} />

      <div className="mt-4">
        {events.length === 0 ? (
          <EmptyState title="No events yet" description="Post your first trial, match or camp." />
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <Card key={ev._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                    <Badge tone={statusTone(ev.status)}>{titleCase(ev.status)}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {titleCase(ev.sport)} Â· {titleCase(ev.type)} Â· {formatDateTime(ev.startDate)} Â· {ev.applicationsCount || 0} applied
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ev.status === "DRAFT" && (
                    <Button variant="secondary" onClick={() => handlePublish(ev._id)} loading={busyId === ev._id}>
                      <UploadCloud size={14} /> Publish
                    </Button>
                  )}
                  <Link to={`/events/${ev._id}/applications`} className="btn-ghost">
                    <Users size={14} /> Applications
                  </Link>
                  <Link to={`/events/${ev._id}/edit`} className="btn-ghost">
                    <Pencil size={14} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(ev._id)}
                    className="btn-ghost text-rose-600 hover:bg-rose-50"
                    disabled={busyId === ev._id}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function statusTone(status) {
  return (
    {
      DRAFT: "slate",
      PUBLISHED: "green",
      REGISTRATION_CLOSED: "amber",
      ONGOING: "brand",
      COMPLETED: "slate",
      CANCELLED: "rose",
    }[status] || "slate"
  );
}

