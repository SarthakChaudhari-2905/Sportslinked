import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ban } from "lucide-react";
import { applicationApi } from "../../lib/endpoints";
import { Card, Badge, Button, EmptyState, PageSpinner, ErrorBanner, formatDate, titleCase } from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

export default function MyApplications() {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const data = await applicationApi.getMine();
      setApplications(data?.applications || data || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setApplications([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleWithdraw = async (id) => {
    if (!confirm("Withdraw this application?")) return;
    setBusyId(id);
    try {
      await applicationApi.withdraw(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (applications === null) return <PageSpinner label="Loading applications..." />;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">My applications</h1>
      <p className="mt-1 text-sm text-slate-500">Track the status of events you've applied to.</p>

      <ErrorBanner message={error} />

      <div className="mt-4">
        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Browse events and apply to the ones that fit you."
            action={
              <Link to="/events" className="btn-primary mt-2">
                Browse events
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link to={`/events/${app.event?._id}`} className="text-sm font-semibold text-slate-800 hover:text-brand-700">
                    {app.event?.title || "Event"}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {app.event?.organization?.name ? `${app.event.organization.name} Â· ` : ""}
                    Applied {formatDate(app.createdAt)}
                    {app.event?.startDate ? ` Â· Event on ${formatDate(app.event.startDate)}` : ""}
                  </p>
                  {app.organizationNote && (
                    <p className="mt-1 text-xs italic text-slate-500">"{app.organizationNote}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(app.status)}>{titleCase(app.status)}</Badge>
                  {["APPLIED", "UNDER_REVIEW", "SHORTLISTED"].includes(app.status) && (
                    <Button variant="ghost" onClick={() => handleWithdraw(app._id)} loading={busyId === app._id}>
                      <Ban size={14} /> Withdraw
                    </Button>
                  )}
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
      APPLIED: "slate",
      UNDER_REVIEW: "amber",
      SHORTLISTED: "brand",
      SELECTED: "green",
      REJECTED: "rose",
      WITHDRAWN: "slate",
    }[status] || "slate"
  );
}

