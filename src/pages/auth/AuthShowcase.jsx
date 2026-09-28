import Logo from "../../components/brand/Logo";
import SocialLinks from "../../components/brand/SocialLinks";
import { Medal, Users, CalendarCheck, ShieldCheck } from "lucide-react";

const points = [
  { icon: Users, text: "Build a professional athlete profile recruiters trust" },
  { icon: CalendarCheck, text: "Discover trials, matches and camps near you" },
  { icon: Medal, text: "Showcase achievements, certificates and highlight reels" },
];

export default function AuthShowcase() {
  return (
    <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
      <div className="hero-grid absolute inset-0" />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />

      <div className="relative">
        {/* transparent white-text logo, no white box */}
        <Logo size={64} dark />
      </div>

      <div className="relative">
        <h2 className="max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          The professional network built for <span className="text-gradient">athletes</span>, clubs &amp; scouts.
        </h2>
        <ul className="mt-8 space-y-4">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="mt-0.5 rounded-xl bg-white/10 p-2 ring-1 ring-white/10">
                <Icon size={18} />
              </span>
              <span className="text-sm leading-6 text-brand-50">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <ShieldCheck size={22} className="shrink-0 text-brand-300" />
          <p className="text-sm leading-6 text-brand-50">
            <span className="font-bold text-white">Verified profiles</span> get up to 5× more visibility from clubs and scouts.
          </p>
        </div>

        <div className="mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300">Follow SportLinked</p>
          <SocialLinks variant="light" className="mt-3" />
        </div>
      </div>

      <p className="relative text-xs text-brand-200">© {new Date().getFullYear()} SportLinked. All rights reserved.</p>
    </div>
  );
}