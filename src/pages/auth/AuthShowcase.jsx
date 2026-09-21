import { Trophy, Medal, Users, CalendarCheck } from "lucide-react";

const points = [
  { icon: Users, text: "Build a professional athlete profile recruiters trust" },
  { icon: CalendarCheck, text: "Discover trials, matches and camps near you" },
  { icon: Medal, text: "Showcase achievements, certificates and highlight reels" },
];

export default function AuthShowcase() {
  return (
    <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-12 text-white lg:flex">
      <div className="flex items-center gap-2">
        <Trophy size={28} />
        <span className="text-2xl font-extrabold tracking-tight">SportLinked</span>
      </div>

      <div>
        <h2 className="text-3xl font-bold leading-tight">
          The professional network built for athletes, clubs &amp; scouts.
        </h2>
        <ul className="mt-8 space-y-4">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="mt-0.5 rounded-lg bg-white/10 p-2">
                <Icon size={18} />
              </span>
              <span className="text-sm text-brand-50">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-brand-200">Â© {new Date().getFullYear()} SportLinked. All rights reserved.</p>

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/5" />
    </div>
  );
}

