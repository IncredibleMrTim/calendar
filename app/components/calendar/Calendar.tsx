"use client";
import { useState, useMemo, useEffect } from "react";
import {
  dateFnsLocalizer,
  Calendar as RBCCalendar,
  View,
  SlotInfo,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enGB } from "date-fns/locale";

import dynamic from "next/dynamic";
import { EventDTO } from "@/actions/events.action";
import { CalendarModal } from "./CalendarModal";
import { useEventStore } from "../../stores/useEventStore";
import { useCalendarStore, CalendarView } from "@/stores/useCalendarStore";
import { useDoubleClick } from "@/hooks/useDoubleClick";
import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarDisplayModal } from "./CalendarDisplayModal";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

const BigCalendar = dynamic(() => Promise.resolve(RBCCalendar), {
  ssr: false,
  loading: () => <div>Loading calendar...</div>,
}) as typeof RBCCalendar;

interface CalendarEvent extends EventDTO {
  start: Date;
  end: Date;
}

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slotInfo, setSlotInfo] = useState<SlotInfo | undefined>(undefined);
  const { data: session } = useSession();

  // Subscribe to only what this component needs
  const currentView = useCalendarStore((state) => state.currentView);
  const setCurrentView = useCalendarStore((state) => state.setCurrentView);

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

  const onViewChange = (view: CalendarView) => {
    setCurrentView(view);
  };

  const handleBigCalendarViewChange = (view: View) => {
    setCurrentView(view as CalendarView);
  };

  const handleDoubleClickSlot = useDoubleClick<SlotInfo>({
    onDoubleClick: (slotData) => {
      setSlotInfo(slotData);
      onCreateEvent();
    },
    threshold: 300,
    isEqual: (a, b) => a.start.getTime() === b.start.getTime(),
  });

  const navigate = (
    action?: "PREV" | "NEXT" | "TODAY",
    selectedDate?: Date,
  ) => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
      return;
    }

    if (action === "TODAY") {
      setCurrentDate(new Date());
      return;
    }

    const newDate = new Date(currentDate);
    const direction = action === "PREV" ? -1 : 1;

    if (currentView === CalendarView.MONTH) {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (currentView === CalendarView.WEEK) {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (currentView === CalendarView.DAY) {
      newDate.setDate(newDate.getDate() + direction);
    }

    setCurrentDate(newDate);
  };

  return (
    <>
      <CalendarToolbar
        currentDate={currentDate}
        onNavigate={navigate}
        onViewChange={onViewChange}
        onCreateEvent={onCreateEvent}
      />
      <div className="w-full h-[calc(100vh-60px)] overflow-auto">
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
          view={currentView as View}
          onView={handleBigCalendarViewChange}
          date={currentDate}
          onNavigate={setCurrentDate}
          style={{ height: "150vh", minWidth: "800px" }}
          onSelectEvent={(event: CalendarEvent) => onSelectEvent(event)}
          toolbar={false}
          selectable
          onSelectSlot={handleDoubleClickSlot}
        />
      </div>

      {session?.user.role === UserRole.ADMIN ? (
        <CalendarModal slotInfo={slotInfo} />
      ) : (
        <CalendarDisplayModal />
      )}
    </>
  );
};
