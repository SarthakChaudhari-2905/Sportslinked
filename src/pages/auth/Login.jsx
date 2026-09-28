import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Logo from "../../components/brand/Logo";
import { useAuth } from "../../context/AuthContext";
import { Button, Field, Input, ErrorBanner } from "../../components/ui";
import { getErrorMessage } from "../../lib/api";
import AuthShowcase from "./AuthShowcase";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-gradient flex min-h-screen">
      <AuthShowcase />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
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

        <div className="relative fade-up w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo size={52} />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            <Mail size={12} /> Athletes · Clubs · Scouts
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Sign in to your athlete or organization account.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <ErrorBanner message={error} />
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Lock
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
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
            <Button type="submit" loading={loading} className="w-full py-3">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to SportLinked?{" "}
            <Link to="/register" className="font-bold text-brand-700 transition hover:text-brand-800 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}