import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { athleteProfileApi, uploadApi, authApi } from "../../lib/endpoints";
import {
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  ErrorBanner,
  SuccessBanner,
  Avatar,
  PageSpinner,
} from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

const emptyForm = {
  bio: "",
  primarySport: "",
  secondarySports: "",
  position: "",
  secondaryPosition: "",
  heightCm: "",
  weightKg: "",
  preferredFoot: "",
  yearsOfExperience: "",
  playingLevel: "BEGINNER",
  dateOfBirth: "",
  gender: "",
  city: "",
  state: "",
  country: "India",
  availabilityStatus: "OPEN_TO_OPPORTUNITIES",
  instagram: "",
  youtube: "",
  linkedin: "",
  website: "",
  visibility: "PUBLIC",
  searchable: true,
};

export default function AthleteProfileEdit() {
  const { user, updateUserLocal } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await athleteProfileApi.getMine();
        const p = data?.profile || data;
        setExists(true);
        setForm({
          bio: p.bio || "",
          primarySport: p.primarySport || "",
          secondarySports: (p.secondarySports || []).join(", "),
          position: p.position || "",
          secondaryPosition: p.secondaryPosition || "",
          heightCm: p.heightCm ?? "",
          weightKg: p.weightKg ?? "",
          preferredFoot: p.preferredFoot || "",
          yearsOfExperience: p.yearsOfExperience ?? "",
          playingLevel: p.playingLevel || "BEGINNER",
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : "",
          gender: p.gender || "",
          city: p.location?.city || "",
          state: p.location?.state || "",
          country: p.location?.country || "India",
          availabilityStatus: p.availability?.status || "OPEN_TO_OPPORTUNITIES",
          instagram: p.socialLinks?.instagram || "",
          youtube: p.socialLinks?.youtube || "",
          linkedin: p.socialLinks?.linkedin || "",
          website: p.socialLinks?.website || "",
          visibility: p.visibility || "PUBLIC",
          searchable: p.searchable ?? true,
        });
      } catch {
        setExists(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError("");
    try {
      const { url } = await uploadApi.upload(file, "avatars");
      const { user: updated } = await authApi.updateMe({ avatar: url });
      updateUserLocal({ avatar: updated?.avatar || url });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAvatarUploading(false);
    }
  };

  const buildPayload = () => {
    const payload = {
      bio: form.bio || undefined,
      primarySport: form.primarySport.trim().toLowerCase(),
      secondarySports: form.secondarySports
        ? form.secondarySports.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
        : undefined,
      position: form.position || undefined,
      secondaryPosition: form.secondaryPosition || undefined,
      heightCm: form.heightCm ? Number(form.heightCm) : undefined,
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      preferredFoot: form.preferredFoot || undefined,
      yearsOfExperience: form.yearsOfExperience !== "" ? Number(form.yearsOfExperience) : undefined,
      playingLevel: form.playingLevel || undefined,
      gender: form.gender || undefined,
      dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
      location: {
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
      },
      availability: { status: form.availabilityStatus },
      socialLinks: {
        instagram: form.instagram || undefined,
        youtube: form.youtube || undefined,
        linkedin: form.linkedin || undefined,
        website: form.website || undefined,
      },
      visibility: form.visibility,
      searchable: form.searchable,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    return payload;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = buildPayload();
      if (exists) {
        await athleteProfileApi.update(payload);
      } else {
        await athleteProfileApi.create(payload);
      }
      setSuccess("Profile saved successfully.");
      setTimeout(() => navigate("/profile"), 600);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900">{exists ? "Edit profile" : "Create your athlete profile"}</h1>
      <p className="mt-1 text-sm text-slate-500">
        This information is shown to clubs, academies and scouts browsing SportLinked.
      </p>

      <Card className="mt-5 p-5">
        <div className="mb-5 flex items-center gap-4">
          <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} size={64} />
          <div>
            <label className="btn-secondary cursor-pointer">
              {avatarUploading ? "Uploading..." : "Change photo"}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <Field label="Bio" htmlFor="bio">
            <Textarea
              id="bio"
              maxLength={1000}
              value={form.bio}
              onChange={(e) => update({ bio: e.target.value })}
              placeholder="Tell clubs and scouts about your journey..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary sport" htmlFor="primarySport">
              <Input
                id="primarySport"
                required
                value={form.primarySport}
                onChange={(e) => update({ primarySport: e.target.value })}
                placeholder="football"
              />
            </Field>
            <Field label="Playing level" htmlFor="playingLevel">
              <Select
                id="playingLevel"
                value={form.playingLevel}
                onChange={(e) => update({ playingLevel: e.target.value })}
              >
                {["BEGINNER", "AMATEUR", "SCHOOL", "COLLEGE", "DISTRICT", "STATE", "NATIONAL", "INTERNATIONAL", "PROFESSIONAL"].map(
                  (lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  )
                )}
              </Select>
            </Field>
          </div>

          <Field label="Secondary sports" htmlFor="secondarySports" hint="Comma-separated, e.g. futsal, athletics">
            <Input
              id="secondarySports"
              value={form.secondarySports}
              onChange={(e) => update({ secondarySports: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Position" htmlFor="position">
              <Input id="position" value={form.position} onChange={(e) => update({ position: e.target.value })} />
            </Field>
            <Field label="Secondary position" htmlFor="secondaryPosition">
              <Input
                id="secondaryPosition"
                value={form.secondaryPosition}
                onChange={(e) => update({ secondaryPosition: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Height (cm)" htmlFor="heightCm">
              <Input
                id="heightCm"
                type="number"
                value={form.heightCm}
                onChange={(e) => update({ heightCm: e.target.value })}
              />
            </Field>
            <Field label="Weight (kg)" htmlFor="weightKg">
              <Input
                id="weightKg"
                type="number"
                value={form.weightKg}
                onChange={(e) => update({ weightKg: e.target.value })}
              />
            </Field>
            <Field label="Experience (yrs)" htmlFor="yearsOfExperience">
              <Input
                id="yearsOfExperience"
                type="number"
                value={form.yearsOfExperience}
                onChange={(e) => update({ yearsOfExperience: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Preferred foot" htmlFor="preferredFoot">
              <Select
                id="preferredFoot"
                value={form.preferredFoot}
                onChange={(e) => update({ preferredFoot: e.target.value })}
              >
                <option value="">Not applicable</option>
                <option value="LEFT">Left</option>
                <option value="RIGHT">Right</option>
                <option value="BOTH">Both</option>
                <option value="NOT_APPLICABLE">Not applicable</option>
              </Select>
            </Field>
            <Field label="Date of birth" htmlFor="dateOfBirth">
              <Input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update({ dateOfBirth: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender" htmlFor="gender">
              <Select id="gender" value={form.gender} onChange={(e) => update({ gender: e.target.value })}>
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </Select>
            </Field>
            <Field label="Availability" htmlFor="availabilityStatus">
              <Select
                id="availabilityStatus"
                value={form.availabilityStatus}
                onChange={(e) => update({ availabilityStatus: e.target.value })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="OPEN_TO_OPPORTUNITIES">Open to opportunities</option>
                <option value="NOT_AVAILABLE">Not available</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="City" htmlFor="city">
              <Input id="city" value={form.city} onChange={(e) => update({ city: e.target.value })} />
            </Field>
            <Field label="State" htmlFor="state">
              <Input id="state" value={form.state} onChange={(e) => update({ state: e.target.value })} />
            </Field>
            <Field label="Country" htmlFor="country">
              <Input id="country" value={form.country} onChange={(e) => update({ country: e.target.value })} />
            </Field>
          </div>

          <p className="pt-2 text-sm font-semibold text-slate-700">Social links</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram" htmlFor="instagram">
              <Input
                id="instagram"
                value={form.instagram}
                onChange={(e) => update({ instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </Field>
            <Field label="YouTube" htmlFor="youtube">
              <Input
                id="youtube"
                value={form.youtube}
                onChange={(e) => update({ youtube: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </Field>
            <Field label="LinkedIn" htmlFor="linkedin">
              <Input
                id="linkedin"
                value={form.linkedin}
                onChange={(e) => update({ linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </Field>
            <Field label="Website" htmlFor="website">
              <Input
                id="website"
                value={form.website}
                onChange={(e) => update({ website: e.target.value })}
                placeholder="https://..."
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Profile visibility" htmlFor="visibility">
              <Select id="visibility" value={form.visibility} onChange={(e) => update({ visibility: e.target.value })}>
                <option value="PUBLIC">Public</option>
                <option value="CONNECTIONS">Connections only</option>
                <option value="PRIVATE">Private</option>
              </Select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.searchable}
                onChange={(e) => update({ searchable: e.target.checked })}
              />
              Show me in athlete search results
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" loading={saving}>
              {exists ? "Save changes" : "Create profile"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

