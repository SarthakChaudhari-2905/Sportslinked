import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  BadgeCheck,
  Pencil,
  Ruler,
  Weight,
  Calendar,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  Award,
  FileBadge,
  Video as VideoIcon,
  UserPlus,
  MessageCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  athleteProfileApi,
  achievementApi,
  certificateApi,
  videoApi,
  connectionApi,
  messageApi,
} from "../../lib/endpoints";
import { Card, Badge, Avatar, PageSpinner, EmptyState, Button, formatDate, titleCase } from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

export default function AthleteProfile({ mine = false }) {
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const targetUserId = mine ? authUser._id : userId;
  const isOwn = authUser?._id === targetUserId;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const profileData = mine
          ? await athleteProfileApi.getMine()
          : await athleteProfileApi.getPublic(userId);
        setProfile(profileData?.profile || profileData);

        const [ach, certs, vids] = await Promise.allSettled([
          mine ? achievementApi.getMine() : achievementApi.getPublic(userId),
          mine ? certificateApi.getMine() : certificateApi.getPublic(userId),
          mine ? videoApi.getMine() : videoApi.getPublic(userId),
        ]);
        if (ach.status === "fulfilled") setAchievements(ach.value?.achievements || ach.value || []);
        if (certs.status === "fulfilled") setCertificates(certs.value?.certificates || certs.value || []);
        if (vids.status === "fulfilled") setVideos(vids.value?.videos || vids.value || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [mine, userId]);

  if (loading) return <PageSpinner label="Loading profile..." />;

  if (error || !profile) {
    return (
      <EmptyState
        title="Profile unavailable"
        description={error || (mine ? "You haven't created your athlete profile yet." : "This profile could not be found.")}
        action={
          mine && (
            <Link to="/profile/edit" className="btn-primary mt-2">
              Create profile
            </Link>
          )
        }
      />
    );
  }

  const u = profile.user || {};
  const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  const verified = u.identityVerification?.status === "APPROVED";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-brand-600 to-brand-800" />
          <div className="px-5 pb-5">
            <div className="-mt-10 flex items-end justify-between">
              <Avatar name={fullName} src={u.avatar} size={80} />
              {isOwn && (
                <Link to="/profile/edit" className="btn-secondary mt-12">
                  <Pencil size={14} /> Edit profile
                </Link>
              )}
              {!isOwn && <ConnectAction targetUserId={u._id} />}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-slate-900">{fullName || u.username}</h1>
              {verified && <BadgeCheck size={18} className="text-brand-600" />}
            </div>
            <p className="text-sm text-slate-500">
              {titleCase(profile.primarySport)}
              {profile.position ? ` - ${titleCase(profile.position)}` : ""} - {titleCase(profile.playingLevel)}
            </p>
            {profile.location?.city && (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <MapPin size={13} />
                {profile.location.city}
                {profile.location.state ? `, ${profile.location.state}` : ""}, {profile.location.country}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone={availabilityTone(profile.availability?.status)}>
                {titleCase(profile.availability?.status || "")}
              </Badge>
              {profile.secondarySports?.map((s) => (
                <Badge key={s}>{titleCase(s)}</Badge>
              ))}
            </div>
            {profile.bio && <p className="mt-4 whitespace-pre-line text-sm text-slate-600">{profile.bio}</p>}

            <div className="mt-4 flex flex-wrap gap-3 text-slate-400">
              {profile.socialLinks?.instagram && (
                <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                  <Instagram size={18} />
                </a>
              )}
              {profile.socialLinks?.youtube && (
                <a href={profile.socialLinks.youtube} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                  <Youtube size={18} />
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                  <Linkedin size={18} />
                </a>
              )}
              {profile.socialLinks?.website && (
                <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                  <Globe size={18} />
                </a>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Award size={16} /> Achievements
          </h2>
          {achievements.length === 0 ? (
            <p className="text-sm text-slate-400">No achievements added yet.</p>
          ) : (
            <div className="space-y-3">
              {achievements.map((a) => (
                <div key={a._id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                    <Badge>{titleCase(a.category)}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {titleCase(a.sport)} {a.organization ? `- ${a.organization}` : ""} - {formatDate(a.achievementDate)}
                  </p>
                  {a.description && <p className="mt-1 text-xs text-slate-600">{a.description}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileBadge size={16} /> Certificates
          </h2>
          {certificates.length === 0 ? (
            <p className="text-sm text-slate-400">No certificates added yet.</p>
          ) : (
            <div className="space-y-3">
              {certificates.map((c) => (
                <div key={c._id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                    <Badge tone={c.verificationStatus === "VERIFIED" ? "green" : "slate"}>
                      {titleCase(c.verificationStatus)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {c.issuingOrganization} - {formatDate(c.issueDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <VideoIcon size={16} /> Highlight videos
          </h2>
          {videos.length === 0 ? (
            <p className="text-sm text-slate-400">No videos uploaded yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {videos.map((v) => (
                <a
                  key={v._id}
                  href={v.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-lg border border-slate-100"
                >
                  <div className="flex aspect-video items-center justify-center bg-slate-900">
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt={v.title} className="h-full w-full object-cover" />
                    ) : (
                      <VideoIcon className="text-white/60" size={28} />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-semibold text-slate-800">{v.title}</p>
                    <p className="text-[11px] text-slate-400">{titleCase(v.category)}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Athlete details</h2>
          <dl className="space-y-2.5 text-sm">
            {profile.dateOfBirth && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Calendar size={14} /> Date of birth
                </dt>
                <dd className="font-medium text-slate-700">{formatDate(profile.dateOfBirth)}</dd>
              </div>
            )}
            {profile.heightCm && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Ruler size={14} /> Height
                </dt>
                <dd className="font-medium text-slate-700">{profile.heightCm} cm</dd>
              </div>
            )}
            {profile.weightKg && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Weight size={14} /> Weight
                </dt>
                <dd className="font-medium text-slate-700">{profile.weightKg} kg</dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Experience</dt>
              <dd className="font-medium text-slate-700">{profile.yearsOfExperience ?? 0} yrs</dd>
            </div>
            {profile.preferredFoot && (
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Preferred foot</dt>
                <dd className="font-medium text-slate-700">{titleCase(profile.preferredFoot)}</dd>
              </div>
            )}
          </dl>
        </Card>

        {isOwn && (
          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-slate-800">Profile strength</h2>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-brand-600 transition-all"
                style={{ width: `${profile.profileCompletion || 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">{profile.profileCompletion || 0}% complete</p>
            <Link to="/profile/portfolio" className="btn-secondary mt-4 w-full">
              Manage achievements, certificates &amp; videos
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

function availabilityTone(status) {
  if (status === "AVAILABLE") return "green";
  if (status === "NOT_AVAILABLE") return "rose";
  return "amber";
}

// Connect / Message action shown on someone else's profile. Status is
// derived from the viewer's own connections list since there's no
// single "status with user X" endpoint.
function ConnectAction({ targetUserId }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("LOADING"); // LOADING | NONE | PENDING_OUT | PENDING_IN | ACCEPTED
  const [connectionId, setConnectionId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await connectionApi.mine();
        const list = data?.connections || [];
        const match = list.find((c) => c.otherUser?._id === targetUserId);

        if (cancelled) return;

        if (!match) {
          setStatus("NONE");
        } else if (match.status === "ACCEPTED") {
          setStatus("ACCEPTED");
          setConnectionId(match._id);
        } else if (match.direction === "OUTGOING") {
          setStatus("PENDING_OUT");
        } else {
          setStatus("PENDING_IN");
          setConnectionId(match._id);
        }
      } catch {
        if (!cancelled) setStatus("NONE");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  const handleConnect = async () => {
    setBusy(true);
    try {
      await connectionApi.request(targetUserId);
      setStatus("PENDING_OUT");
    } catch {
      // Leave status as-is; the person can retry.
    } finally {
      setBusy(false);
    }
  };

  const handleMessage = async () => {
    setBusy(true);
    try {
      const data = await messageApi.createConversation(targetUserId);
      const id = data?.conversation?._id || data?._id;
      if (id) navigate(`/messages?conversation=${id}`);
    } finally {
      setBusy(false);
    }
  };

  if (status === "LOADING") return <div className="mt-12" />;

  if (status === "ACCEPTED") {
    return (
      <Button variant="secondary" className="mt-12" onClick={handleMessage} loading={busy}>
        <MessageCircle size={14} /> Message
      </Button>
    );
  }

  if (status === "PENDING_OUT") {
    return (
      <Button variant="secondary" className="mt-12" disabled>
        <Clock size={14} /> Request sent
      </Button>
    );
  }

  if (status === "PENDING_IN") {
    return (
      <Link to="/network" className="btn-secondary mt-12">
        <UserPlus size={14} /> Respond to request
      </Link>
    );
  }

  return (
    <Button className="mt-12" onClick={handleConnect} loading={busy}>
      <UserPlus size={14} /> Connect
    </Button>
  );
}

