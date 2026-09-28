import clsx from "clsx";

// Inline SVG icons so this works with any lucide-react version
// (newer versions removed brand icons).
const icons = {
  instagram: (
    <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM17.5 6a1 1 0 110 2 1 1 0 010-2z" />
  ),
  youtube: (
    <path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
  ),
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9.75h4V21H3V9.75zm6.5 0h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.59V21h-4V9.75z" />
  ),
  twitter: (
    <path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.55l-5.13-6.71L5.2 22H1.94l7.6-8.68L1.5 2h6.72l4.64 6.13L18.244 2zm-1.14 18h1.8L7.02 3.9H5.1L17.104 20z" />
  ),
  facebook: (
    <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.3-.2-2.4-.2-2.6 0-4.3 1.6-4.3 4.4v2.5H7.3v3.3H10V22h3.5z" />
  ),
};

const links = [
  { key: "instagram", label: "Instagram", href: "https://instagram.com/" },
  { key: "youtube", label: "YouTube", href: "https://youtube.com/" },
  { key: "linkedin", label: "LinkedIn", href: "https://linkedin.com/" },
  { key: "twitter", label: "X / Twitter", href: "https://x.com/" },
  { key: "facebook", label: "Facebook", href: "https://facebook.com/" },
];

export default function SocialLinks({ variant = "dark", className }) {
  const light = variant === "light";
  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          className={clsx(
            "flex h-10 w-10 items-center justify-center rounded-full ring-1 transition duration-200 hover:-translate-y-0.5",
            light
              ? "bg-white/10 text-white ring-white/15 hover:bg-white/20"
              : "bg-slate-100 text-slate-600 ring-slate-200 hover:bg-brand-50 hover:text-brand-700"
          )}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
            {icons[l.key]}
          </svg>
        </a>
      ))}
    </div>
  );
}