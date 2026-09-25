import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventApi, organizationApi, uploadApi } from "../../lib/endpoints";
import {
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  ErrorBanner,
  SuccessBanner,
  PageSpinner,
} from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

const EVENT_TYPES = ["MATCH", "TRIAL", "TOURNAMENT", "TRAINING", "CAMP", "SCOUTING_SESSION", "OTHER"];
const LEVELS = ["BEGINNER", "AMATEUR", "SCHOOL", "COLLEGE", "DISTRICT", "STATE", "NATIONAL", "INTERNATIONAL", "PROFESSIONAL"];

const emptyForm = {
  organizationId: "",
  title: "",
  description: "",
  type: "TRIAL",
  sport: "",
  positionsRequired: "",
  minimumAge: "",
  maximumAge: "",
  gender: "ANY",
  playingLevels: [],
  startDate: "",
  registrationDeadline: "",
  venueName: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  capacity: "",
  feeAmount: "",
  bannerUrl: "",
  contactEmail: "",
  contactPhone: "",
};

function toLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await organizationApi.getMine();
        const memberships = data?.organizations || data || [];
        const myOrgs = memberships.map((m) => m.organization).filter(Boolean);
        setOrgs(myOrgs);

        if (isEdit) {
          const evData = await eventApi.getById(id);
          const ev = evData?.event || evData;
          setForm({
            organizationId: ev.organization?._id || "",
            title: ev.title || "",
            description: ev.description || "",
            type: ev.type || "TRIAL",
            sport: ev.sport || "",
            positionsRequired: (ev.positionsRequired || []).join(", "),
            minimumAge: ev.eligibility?.minimumAge ?? "",
            maximumAge: ev.eligibility?.maximumAge ?? "",
            gender: ev.eligibility?.gender || "ANY",
            playingLevels: ev.eligibility?.playingLevels || [],
            startDate: toLocalInput(ev.startDate),
            registrationDeadline: toLocalInput(ev.registrationDeadline),
            venueName: ev.location?.venueName || "",
            address: ev.location?.address || "",
            city: ev.location?.city || "",
            state: ev.location?.state || "",
            country: ev.location?.country || "India",
            capacity: ev.capacity ?? "",
            feeAmount: ev.registrationFee?.amount ?? "",
            bannerUrl: ev.bannerUrl || "",
            contactEmail: ev.contactEmail || "",
            contactPhone: ev.contactPhone || "",
          });
        } else if (myOrgs[0]) {
          update({ organizationId: myOrgs[0]._id });
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleLevel = (lvl) => {
    setForm((f) => ({
      ...f,
      playingLevels: f.playingLevels.includes(lvl)
        ? f.playingLevels.filter((l) => l !== lvl)
        : [...f.playingLevels, lvl],
    }));
  };

  const handleBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.upload(file, "events");
      update({ bannerUrl: url });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        sport: form.sport.toLowerCase(),
        positionsRequired: form.positionsRequired
          ? form.positionsRequired.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        eligibility: {
          minimumAge: form.minimumAge !== "" ? Number(form.minimumAge) : undefined,
          maximumAge: form.maximumAge !== "" ? Number(form.maximumAge) : undefined,
          gender: form.gender,
          playingLevels: form.playingLevels,
        },
        startDate: new Date(form.startDate).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        location: {
          venueName: form.venueName || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          country: form.country || undefined,
        },
        capacity: form.capacity !== "" ? Number(form.capacity) : undefined,
        registrationFee: { amount: form.feeAmount !== "" ? Number(form.feeAmount) : 0, currency: "INR" },
        bannerUrl: form.bannerUrl || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
      };

      if (isEdit) {
        await eventApi.update(id, payload);
        setSuccess("Event updated.");
        setTimeout(() => navigate(`/events/${id}`), 500);
      } else {
  payload.organizationId = form.organizationId;

  await eventApi.create(payload);

  setSuccess(
    "Event created as a draft. You can publish it from Manage events."
  );

  setTimeout(() => {
    navigate(`/organization/${form.organizationId}/events`);
  }, 700);
}
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900">{isEdit ? "Edit event" : "Post a new event"}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {isEdit ? "Update the details of this event." : "New events are saved as drafts â€” publish when ready."}
      </p>

      <Card className="mt-5 p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          {!isEdit && (
            <Field label="Organization" htmlFor="e-org">
              <Select id="e-org" required value={form.organizationId} onChange={(e) => update({ organizationId: e.target.value })}>
                <option value="">Select organization</option>
                {orgs.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="Title" htmlFor="e-title">
            <Input id="e-title" required value={form.title} onChange={(e) => update({ title: e.target.value })} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" htmlFor="e-type">
              <Select id="e-type" value={form.type} onChange={(e) => update({ type: e.target.value })}>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Sport" htmlFor="e-sport">
              <Input id="e-sport" required value={form.sport} onChange={(e) => update({ sport: e.target.value })} />
            </Field>
          </div>

          <Field label="Description" htmlFor="e-description">
            <Textarea id="e-description" value={form.description} onChange={(e) => update({ description: e.target.value })} />
          </Field>

          <Field label="Positions required" htmlFor="e-positions" hint="Comma-separated, e.g. goalkeeper, striker">
            <Input id="e-positions" value={form.positionsRequired} onChange={(e) => update({ positionsRequired: e.target.value })} />
          </Field>

          <p className="pt-1 text-sm font-semibold text-slate-700">Eligibility</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Min age" htmlFor="e-minage">
              <Input id="e-minage" type="number" value={form.minimumAge} onChange={(e) => update({ minimumAge: e.target.value })} />
            </Field>
            <Field label="Max age" htmlFor="e-maxage">
              <Input id="e-maxage" type="number" value={form.maximumAge} onChange={(e) => update({ maximumAge: e.target.value })} />
            </Field>
            <Field label="Gender" htmlFor="e-gender">
              <Select id="e-gender" value={form.gender} onChange={(e) => update({ gender: e.target.value })}>
                <option value="ANY">Any</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="MIXED">Mixed</option>
              </Select>
            </Field>
          </div>
          <div>
            <p className="label">Playing levels</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => toggleLevel(lvl)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.playingLevels.includes(lvl)
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <p className="pt-1 text-sm font-semibold text-slate-700">Schedule</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date & time" htmlFor="e-start">
              <Input
                id="e-start"
                type="datetime-local"
                required
                value={form.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
              />
            </Field>
            <Field label="Registration deadline" htmlFor="e-deadline">
              <Input
                id="e-deadline"
                type="datetime-local"
                required
                value={form.registrationDeadline}
                onChange={(e) => update({ registrationDeadline: e.target.value })}
              />
            </Field>
          </div>

          <p className="pt-1 text-sm font-semibold text-slate-700">Location</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Venue name" htmlFor="e-venue">
              <Input id="e-venue" value={form.venueName} onChange={(e) => update({ venueName: e.target.value })} />
            </Field>
            <Field label="Address" htmlFor="e-address">
              <Input id="e-address" value={form.address} onChange={(e) => update({ address: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" htmlFor="e-city">
              <Input id="e-city" value={form.city} onChange={(e) => update({ city: e.target.value })} />
            </Field>
            <Field label="State" htmlFor="e-state">
              <Input id="e-state" value={form.state} onChange={(e) => update({ state: e.target.value })} />
            </Field>
            <Field label="Country" htmlFor="e-country">
              <Input id="e-country" value={form.country} onChange={(e) => update({ country: e.target.value })} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacity" htmlFor="e-capacity" hint="Optional">
              <Input id="e-capacity" type="number" value={form.capacity} onChange={(e) => update({ capacity: e.target.value })} />
            </Field>
            <Field label="Registration fee (INR)" htmlFor="e-fee">
              <Input id="e-fee" type="number" value={form.feeAmount} onChange={(e) => update({ feeAmount: e.target.value })} />
            </Field>
          </div>

          <Field label="Banner image" htmlFor="e-banner" hint={form.bannerUrl ? "Image uploaded" : "Optional"}>
            <input id="e-banner" type="file" accept="image/*" onChange={handleBanner} disabled={uploading} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact email" htmlFor="e-cemail">
              <Input id="e-cemail" type="email" value={form.contactEmail} onChange={(e) => update({ contactEmail: e.target.value })} />
            </Field>
            <Field label="Contact phone" htmlFor="e-cphone">
              <Input id="e-cphone" value={form.contactPhone} onChange={(e) => update({ contactPhone: e.target.value })} />
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving}>
              {isEdit ? "Save changes" : "Create event"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

