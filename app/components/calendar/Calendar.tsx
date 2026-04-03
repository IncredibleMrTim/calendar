"use client";
import { useMemo } from "react";
import {
  dateFnsLocalizer,
  Calendar as RBCCalendar,
  View,
  SlotInfo,
  stringOrDate,
  NavigateAction,
} from "react-big-calendar";

export type { SlotInfo };
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enGB } from "date-fns/locale";

import { getContrastColor } from "@/utils/color";

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color?: string | null;
}

interface RBCEvent extends CalendarEvent {
  start: Date;
  end: Date;
}

export enum CalendarView {
  DAY = "day",
  WEEK = "week",
  WORK_WEEK = "work_week",
  MONTH = "month",
  AGENDA = "agenda",
}

interface CalendarProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot?: (data: SlotInfo) => void;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  date: stringOrDate | undefined;
  onNavigate?: (newDate: Date, view: View, action: NavigateAction) => void;
}

export const Calendar = ({
  events,
  view = CalendarView.MONTH,
  date,
  onSelectEvent,
  onSelectSlot,
  onViewChange,
  onNavigate,
}: CalendarProps) => {
  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales: { "en-GB": enGB },
      }),
    [],
  );

  const rbcEvents = useMemo(
    () =>
      (events || []).map(
        (event): RBCEvent => ({
          ...event,
          start: event.startDate,
          end: event.endDate,
        }),
      ),
    [events],
  );

  return (
    <div className="w-full h-[calc(100vh-60px)] overflow-auto bg-gray-50">
      <RBCCalendar
          localizer={localizer}
          startAccessor={(event: RBCEvent) => event.start}
          endAccessor={(event: RBCEvent) => event.end}
          events={rbcEvents}
          view={view}
          onView={(v) => onViewChange(v as CalendarView)}
          date={date}
          onNavigate={onNavigate}
          scrollToTime={new Date()}
          style={{ height: "100vh", minWidth: "800px" }}
          onSelectEvent={(event: RBCEvent) => onSelectEvent(event)}
          toolbar={false}
          selectable
          onSelectSlot={onSelectSlot}
          components={{ event: ({ event }: { event: RBCEvent }) => <div>{event.title}</div> }}
          eventPropGetter={(event: RBCEvent) => ({
            style: {
              backgroundColor: event.color ?? "#3174ad",
              color: getContrastColor(event.color ?? "#3174ad"),
              boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
              margin: "1px 0px",
            },
          })}
        />
    </div>
  );
};
