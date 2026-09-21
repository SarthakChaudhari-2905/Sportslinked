import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  formatDate,
  titleCase,
} from "../ui";

export default function SpotlightCarousel({
  events = [],
}) {
  const [active, setActive] =
    useState(0);

  const items =
    events.filter(
      (event) =>
        event.status ===
          "PUBLISHED" ||
        !event.status
    );

  useEffect(() => {
    if (items.length < 2)
      return;

    const timer =
      setInterval(() => {
        setActive(
          (current) =>
            (current + 1) %
            items.length
        );
      }, 5000);

    return () =>
      clearInterval(timer);
  }, [items.length]);

  if (!items.length)
    return null;

  const event =
    items[active % items.length];

  return (
    <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">

      <div className="relative min-h-[280px]">

        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-indigo-800 to-slate-950" />
        )}

        <div className="hero-grid absolute inset-0" />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent" />

        <div className="relative z-10 flex min-h-[280px] flex-col justify-center p-7 sm:p-10">

          <div className="flex items-center gap-2 text-brand-300">
            <Sparkles size={16} />

            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Spotlight opportunity
            </span>
          </div>

          <h2 className="mt-3 max-w-xl text-2xl font-black tracking-tight text-white sm:text-3xl">
            {event.title}
          </h2>

          <p className="mt-2 text-sm font-medium text-blue-200">
            {titleCase(event.sport)}
            {" · "}
            {titleCase(event.type)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="brand">
              <CalendarDays
                size={12}
              />
              {formatDate(
                event.startDate
              )}
            </Badge>

            {event.location
              ?.city && (
              <Badge>
                <MapPin
                  size={12}
                />
                {
                  event.location
                    .city
                }
              </Badge>
            )}
          </div>

          <Link
            to={`/events/${event._id}`}
            className="mt-5 inline-flex w-fit"
          >
            <Button>
              Explore opportunity
              <ArrowRight
                size={15}
              />
            </Button>
          </Link>
        </div>

        {items.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive(
                  (active -
                    1 +
                    items.length) %
                    items.length
                )
              }
              className="absolute left-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              <ChevronLeft
                size={18}
              />
            </button>

            <button
              onClick={() =>
                setActive(
                  (active + 1) %
                    items.length
                )
              }
              className="absolute right-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              <ChevronRight
                size={18}
              />
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 bg-slate-950 px-4 py-3">
          {items.map(
            (_, index) => (
              <button
                key={index}
                onClick={() =>
                  setActive(index)
                }
                className={`h-1.5 rounded-full transition-all ${
                  index === active
                    ? "w-8 bg-brand-400"
                    : "w-1.5 bg-slate-700"
                }`}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}