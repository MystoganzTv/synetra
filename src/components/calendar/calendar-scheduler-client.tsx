"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dateFromKey, getTimeParts } from "@/lib/time";
import { cn } from "@/lib/utils";

const DAY_START_HOUR = 8;
const MIN_DAY_END_HOUR = 19;
const HOUR_ROW_HEIGHT = 82;

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const rangeMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
});

const rangeDayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
});

type CalendarView = "day" | "week";

export interface WeekDayItem {
  name: string;
  date: string;
  full: string;
  isToday: boolean;
}

export interface CalendarSchedulerEvent {
  id: string;
  dayKey: string;
  title: string;
  time: string;
  duration: number;
  startsAt: string;
  endsAt: string;
  type: "SESSION" | "GROUP";
  staff: string;
  href: string;
  top: number;
  height: number;
}

interface PositionedCalendarEvent extends CalendarSchedulerEvent {
  columnIndex: number;
  columnCount: number;
  clusterId: number;
}

function formatRange(startKey: string, endKey: string) {
  const startDate = dateFromKey(startKey);
  const endDate = dateFromKey(endKey);

  return `${rangeMonthFormatter.format(startDate)} ${rangeDayFormatter.format(startDate)} – ${rangeDayFormatter.format(endDate)}, ${endDate.getFullYear()}`;
}

function formatHourLabel(hour: number) {
  const normalizedHour = hour % 12 || 12;
  const meridiem = hour >= 12 ? "PM" : "AM";
  return `${normalizedHour}:00 ${meridiem}`;
}

function getStaffColor(index: number) {
  const colors = ["#5b7df0", "#8b5cf6", "#58b785", "#ef8a49", "#e45f91"];
  return colors[index % colors.length];
}

function getEventStyle(type: "SESSION" | "GROUP") {
  if (type === "GROUP") {
    return {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      meta: "text-emerald-700/80",
      accent: "#63c188",
    };
  }

  return {
    container: "bg-blue-50 border-blue-200 text-blue-900",
    meta: "text-blue-700/80",
    accent: "#5b7df0",
  };
}

function layoutDayEvents(events: CalendarSchedulerEvent[]) {
  const active: Array<{ endMs: number; columnIndex: number }> = [];
  const clusterWidths = new Map<number, number>();
  let currentClusterId = 0;

  const assigned = events
    .slice()
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    )
    .map<PositionedCalendarEvent>((event) => {
      const startMs = new Date(event.startsAt).getTime();
      const endMs = new Date(event.endsAt).getTime();

      for (let index = active.length - 1; index >= 0; index -= 1) {
        if (active[index].endMs <= startMs) {
          active.splice(index, 1);
        }
      }

      if (active.length === 0) {
        currentClusterId += 1;
      }

      const occupiedColumns = new Set(active.map((item) => item.columnIndex));
      let columnIndex = 0;
      while (occupiedColumns.has(columnIndex)) {
        columnIndex += 1;
      }

      active.push({ endMs, columnIndex });
      clusterWidths.set(
        currentClusterId,
        Math.max(clusterWidths.get(currentClusterId) ?? 1, active.length, columnIndex + 1),
      );

      return {
        ...event,
        columnIndex,
        columnCount: 1,
        clusterId: currentClusterId,
      };
    });

  return assigned.map((event) => ({
    ...event,
    columnCount: clusterWidths.get(event.clusterId) ?? 1,
  }));
}

