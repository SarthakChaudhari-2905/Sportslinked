import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <p className="text-lg font-semibold text-slate-800">Page not found</p>
      <Link to="/" className="btn-primary mt-2">
        Go home
      </Link>
    </div>
  );
}

