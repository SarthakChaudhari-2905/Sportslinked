import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Medal, Building2, Briefcase, Search as SearchIcon, Check, Eye, EyeOff } from "lucide-react";
import Logo from "../../components/brand/Logo";
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="page-gradient flex min-h-screen">
      <AuthShowcase />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-10">
        {/* ambient branding behind the form */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-brand-100/70 blur-3xl" />
          <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="scale-90 opacity-[0.07] sm:scale-100">
              <Logo size={320} withText={false} />
            </div>
          </div>
        </div>

        <div className="relative fade-up w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Logo size={52} />
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={clsx(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition",
                    step >= s ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"
                  )}
                >
                  {step > s ? <Check size={12} /> : s}
                </span>
                {s === 1 && <span className="h-px w-10 bg-slate-200" />}
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Step {step} of 2 — {step === 1 ? "choose your account type" : "your details"}
          </p>

          {step === 1 && (
            <div className="mt-6 space-y-2.5">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => update({ role: r.value })}
                  className={clsx(
                    "group flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition duration-200",
                    form.role === r.value
                      ? "border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10 ring-1 ring-brand-500"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
                  )}
                >
                  <span
                    className={clsx(
                      "rounded-xl p-2.5 transition",
                      form.role === r.value
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700"
                    )}
                  >
                    <r.icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between">
                      <span className="block text-sm font-bold text-slate-800">{r.label}</span>
                      {form.role === r.value && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                          <Check size={11} />
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-slate-500">{r.desc}</span>
                  </span>
                </button>
              ))}
              <Button type="button" onClick={() => setStep(2)} className="mt-4 w-full py-3">
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
                    placeholder="First"
                  />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <Input
                    id="lastName"
                    required
                    value={form.lastName}
                    onChange={(e) => update({ lastName: e.target.value })}
                    placeholder="Last"
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
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone" htmlFor="phone" hint="Optional">
                <Input id="phone" value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
              </Field>
              <Field label="Password" htmlFor="password" hint="Minimum 8 characters">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => update({ password: e.target.value })}
                    placeholder="••••••••"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" loading={loading} className="flex-1 py-3">
                  Create account
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-brand-700 transition hover:text-brand-800 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}