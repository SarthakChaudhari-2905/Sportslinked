import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Trophy, Medal, Building2, Briefcase, Search as SearchIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Field, Input, ErrorBanner } from "../../components/ui";
import { getErrorMessage } from "../../lib/api";
import AuthShowcase from "./AuthShowcase";

const ROLES = [
  { value: "ATHLETE", label: "Athlete", desc: "Showcase your profile & apply to opportunities", icon: Medal },
  { value: "CLUB", label: "Club", desc: "Recruit athletes & host events", icon: Building2 },
  { value: "ACADEMY", label: "Academy", desc: "Run trials, camps & training programs", icon: Building2 },
  { value: "AGENCY", label: "Agency", desc: "Represent and place athletes", icon: Briefcase },
  { value: "SCOUT", label: "Scout", desc: "Discover and evaluate talent", icon: SearchIcon },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    role: "ATHLETE",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.username?.trim()) delete payload.username;
      if (!payload.phone?.trim()) delete payload.phone;
      await register(payload);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthShowcase />

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 text-brand-700 lg:hidden">
            <Trophy size={26} />
            <span className="text-xl font-extrabold">SportLinked</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Step {step} of 2 â€” {step === 1 ? "choose your account type" : "your details"}
          </p>

          {step === 1 && (
            <div className="mt-6 space-y-2.5">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => update({ role: r.value })}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition",
                    form.role === r.value
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <span
                    className={clsx(
                      "rounded-lg p-2",
                      form.role === r.value ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <r.icon size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">{r.label}</span>
                    <span className="block text-xs text-slate-500">{r.desc}</span>
                  </span>
                </button>
              ))}
              <Button type="button" onClick={() => setStep(2)} className="mt-4 w-full">
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <ErrorBanner message={error} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" htmlFor="firstName">
                  <Input
                    id="firstName"
                    required
                    value={form.firstName}
                    onChange={(e) => update({ firstName: e.target.value })}
                  />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <Input
                    id="lastName"
                    required
                    value={form.lastName}
                    onChange={(e) => update({ lastName: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Username" htmlFor="username" hint="Optional, lowercase letters, numbers, . and _">
                <Input id="username" value={form.username} onChange={(e) => update({ username: e.target.value })} />
              </Field>
              <Field label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                />
              </Field>
              <Field label="Phone" htmlFor="phone" hint="Optional">
                <Input id="phone" value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
              </Field>
              <Field label="Password" htmlFor="password" hint="Minimum 8 characters">
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update({ password: e.target.value })}
                />
              </Field>

              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  Create account
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

