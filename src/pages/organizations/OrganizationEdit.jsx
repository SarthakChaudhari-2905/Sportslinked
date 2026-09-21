import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ExternalLink } from "lucide-react";
import { organizationApi, uploadApi } from "../../lib/endpoints";
import {
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Badge,
  ErrorBanner,
  SuccessBanner,
  PageSpinner,
  Avatar,
  titleCase,
} from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

const ORG_TYPES = ["CLUB", "ACADEMY", "AGENCY", "SPORTS_ASSOCIATION", "EVENT_ORGANIZER"];

const emptyForm = {
  name: "",
  slug: "",
  type: "CLUB",
  description: "",
  sports: "",
  email: "",
  phone: "",
  website: "",
  city: "",
  state: "",
  country: "India",
  logoUrl: "",
  coverImageUrl: "",
};

export default function OrganizationEdit() {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await organizationApi.getMine();
      const memberships = data?.organizations || data || [];
      const first = memberships[0]?.organization || null;
      setOrg(first);
      if (first) {
        setForm({
          name: first.name || "",
          slug: first.slug || "",
          type: first.type || "CLUB",
          description: first.description || "",
          sports: (first.sports || []).join(", "),
          email: first.email || "",
          phone: first.phone || "",
          website: first.website || "",
          city: first.location?.city || "",
          state: first.location?.state || "",
          country: first.location?.country || "India",
          logoUrl: first.logoUrl || "",
          coverImageUrl: first.coverImageUrl || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.upload(file, "organizations");
      update({ [field]: url });
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
        name: form.name,
        type: form.type,
        description: form.description || undefined,
        sports: form.sports.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
        email: form.email || undefined,
        phone: form.phone || undefined,
        website: form.website || undefined,
        location: { city: form.city || undefined, state: form.state || undefined, country: form.country || undefined },
        logoUrl: form.logoUrl || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
      };
      if (org) {
        const updated = await organizationApi.update(org._id, payload);
        setOrg(updated?.organization || updated);
      } else {
        payload.slug = form.slug.trim().toLowerCase();
        const created = await organizationApi.create(payload);
        setOrg(created?.organization || created);
      }
      setSuccess("Organization saved.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900">{org ? "Organization settings" : "Create your organization"}</h1>
      <p className="mt-1 text-sm text-slate-500">
        This is your public page for posting events and discovering athletes.
      </p>

      {org && (
        <Card className="mt-5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={org.name} src={org.logoUrl} size={48} />
              <div>
                <p className="text-sm font-semibold text-slate-800">{org.name}</p>
                <div className="mt-0.5 flex gap-1.5">
                  <Badge tone="brand">{titleCase(org.type)}</Badge>
                  <Badge tone={org.verificationStatus === "VERIFIED" ? "green" : "slate"}>
                    {titleCase(org.verificationStatus)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/organizations/${org._id}`} className="btn-ghost">
                <ExternalLink size={15} /> View
              </Link>
              <Link to={`/organization/${org._id}/events`} className="btn-secondary">
                <CalendarDays size={15} /> Manage events
              </Link>
            </div>
          </div>
        </Card>
      )}

      <Card className="mt-5 p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <div className="flex items-center gap-4">
            <Avatar name={form.name || "Org"} src={form.logoUrl} size={56} />
            <label className="btn-secondary cursor-pointer">
              {uploading ? "Uploading..." : "Upload logo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "logoUrl")} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Organization name" htmlFor="o-name">
              <Input id="o-name" required value={form.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="Type" htmlFor="o-type">
              <Select id="o-type" value={form.type} onChange={(e) => update({ type: e.target.value })}>
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {titleCase(t)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {!org && (
            <Field label="Slug" htmlFor="o-slug" hint="Lowercase letters, numbers and hyphens â€” used in your public URL">
              <Input
                id="o-slug"
                required
                value={form.slug}
                onChange={(e) => update({ slug: e.target.value })}
                placeholder="mumbai-united-fc"
              />
            </Field>
          )}

          <Field label="Description" htmlFor="o-description">
            <Textarea id="o-description" value={form.description} onChange={(e) => update({ description: e.target.value })} />
          </Field>

          <Field label="Sports" htmlFor="o-sports" hint="Comma-separated, e.g. football, athletics">
            <Input id="o-sports" required value={form.sports} onChange={(e) => update({ sports: e.target.value })} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" htmlFor="o-email">
              <Input id="o-email" type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} />
            </Field>
            <Field label="Phone" htmlFor="o-phone">
              <Input id="o-phone" value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
            </Field>
          </div>

          <Field label="Website" htmlFor="o-website">
            <Input id="o-website" value={form.website} onChange={(e) => update({ website: e.target.value })} placeholder="https://..." />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="City" htmlFor="o-city">
              <Input id="o-city" value={form.city} onChange={(e) => update({ city: e.target.value })} />
            </Field>
            <Field label="State" htmlFor="o-state">
              <Input id="o-state" value={form.state} onChange={(e) => update({ state: e.target.value })} />
            </Field>
            <Field label="Country" htmlFor="o-country">
              <Input id="o-country" value={form.country} onChange={(e) => update({ country: e.target.value })} />
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving}>
              {org ? "Save changes" : "Create organization"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

