"use client";
import { useState, useMemo, useEffect } from "react";
import {
  dateFnsLocalizer,
  Calendar as RBCCalendar,
  ToolbarProps as RBCToolbarProps,
  View,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enGB } from "date-fns/locale";
import { Button } from "../ui/button";
import dynamic from "next/dynamic";
import { EventDTO } from "@/actions/events.action";
import { CalendarModal } from "./CalendarModal";
import { useEventStore } from "./useEventStore";

const BigCalendar = dynamic(() => Promise.resolve(RBCCalendar), {
  ssr: false,
  loading: () => <div>Loading calendar...</div>,
}) as typeof RBCCalendar;

interface CalendarEvent extends EventDTO {
  start: Date;
  end: Date;
}

export const Calendar = () => {
  const [calendarView, setCalendarView] = useState<View>("week");

  // Subscribe to only what this component needs
  const events = useEventStore((state) => state.events);
  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const onCreateEvent = useEventStore((state) => state.onCreateEvent);
  const onSelectEvent = useEventStore((state) => state.onSelectEvent);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  const onViewChange = (view: View) => {
    setCalendarView(view);
  };

  const CustomToolbar = (toolbar: RBCToolbarProps<CalendarEvent>) => {
    return (
      <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
        <div className="flex gap-2">
          <Button
            onClick={() => toolbar.onNavigate("TODAY")}
            className="px-3 py-1 bg-blue-500 text-white"
          >
            Today
          </Button>
          <Button
            onClick={() => toolbar.onNavigate("PREV")}
            className="px-3 py-1 bg-gray-300"
          >
            Back
          </Button>
          <Button
            onClick={() => toolbar.onNavigate("NEXT")}
            className="px-3 py-1 bg-gray-300"
          >
            Next
          </Button>
        </div>
        <h2 className="text-lg font-semibold">{toolbar.label}</h2>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onViewChange("month")}>
              Month
            </Button>
            <Button variant="outline" onClick={() => onViewChange("week")}>
              Week
            </Button>
            <Button variant="outline" onClick={() => onViewChange("day")}>
              Day
            </Button>
            <Button variant="outline" onClick={() => onViewChange("agenda")}>
              Agenda
            </Button>
          </div>
          <Button
            className="px-3 py-1 bg-green-500 text-white"
            onClick={() => onCreateEvent()}
          >
            + Add Event
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <BigCalendar
        localizer={localizer}
        startAccessor={(event: CalendarEvent) => event.start}
        endAccessor={(event: CalendarEvent) => event.end}
        events={(events || []).map(
          (event): CalendarEvent => ({
            ...event,
            start: event.startDate,
            end: event.endDate,
          }),
        )}
        view={calendarView}
        onView={onViewChange}
        defaultDate={new Date()}
        style={{ height: "calc(100vh - 100px)" }}
        onSelectEvent={(event: CalendarEvent) => onSelectEvent(event)}
        components={{ toolbar: CustomToolbar }}
      />

      <CalendarModal />
    </>
  );
};
