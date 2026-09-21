import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Star, Eye } from "lucide-react";
import { applicationApi, eventApi } from "../../lib/endpoints";
import {
  Card,
  Badge,
  Avatar,
  Select,
  Button,
  Modal,
  Textarea,
  Field,
  EmptyState,
  PageSpinner,
  ErrorBanner,
  formatDate,
  titleCase,
} from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

const STATUS_FILTERS = ["", "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "SELECTED", "REJECTED", "WITHDRAWN"];

export default function EventApplicationsManage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [applications, setApplications] = useState(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(null);

  const load = async (status) => {
    try {
      const [evData, appData] = await Promise.all([
        eventApi.getById(id).catch(() => null),
        applicationApi.getForEvent(id, status || undefined),
      ]);
      if (evData) setEvent(evData?.event || evData);
      setApplications(appData?.applications || appData || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setApplications([]);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, filter]);

  if (applications === null) return <PageSpinner label="Loading applications..." />;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Applications{event ? ` â€” ${event.title}` : ""}</h1>
      <p className="mt-1 text-sm text-slate-500">Review, shortlist and select athletes for this event.</p>

      <div className="mt-4 flex items-center gap-3">
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-48">
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s ? titleCase(s) : "All statuses"}
            </option>
          ))}
        </Select>
      </div>

      <ErrorBanner message={error} />

      <div className="mt-4">
        {applications.length === 0 ? (
          <EmptyState title="No applications" description="No athletes have applied yet for this filter." />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app._id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={`${app.athlete?.firstName || ""} ${app.athlete?.lastName || ""}`}
                      src={app.athlete?.avatar}
                      size={44}
                    />
                    <div>
                      <Link
                        to={`/athletes/${app.athlete?._id}`}
                        className="text-sm font-semibold text-slate-800 hover:text-brand-700"
                      >
                        {app.athlete?.firstName} {app.athlete?.lastName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        Applied {formatDate(app.createdAt)}
                        {app.position ? ` Â· ${titleCase(app.position)}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge tone={statusTone(app.status)}>{titleCase(app.status)}</Badge>
                </div>

                {(app.message || app.experience) && (
                  <div className="mt-3 space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    {app.message && <p><span className="font-medium text-slate-700">Message: </span>{app.message}</p>}
                    {app.experience && <p><span className="font-medium text-slate-700">Experience: </span>{app.experience}</p>}
                  </div>
                )}

                {!["WITHDRAWN", "SELECTED", "REJECTED"].includes(app.status) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => setReviewing({ app, status: "SHORTLISTED" })}>
                      <Star size={14} /> Shortlist
                    </Button>
                    <Button variant="secondary" onClick={() => setReviewing({ app, status: "SELECTED" })}>
                      <CheckCircle2 size={14} /> Select
                    </Button>
                    <Button variant="ghost" className="text-rose-600" onClick={() => setReviewing({ app, status: "REJECTED" })}>
                      <XCircle size={14} /> Reject
                    </Button>
                    <Link to={`/athletes/${app.athlete?._id}`} className="btn-ghost">
                      <Eye size={14} /> View profile
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {reviewing && (
        <ReviewModal
          app={reviewing.app}
          status={reviewing.status}
          onClose={() => setReviewing(null)}
          onDone={() => {
            setReviewing(null);
            load(filter);
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({ app, status, onClose, onDone }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await applicationApi.updateStatus(app._id, status, note);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={`Mark as ${titleCase(status)}`} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        <ErrorBanner message={error} />
        <p className="text-sm text-slate-600">
          {app.athlete?.firstName} {app.athlete?.lastName}
        </p>
        <Field label="Note to athlete" htmlFor="note" hint="Optional">
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Confirm
          </Button>
        </div>
      </form>
    </Modal>
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

