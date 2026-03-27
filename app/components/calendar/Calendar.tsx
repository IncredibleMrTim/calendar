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
import { useEventStore } from "../../stores/useEventStore";
import { useCalendarStore, CalendarView } from "@/stores/useCalendarStore";
import { useDoubleClick } from "@/hooks/useDoubleClick";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CalendarToolbar } from "./CalendarToolbar";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { AdBanner } from "../adBanner/AdBanner";
import { Drawer } from "../drawers/Drawer";
import { getContrastColor } from "@/utils/color";
import { EventDrawerTemplate } from "../drawers/templates/EventDrawer.template";

const EventComponent = ({ event }: { event: CalendarEvent }) => (
  <div>{event.title}</div>
);

const BigCalendar = dynamic(() => Promise.resolve(RBCCalendar), {
  ssr: false,
  loading: () => <div>Loading calendar...</div>,
}) as typeof RBCCalendar;

interface CalendarEvent extends EventDTO {
  start: Date;
  end: Date;
}

export const Calendar = () => {
  const isMobile = useIsMobile();
  const [slotInfo, setSlotInfo] = useState<SlotInfo | undefined>(undefined);
  const { data: session } = useSession();

  // Subscribe to only what this component needs
  const currentView = useCalendarStore((state) => state.currentView);
  const setCurrentView = useCalendarStore((state) => state.setCurrentView);
  const currentDate = useCalendarStore((state) => state.currentDate);
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);

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
      if (slotData.end < new Date()) return;
      setSlotInfo({ ...slotData });
      onCreateEvent();
    },
    threshold: 300,
    isEqual: (a, b) => a.start.getTime() === b.start.getTime(),
  });

  const handleSelectSlot = (slotData: SlotInfo) => {
    if (slotData.end < new Date() || session?.user.role !== UserRole.ADMIN)
      return;
    if (isMobile) {
      setSlotInfo(slotData);
      onCreateEvent();
    } else {
      handleDoubleClickSlot(slotData);
    }
  };

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
      <AdBanner variant="inline" />
      <div className="w-full h-[calc(100vh-60px)] overflow-auto bg-gray-50">
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
          scrollToTime={new Date()}
          style={{ height: "100vh", minWidth: "800px" }}
          onSelectEvent={(event: CalendarEvent) => onSelectEvent(event)}
          toolbar={false}
          selectable
          onSelectSlot={handleSelectSlot}
          components={{ event: EventComponent }}
          eventPropGetter={(event: CalendarEvent) => ({
            style: {
              backgroundColor: event.color ?? "#3174ad",

              color: getContrastColor(event.color ?? "#3174ad"),
              boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
              margin: "1px 0px",
            },
          })}
        />
      </div>

      <Drawer allowDismiss={session?.user.role !== UserRole.ADMIN}>
        <EventDrawerTemplate
          slotInfo={slotInfo}
          mode={session?.user.role === UserRole.ADMIN ? "edit" : "view"}
        />
      </Drawer>
    </>
  );
};
