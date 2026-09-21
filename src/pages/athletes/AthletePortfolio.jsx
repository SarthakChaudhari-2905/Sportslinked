import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Award, FileBadge, Video as VideoIcon } from "lucide-react";
import { achievementApi, certificateApi, videoApi, uploadApi } from "../../lib/endpoints";
import {
  Card,
  Tabs,
  Button,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
  Badge,
  EmptyState,
  PageSpinner,
  ErrorBanner,
  formatDate,
  titleCase,
} from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

const TABS = [
  { value: "achievements", label: "Achievements", icon: Award },
  { value: "certificates", label: "Certificates", icon: FileBadge },
  { value: "videos", label: "Videos", icon: VideoIcon },
];

export default function AthletePortfolio() {
  const [tab, setTab] = useState("achievements");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-bold text-slate-900">My portfolio</h1>
      <p className="mt-1 text-sm text-slate-500">Manage the achievements, certificates and videos on your profile.</p>

      <Card className="mt-5">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <div className="p-5">
          {tab === "achievements" && <AchievementsPanel />}
          {tab === "certificates" && <CertificatesPanel />}
          {tab === "videos" && <VideosPanel />}
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// ACHIEVEMENTS
// ==========================================

const ACHIEVEMENT_CATEGORIES = ["TOURNAMENT", "MEDAL", "AWARD", "RECORD", "CHAMPIONSHIP", "OTHER"];

function AchievementsPanel() {
  const [items, setItems] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const data = await achievementApi.getMine();
    setItems(data?.achievements || data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this achievement?")) return;
    try {
      await achievementApi.remove(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (items === null) return <PageSpinner label="Loading achievements..." />;

  return (
    <div>
      <ErrorBanner message={error} />
      <div className="mb-3 flex justify-end">
        <Button onClick={openCreate}>
          <Plus size={16} /> Add achievement
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Award} title="No achievements yet" description="Add medals, titles or records you've earned." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {titleCase(item.sport)} Â· {titleCase(item.category)} Â· {formatDate(item.achievementDate)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <IconBtn onClick={() => openEdit(item)} icon={Pencil} />
                  <IconBtn onClick={() => handleDelete(item._id)} icon={Trash2} danger />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AchievementModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AchievementModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    sport: initial?.sport || "",
    category: initial?.category || "TOURNAMENT",
    position: initial?.position || "",
    organization: initial?.organization || "",
    achievementDate: initial?.achievementDate ? initial.achievementDate.substring(0, 10) : "",
    rank: initial?.rank ?? "",
    isPublic: initial?.isPublic ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        sport: form.sport.toLowerCase(),
        rank: form.rank !== "" ? Number(form.rank) : undefined,
        achievementDate: new Date(form.achievementDate).toISOString(),
      };
      if (initial) await achievementApi.update(initial._id, payload);
      else await achievementApi.create(payload);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={initial ? "Edit achievement" : "Add achievement"} onClose={onClose} wide>
      <form onSubmit={onSubmit} className="space-y-3">
        <ErrorBanner message={error} />
        <Field label="Title" htmlFor="a-title">
          <Input id="a-title" required value={form.title} onChange={(e) => update({ title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sport" htmlFor="a-sport">
            <Input id="a-sport" required value={form.sport} onChange={(e) => update({ sport: e.target.value })} />
          </Field>
          <Field label="Category" htmlFor="a-category">
            <Select id="a-category" value={form.category} onChange={(e) => update({ category: e.target.value })}>
              {ACHIEVEMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Organization" htmlFor="a-org">
            <Input id="a-org" value={form.organization} onChange={(e) => update({ organization: e.target.value })} />
          </Field>
          <Field label="Date" htmlFor="a-date">
            <Input
              id="a-date"
              type="date"
              required
              value={form.achievementDate}
              onChange={(e) => update({ achievementDate: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Position / result" htmlFor="a-position">
            <Input id="a-position" value={form.position} onChange={(e) => update({ position: e.target.value })} />
          </Field>
          <Field label="Rank" htmlFor="a-rank">
            <Input id="a-rank" type="number" min="1" value={form.rank} onChange={(e) => update({ rank: e.target.value })} />
          </Field>
        </div>
        <Field label="Description" htmlFor="a-description">
          <Textarea id="a-description" value={form.description} onChange={(e) => update({ description: e.target.value })} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.isPublic} onChange={(e) => update({ isPublic: e.target.checked })} />
          Show on my public profile
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// CERTIFICATES
// ==========================================

const CERT_CATEGORIES = ["SPORTS", "COACHING", "TOURNAMENT", "FITNESS", "EDUCATION", "OTHER"];

function CertificatesPanel() {
  const [items, setItems] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const data = await certificateApi.getMine();
    setItems(data?.certificates || data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this certificate?")) return;
    try {
      await certificateApi.remove(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (items === null) return <PageSpinner label="Loading certificates..." />;

  return (
    <div>
      <ErrorBanner message={error} />
      <div className="mb-3 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Add certificate
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={FileBadge} title="No certificates yet" description="Add coaching or sports certifications." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.issuingOrganization} Â· {formatDate(item.issueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge tone={item.verificationStatus === "VERIFIED" ? "green" : "slate"}>
                    {titleCase(item.verificationStatus)}
                  </Badge>
                  <IconBtn
                    onClick={() => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                    icon={Pencil}
                  />
                  <IconBtn onClick={() => handleDelete(item._id)} icon={Trash2} danger />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CertificateModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CertificateModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    issuingOrganization: initial?.issuingOrganization || "",
    category: initial?.category || "SPORTS",
    sport: initial?.sport || "",
    issueDate: initial?.issueDate ? initial.issueDate.substring(0, 10) : "",
    expiryDate: initial?.expiryDate ? initial.expiryDate.substring(0, 10) : "",
    certificateNumber: initial?.certificateNumber || "",
    description: initial?.description || "",
    documentUrl: initial?.documentUrl || "",
    isPublic: initial?.isPublic ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.upload(file, "certificates");
      update({ documentUrl: url });
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
    try {
      const payload = {
        ...form,
        sport: form.sport.toLowerCase(),
        issueDate: new Date(form.issueDate).toISOString(),
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
        documentUrl: form.documentUrl || undefined,
      };
      if (initial) await certificateApi.update(initial._id, payload);
      else await certificateApi.create(payload);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={initial ? "Edit certificate" : "Add certificate"} onClose={onClose} wide>
      <form onSubmit={onSubmit} className="space-y-3">
        <ErrorBanner message={error} />
        <Field label="Title" htmlFor="c-title">
          <Input id="c-title" required value={form.title} onChange={(e) => update({ title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Issuing organization" htmlFor="c-org">
            <Input
              id="c-org"
              required
              value={form.issuingOrganization}
              onChange={(e) => update({ issuingOrganization: e.target.value })}
            />
          </Field>
          <Field label="Category" htmlFor="c-category">
            <Select id="c-category" value={form.category} onChange={(e) => update({ category: e.target.value })}>
              {CERT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sport" htmlFor="c-sport">
            <Input id="c-sport" required value={form.sport} onChange={(e) => update({ sport: e.target.value })} />
          </Field>
          <Field label="Certificate number" htmlFor="c-number">
            <Input
              id="c-number"
              value={form.certificateNumber}
              onChange={(e) => update({ certificateNumber: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Issue date" htmlFor="c-issue">
            <Input
              id="c-issue"
              type="date"
              required
              value={form.issueDate}
              onChange={(e) => update({ issueDate: e.target.value })}
            />
          </Field>
          <Field label="Expiry date" htmlFor="c-expiry" hint="Optional">
            <Input
              id="c-expiry"
              type="date"
              value={form.expiryDate}
              onChange={(e) => update({ expiryDate: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Description" htmlFor="c-description">
          <Textarea id="c-description" value={form.description} onChange={(e) => update({ description: e.target.value })} />
        </Field>
        <Field label="Certificate document" htmlFor="c-file" hint={form.documentUrl ? "File uploaded" : "PDF or image"}>
          <input id="c-file" type="file" onChange={handleFile} disabled={uploading} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.isPublic} onChange={(e) => update({ isPublic: e.target.checked })} />
          Show on my public profile
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving || uploading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// VIDEOS
// ==========================================

const VIDEO_CATEGORIES = ["MATCH_HIGHLIGHT", "TRAINING", "SKILLS", "FULL_MATCH", "INTERVIEW", "OTHER"];

function VideosPanel() {
  const [items, setItems] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const data = await videoApi.getMine();
    setItems(data?.videos || data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this video?")) return;
    try {
      await videoApi.remove(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (items === null) return <PageSpinner label="Loading videos..." />;

  return (
    <div>
      <ErrorBanner message={error} />
      <div className="mb-3 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Add video
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={VideoIcon} title="No videos yet" description="Upload highlight reels or training clips." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-lg border border-slate-100">
              <div className="flex aspect-video items-center justify-center bg-slate-900">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <VideoIcon className="text-white/60" size={28} />
                )}
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">{item.title}</p>
                  <p className="text-[11px] text-slate-400">{titleCase(item.category)}</p>
                </div>
                <div className="flex gap-1">
                  <IconBtn
                    onClick={() => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                    icon={Pencil}
                  />
                  <IconBtn onClick={() => handleDelete(item._id)} icon={Trash2} danger />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <VideoModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function VideoModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    sport: initial?.sport || "",
    category: initial?.category || "MATCH_HIGHLIGHT",
    position: initial?.position || "",
    videoUrl: initial?.videoUrl || "",
    thumbnailUrl: initial?.thumbnailUrl || "",
    visibility: initial?.visibility || "PUBLIC",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleFile = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.upload(file, "videos");
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
    try {
      const payload = { ...form, sport: form.sport.toLowerCase() };
      if (initial) await videoApi.update(initial._id, payload);
      else await videoApi.create(payload);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={initial ? "Edit video" : "Add video"} onClose={onClose} wide>
      <form onSubmit={onSubmit} className="space-y-3">
        <ErrorBanner message={error} />
        <Field label="Title" htmlFor="v-title">
          <Input id="v-title" required value={form.title} onChange={(e) => update({ title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sport" htmlFor="v-sport">
            <Input id="v-sport" required value={form.sport} onChange={(e) => update({ sport: e.target.value })} />
          </Field>
          <Field label="Category" htmlFor="v-category">
            <Select id="v-category" value={form.category} onChange={(e) => update({ category: e.target.value })}>
              {VIDEO_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Video file" htmlFor="v-file" hint={form.videoUrl ? "Video uploaded" : "MP4 recommended"}>
          <input id="v-file" type="file" accept="video/*" onChange={(e) => handleFile(e, "videoUrl")} disabled={uploading} />
        </Field>
        <Field label="Thumbnail" htmlFor="v-thumb" hint="Optional">
          <input id="v-thumb" type="file" accept="image/*" onChange={(e) => handleFile(e, "thumbnailUrl")} disabled={uploading} />
        </Field>
        <Field label="Description" htmlFor="v-description">
          <Textarea id="v-description" value={form.description} onChange={(e) => update({ description: e.target.value })} />
        </Field>
        <Field label="Visibility" htmlFor="v-visibility">
          <Select id="v-visibility" value={form.visibility} onChange={(e) => update({ visibility: e.target.value })}>
            <option value="PUBLIC">Public</option>
            <option value="CONNECTIONS">Connections only</option>
            <option value="PRIVATE">Private</option>
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving || uploading} disabled={!form.videoUrl}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function IconBtn({ icon: Icon, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md p-1.5 ${danger ? "text-rose-500 hover:bg-rose-50" : "text-slate-400 hover:bg-slate-100"}`}
    >
      <Icon size={15} />
    </button>
  );
}

