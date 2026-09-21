import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
} from "lucide-react";

import { verificationApi } from "../../lib/endpoints";

import {
  Card,
  Field,
  Select,
  Input,
  Button,
  Badge,
  ErrorBanner,
  SuccessBanner,
  PageSpinner,
  formatDate,
  titleCase,
} from "../../components/ui";

import { getErrorMessage } from "../../lib/api";

const TYPES = [
  "IDENTITY",
  "ATHLETE",
  "ORGANIZATION",
  "CERTIFICATE",
];

export default function Verification() {
  const [records, setRecords] = useState(null);

  const [form, setForm] = useState({
    type: "IDENTITY",
    provider: "",
    providerReference: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const data = await verificationApi.getMine();

      setRecords(
        data?.verifications ||
        data?.records ||
        data ||
        []
      );
    } catch {
      setRecords([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (patch) => {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        type: form.type,
      };

      if (form.provider.trim()) {
        payload.provider = form.provider.trim();
      }

      if (form.providerReference.trim()) {
        payload.providerReference =
          form.providerReference.trim();
      }

      await verificationApi.submit(payload);

      setSuccess(
        "Verification request submitted successfully."
      );

      setForm({
        type: "IDENTITY",
        provider: "",
        providerReference: "",
      });

      await load();
    } catch (err) {
      setError(
        getErrorMessage(err) ||
        "Unable to submit verification request."
      );
    } finally {
      setSaving(false);
    }
  };

  if (records === null) {
    return <PageSpinner label="Loading verification records..." />;
  }

  const statusIcon = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "APPROVED" || value === "VERIFIED") {
      return <ShieldCheck size={18} />;
    }

    if (value === "REJECTED") {
      return <ShieldX size={18} />;
    }

    return <Clock size={18} />;
  };

  const statusTone = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "APPROVED" || value === "VERIFIED") {
      return "green";
    }

    if (value === "REJECTED") {
      return "rose";
    }

    return "amber";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Verification
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Submit verification requests and track their status.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}
      {success && <SuccessBanner message={success} />}

      <Card>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Submit Verification Request
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Provide your verification details for review.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <Field label="Verification Type">
            <Select
              value={form.type}
              onChange={(e) =>
                update({ type: e.target.value })
              }
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {titleCase(type)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Provider">
            <Input
              value={form.provider}
              onChange={(e) =>
                update({ provider: e.target.value })
              }
              placeholder="e.g. Aadhaar, Federation, Club"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Reference ID">
              <Input
                value={form.providerReference}
                onChange={(e) =>
                  update({
                    providerReference: e.target.value,
                  })
                }
                placeholder="Enter verification/reference ID"
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Submitting..."
                : "Submit Verification"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Verification History
          </h2>
        </div>

        {records.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
            <ShieldAlert
              className="mx-auto mb-3 text-slate-400"
              size={30}
            />

            <p className="text-sm font-medium text-slate-700">
              No verification requests yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Submit a verification request using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => {
              const status =
                record.status ||
                record.verificationStatus ||
                "PENDING";

              return (
                <div
                  key={
                    record._id ||
                    record.id ||
                    index
                  }
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">
                        {statusIcon(status)}
                      </span>

                      <h3 className="font-semibold text-slate-800">
                        {titleCase(
                          record.type ||
                          "Verification"
                        )}
                      </h3>

                      <Badge tone={statusTone(status)}>
                        {titleCase(status)}
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-slate-500">
                      {record.provider && (
                        <p>
                          Provider: {record.provider}
                        </p>
                      )}

                      {record.providerReference && (
                        <p>
                          Reference:{" "}
                          {record.providerReference}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-slate-500">
                    {formatDate(
                      record.createdAt ||
                      record.created_at ||
                      record.updatedAt
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
