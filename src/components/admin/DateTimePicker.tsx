import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDisplay(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Custom calendar + clock picker for publication schedule / backdate.
 */
export function DateTimePicker({ value, onChange, disabled }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState(() => startOfMonth(value));
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setViewMonth(startOfMonth(value));
  }, [value]);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = startOfMonth(viewMonth).getDay();
  const totalDays = daysInMonth(year, month);

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const selectDay = (day: number) => {
    const next = new Date(value);
    next.setFullYear(year, month, day);
    onChange(next);
  };

  const setHour12 = (hour12: number) => {
    const next = new Date(value);
    const isPM = next.getHours() >= 12;
    let h = hour12 % 12;
    if (isPM) h += 12;
    next.setHours(h);
    onChange(next);
  };

  const setMinute = (minute: number) => {
    const next = new Date(value);
    next.setMinutes(minute);
    onChange(next);
  };

  const setPeriod = (period: "AM" | "PM") => {
    const next = new Date(value);
    const hours = next.getHours();
    if (period === "AM" && hours >= 12) next.setHours(hours - 12);
    if (period === "PM" && hours < 12) next.setHours(hours + 12);
    onChange(next);
  };

  const hour12 = (() => {
    const h = value.getHours() % 12;
    return h === 0 ? 12 : h;
  })();
  const minute = value.getMinutes();
  const period: "AM" | "PM" = value.getHours() >= 12 ? "PM" : "AM";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs font-bold text-zinc-900 hover:border-brand focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
      >
        <Calendar className="h-3.5 w-3.5 text-brand" />
        <span>{formatDisplay(value)}</span>
        <Clock className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[300px] rounded-xl border border-zinc-200 bg-white p-3 shadow-2xl">
          {/* Month navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setViewMonth(new Date(year, month - 1, 1))
              }
              className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-black uppercase tracking-wider text-zinc-800">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() =>
                setViewMonth(new Date(year, month + 1, 1))
              }
              className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }
              const cellDate = new Date(year, month, day);
              const selected = sameDay(cellDate, value);
              const isToday = sameDay(cellDate, new Date());

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-8 rounded-md text-xs font-bold transition-colors ${
                    selected
                      ? "bg-brand text-white shadow-sm"
                      : isToday
                        ? "bg-brand/10 text-brand hover:bg-brand/20"
                        : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Clock row */}
          <div className="mt-3 border-t border-zinc-100 pt-3">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              Time
            </div>
            <div className="flex items-center gap-2">
              <select
                value={hour12}
                onChange={(e) => setHour12(Number(e.target.value))}
                className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs font-bold text-zinc-900 focus:border-brand focus:outline-none"
                aria-label="Hour"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="text-sm font-black text-zinc-400">:</span>
              <select
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs font-bold text-zinc-900 focus:border-brand focus:outline-none"
                aria-label="Minute"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as "AM" | "PM")}
                className="w-16 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs font-bold text-zinc-900 focus:border-brand focus:outline-none"
                aria-label="AM/PM"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(new Date());
              }}
              className="rounded-md px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:bg-zinc-100"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-brand px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white hover:bg-brand/90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
