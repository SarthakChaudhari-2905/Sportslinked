import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  IndianRupee,
  Pencil,
  Send,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { eventApi, applicationApi } from "../../lib/endpoints";
import {
  Card,
  Badge,
  Avatar,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Modal,
  ErrorBanner,
  EmptyState,
  PageSpinner,
  formatDateTime,
  titleCase,
} from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const canManage = event && user && String(event.createdBy?._id) === String(user._id);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await eventApi.getById(id);
      setEvent(data?.event || data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <PageSpinner label="Loading event..." />;
  if (error || !event) return <EmptyState title="Event not found" description={error} />;

  const deadlinePassed = new Date() > new Date(event.registrationDeadline);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="brand">{titleCase(event.type)}</Badge>
                <Badge>{titleCase(event.status)}</Badge>
              </div>
              <h1 className="mt-2 text-xl font-bold text-slate-900">{event.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{titleCase(event.sport)}</p>
            </div>
            {canManage && (
              <Link to={`/events/${event._id}/edit`} className="btn-secondary">
                <Pencil size={14} /> Edit
              </Link>
            )}
          </div>

          {event.organization && (
            <Link
              to={`/organizations/${event.organization._id}`}
              className="mt-4 flex items-center gap-2 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50"
            >
              <Avatar name={event.organization.name} src={event.organization.logoUrl} size={36} />
              <div>
                <p className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                  {event.organization.name}
                  {event.organization.verificationStatus === "VERIFIED" && (
                    <BadgeCheck size={14} className="text-brand-600" />
                  )}
                </p>
                <p className="text-xs text-slate-400">{titleCase(event.organization.type)}</p>
              </div>
            </Link>
          )}

          {event.description && <p className="mt-4 whitespace-pre-line text-sm text-slate-600">{event.description}</p>}

          {event.positionsRequired?.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Positions needed</p>
              <div className="flex flex-wrap gap-1.5">
                {event.positionsRequired.map((p) => (
                  <Badge key={p}>{titleCase(p)}</Badge>
                ))}
              </div>
            </div>
          )}

          {(event.eligibility?.minimumAge || event.eligibility?.maximumAge || event.eligibility?.playingLevels?.length > 0) && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Eligibility</p>
              <ul className="space-y-1 text-sm text-slate-600">
                {(event.eligibility?.minimumAge || event.eligibility?.maximumAge) && (
                  <li>
                    Age: {event.eligibility?.minimumAge || "Any"} â€“ {event.eligibility?.maximumAge || "Any"}
                  </li>
                )}
                {event.eligibility?.gender && event.eligibility.gender !== "ANY" && (
                  <li>Gender: {titleCase(event.eligibility.gender)}</li>
                )}
                {event.eligibility?.playingLevels?.length > 0 && (
                  <li>Levels: {event.eligibility.playingLevels.map(titleCase).join(", ")}</li>
                )}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-slate-600">
              <CalendarDays size={15} className="text-slate-400" /> {formatDateTime(event.startDate)}
            </li>
            {event.location?.city && (
              <li className="flex items-center gap-2 text-slate-600">
                <MapPin size={15} className="text-slate-400" />
                {event.location.venueName ? `${event.location.venueName}, ` : ""}
                {event.location.city}, {event.location.state}
              </li>
            )}
            {event.capacity && (
              <li className="flex items-center gap-2 text-slate-600">
                <Users size={15} className="text-slate-400" />
                {event.applicationsCount || 0} / {event.capacity} applied
              </li>
            )}
            {event.registrationFee?.amount > 0 && (
              <li className="flex items-center gap-2 text-slate-600">
                <IndianRupee size={15} className="text-slate-400" />
                {event.registrationFee.amount} {event.registrationFee.currency}
              </li>
            )}
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            Registration {deadlinePassed ? "closed" : "closes"} {formatDateTime(event.registrationDeadline)}
          </p>

          {user?.role === "ATHLETE" && event.status === "PUBLISHED" && !canManage && (
            <Button
              className="mt-4 w-full"
              disabled={deadlinePassed || applied}
              onClick={() => setApplyOpen(true)}
            >
              <Send size={15} /> {applied ? "Application sent" : deadlinePassed ? "Registration closed" : "Apply now"}
            </Button>
          )}

          {canManage && (
            <Link to={`/events/${event._id}/applications`} className="btn-secondary mt-4 w-full">
              <Users size={15} /> View applications
            </Link>
          )}
        </Card>

        {(event.contactEmail || event.contactPhone) && (
          <Card className="p-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-800">Contact</h2>
            {event.contactEmail && <p className="text-sm text-slate-600">{event.contactEmail}</p>}
            {event.contactPhone && <p className="text-sm text-slate-600">{event.contactPhone}</p>}
          </Card>
        )}
      </div>

      {applyOpen && (
        <ApplyModal
          event={event}
          onClose={() => setApplyOpen(false)}
          onApplied={() => {
            setApplied(true);
            setApplyOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ApplyModal({ event, onClose, onApplied }) {
  const [form, setForm] = useState({ position: "", message: "", experience: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await applicationApi.create({ eventId: event._id, ...form });
      onApplied();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={`Apply to ${event.title}`} onClose={onClose} wide>
      <form onSubmit={onSubmit} className="space-y-3">
        <ErrorBanner message={error} />
        {event.positionsRequired?.length > 0 && (
          <Field label="Position" htmlFor="ap-position">
            <Select id="ap-position" value={form.position} onChange={(e) => update({ position: e.target.value })}>
              <option value="">Select a position</option>
              {event.positionsRequired.map((p) => (
                <option key={p} value={p}>
                  {titleCase(p)}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Message to organizer" htmlFor="ap-message">
          <Textarea
            id="ap-message"
            value={form.message}
            onChange={(e) => update({ message: e.target.value })}
            placeholder="Why should they consider you?"
          />
        </Field>
        <Field label="Relevant experience" htmlFor="ap-experience">
          <Textarea id="ap-experience" value={form.experience} onChange={(e) => update({ experience: e.target.value })} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Submit application
          </Button>
        </div>
      </form>
    </Modal>
  );
}