export function CalendarSchedulerClient({
  referenceDate,
  weekStart,
  weekEnd,
  weekDays,
  events,
  staff,
  timeZone,
}: {
  referenceDate: string;
  weekStart: string;
  weekEnd: string;
  weekDays: WeekDayItem[];
  events: CalendarSchedulerEvent[];
  staff: string[];
  timeZone: string;
}) {
  const [view, setView] = useState<CalendarView>("week");
  const [selectedDayKey, setSelectedDayKey] = useState(referenceDate);

  const selectedDayIndex = Math.max(
    weekDays.findIndex((day) => day.full === selectedDayKey),
    0,
  );
  const visibleDays =
    view === "day"
      ? [weekDays[selectedDayIndex] ?? weekDays[0]].filter(Boolean)
      : weekDays;

  const positionedEvents = useMemo(
    () =>
      new Map(
        visibleDays.map((day) => [
          day.full,
          layoutDayEvents(events.filter((event) => event.dayKey === day.full)),
        ]),
      ),
    [events, visibleDays],
  );

  const latestEventHour = events.reduce((maxHour, event) => {
    const endTime = getTimeParts(event.endsAt, timeZone);
    return Math.max(maxHour, endTime.hour + (endTime.minute > 0 ? 1 : 0));
  }, MIN_DAY_END_HOUR);

  const endHour = Math.max(MIN_DAY_END_HOUR, latestEventHour);
  const hourRows = Array.from(
    { length: endHour - DAY_START_HOUR },
    (_, index) => DAY_START_HOUR + index,
  );
  const gridHeight = hourRows.length * HOUR_ROW_HEIGHT;

  const title =
    view === "day"
      ? fullDateFormatter.format(dateFromKey(visibleDays[0]?.full ?? referenceDate))
      : formatRange(weekStart, weekEnd);

  function handlePrevious() {
    if (view !== "day") return;
    const nextIndex = Math.max(selectedDayIndex - 1, 0);
    setSelectedDayKey(weekDays[nextIndex]?.full ?? selectedDayKey);
  }

  function handleNext() {
    if (view !== "day") return;
    const nextIndex = Math.min(selectedDayIndex + 1, weekDays.length - 1);
    setSelectedDayKey(weekDays[nextIndex]?.full ?? selectedDayKey);
  }

  const canGoPrevious = view === "day" && selectedDayIndex > 0;
  const canGoNext = view === "day" && selectedDayIndex < weekDays.length - 1;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Scheduling
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage sessions and appointments.
          </p>
        </div>

        <Button
          asChild
          className="h-11 rounded-xl bg-[#3d67eb] px-5 text-white hover:bg-[#3159d2]"
        >
          <Link href="/clients">
            <Plus className="h-4 w-4" />
            New Session
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-5 rounded-[28px] border border-white/90 bg-white/82 p-6 shadow-[0_22px_70px_-38px_rgba(15,47,41,0.38)] backdrop-blur md:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="h-10 w-10 rounded-xl bg-white px-0 shadow-none"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-[2rem] font-semibold tracking-tight text-foreground">
              {title}
            </h2>

            <Button
              variant="outline"
              className="h-10 w-10 rounded-xl bg-white px-0 shadow-none"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1.5 rounded-xl border border-border bg-card p-1">
            {(["day", "week"] as CalendarView[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  view === mode
                    ? "bg-[#3d67eb] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-medium text-muted-foreground">Staff:</span>
          {staff.map((member, index) => (
            <button
              key={member}
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getStaffColor(index) }}
              />
              {member}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-border bg-card">
          <div
            className={cn(
              "grid border-b border-border",
              view === "day"
                ? "grid-cols-[64px_minmax(0,1fr)]"
                : "grid-cols-[64px_repeat(5,minmax(0,1fr))]",
            )}
          >
            <div className="p-3" />
            {visibleDays.map((day) => (
              <div
                key={day.full}
                className={cn(
                  "border-l border-border p-3 text-center",
                  day.isToday && "bg-primary/5",
                )}
              >
                <p className="text-xs text-muted-foreground">{day.name}</p>
                <p
                  className={cn(
                    "mt-0.5 text-[2rem] font-semibold leading-none text-foreground",
                    day.isToday && "text-primary",
                  )}
                >
                  {day.date}
                </p>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "grid",
              view === "day"
                ? "grid-cols-[64px_minmax(0,1fr)]"
                : "grid-cols-[64px_repeat(5,minmax(0,1fr))]",
            )}
          >
            <div className="relative" style={{ height: gridHeight }}>
              {hourRows.map((hour, index) => (
                <div
                  key={hour}
                  className="absolute inset-x-0 border-b border-border px-2 pt-3 text-right text-xs text-muted-foreground"
                  style={{
                    top: index * HOUR_ROW_HEIGHT,
                    height: HOUR_ROW_HEIGHT,
                  }}
                >
                  {formatHourLabel(hour)}
                </div>
              ))}
            </div>

            {visibleDays.map((day) => (
              <div
                key={day.full}
                className={cn(
                  "relative border-l border-border",
                  day.isToday && "bg-primary/[0.03]",
                )}
                style={{ height: gridHeight }}
              >
                {hourRows.map((hour, index) => (
                  <div
                    key={`${day.full}-${hour}`}
                    className="absolute inset-x-0 border-b border-border"
                    style={{
                      top: index * HOUR_ROW_HEIGHT,
                      height: HOUR_ROW_HEIGHT,
                    }}
                  />
                ))}

                {(positionedEvents.get(day.full) ?? []).map((event) => {
                  const eventStyle = getEventStyle(event.type);
                  const slotWidth = 100 / event.columnCount;
                  const leftOffset = slotWidth * event.columnIndex;
                  const isCompact = event.columnCount > 1 || event.height < 72;

                  return (
                    <Link
                      key={event.id}
                      href={event.href}
                      className={cn(
                        "absolute rounded-xl border p-2 transition-shadow hover:shadow-md",
                        eventStyle.container,
                      )}
                      style={{
                        top: event.top,
                        left: `calc(${leftOffset}% + 4px)`,
                        width: `calc(${slotWidth}% - 8px)`,
                        minHeight: event.height,
                        borderLeftWidth: 3,
                        borderLeftColor: eventStyle.accent,
                      }}
                    >
                      <p
                        className={cn(
                          "truncate font-medium",
                          isCompact ? "text-[12px]" : "text-xs",
                        )}
                      >
                        {event.title}
                      </p>
                      <p
                        className={cn(
                          "mt-1 flex items-center gap-1 opacity-80",
                          eventStyle.meta,
                          isCompact ? "text-[10px]" : "text-[11px]",
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {event.time} · {event.duration}m
                      </p>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
