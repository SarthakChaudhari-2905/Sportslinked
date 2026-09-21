import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { verificationApi } from "../../lib/endpoints";
import {
  Card,
  Avatar,
  Badge,
  Button,
  Modal,
  Field,
  Textarea,
  EmptyState,
  PageSpinner,
  ErrorBanner,
  formatDate,
  titleCase,
} from "../../components/ui";
import { getErrorMessage } from "../../lib/api";

export default function AdminVerifications() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(null);

  const load = async () => {
    try {
      const data = await verificationApi.getPending();
      setItems(data?.verifications || data || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (items === null) return <PageSpinner label="Loading pending requests..." />;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Pending verifications</h1>
      <p className="mt-1 text-sm text-slate-500">Review identity, athlete, organization and certificate requests.</p>

      <ErrorBanner message={error} />

      <div className="mt-4">
        {items.length === 0 ? (
          <EmptyState title="All caught up" description="No pending verification requests." />
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <Card key={r._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={`${r.user?.firstName || ""} ${r.user?.lastName || ""}`}
                    src={r.user?.avatar}
                    size={40}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {r.user?.firstName} {r.user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {titleCase(r.type)} Â· Submitted {formatDate(r.submittedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="amber">Pending</Badge>
                  <Button variant="secondary" onClick={() => setReviewing({ record: r, status: "APPROVED" })}>
                    <CheckCircle2 size={14} /> Approve
                  </Button>
                  <Button variant="ghost" className="text-rose-600" onClick={() => setReviewing({ record: r, status: "REJECTED" })}>
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {reviewing && (
        <ReviewModal
          record={reviewing.record}
          status={reviewing.status}
          onClose={() => setReviewing(null)}
          onDone={() => {
            setReviewing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({ record, status, onClose, onDone }) {
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { status, reviewNotes: notes || undefined };
      if (status === "REJECTED") payload.rejectionReason = reason || undefined;
      await verificationApi.review(record._id, payload);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={`${status === "APPROVED" ? "Approve" : "Reject"} verification`} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        <ErrorBanner message={error} />
        <p className="text-sm text-slate-600">
          {record.user?.firstName} {record.user?.lastName} Â· {titleCase(record.type)}
        </p>
        {status === "REJECTED" && (
          <Field label="Rejection reason" htmlFor="reason">
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        )}
        <Field label="Review notes" htmlFor="notes" hint="Optional, internal">
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
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

