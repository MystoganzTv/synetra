import type {
  CalendarSchedulerEvent,
  WeekDayItem,
} from "@/components/calendar/calendar-scheduler-client";
import { CalendarSchedulerClient } from "@/components/calendar/calendar-scheduler-client";
import { getCalendarModuleData } from "@/lib/operations-data";
import { APP_TIMEZONE, dateFromKey, getDateKey, getTimeParts } from "@/lib/time";

const dayNameFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const dayNumberFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
});

const hourLabelFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: APP_TIMEZONE,
});

const DAY_START_HOUR = 8;
const HOUR_ROW_HEIGHT = 82;

export default async function CalendarPage() {
  const calendar = await getCalendarModuleData();
  const activeDayKey = getDateKey(calendar.referenceDate);
  const weekDays = calendar.days.slice(0, 5).map<WeekDayItem>((day) => {
    const date = dateFromKey(day.dateKey);

    return {
      name: dayNameFormatter.format(date),
      date: dayNumberFormatter.format(date),
      full: day.dateKey,
      isToday: day.dateKey === activeDayKey,
    };
  });

  const schedulerEvents = calendar.allEvents
    .filter(
      (
        event,
      ): event is typeof event & {
        endsAt: string;
        eventType: "SESSION" | "GROUP";
      } =>
        Boolean(event.endsAt) &&
        (event.eventType === "SESSION" || event.eventType === "GROUP"),
    )
    .map<CalendarSchedulerEvent>((event) => {
      const startsAt = new Date(event.startsAt);
      const endsAt = new Date(event.endsAt ?? event.startsAt);
      const startTime = getTimeParts(startsAt, APP_TIMEZONE);
      const endTime = getTimeParts(endsAt, APP_TIMEZONE);
      const startMinutes = startTime.hour * 60 + startTime.minute;
      const endMinutes = endTime.hour * 60 + endTime.minute;
      const duration = Math.max(
        endMinutes - startMinutes,
        event.durationMinutes ?? 60,
      );
      const minutesFromTop = Math.max(startMinutes - DAY_START_HOUR * 60, 0);

      return {
        id: event.id,
        dayKey: getDateKey(startsAt, APP_TIMEZONE),
        title: event.title,
        time: hourLabelFormatter.format(startsAt),
        duration,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        type: event.eventType,
        staff: event.staffName ?? "Unassigned",
        href: event.href ?? "/dashboard",
        top: (minutesFromTop / 60) * HOUR_ROW_HEIGHT + 6,
        height: Math.max((duration / 60) * HOUR_ROW_HEIGHT - 8, 44),
      };
    })
    .filter((event) => weekDays.some((day) => day.full === event.dayKey));

  const staff = Array.from(
    new Set(
      schedulerEvents
        .map((event) => event.staff)
        .filter((value): value is string => Boolean(value)),
    ),
  ).slice(0, 4);

  return (
    <CalendarSchedulerClient
      referenceDate={activeDayKey}
      weekStart={calendar.weekStart}
      weekEnd={calendar.days[4].dateKey}
      weekDays={weekDays}
      events={schedulerEvents}
      staff={staff}
      timeZone={APP_TIMEZONE}
    />
  );
}
