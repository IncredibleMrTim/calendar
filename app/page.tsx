"use client";
import { Calendar } from "./components/calendar/Calendar";
import { AdBanner } from "./components/adBanner/AdBanner";
import { MeaChat } from "./components/meaChat/MeaChat";
import { Logos, LogoType } from "./components/logo/Logos";
import { useEventStore } from "./stores/useEventStore";
import { EventDTO } from "./actions/events.action";
import { useEffect } from "react";
import { EventDrawerTemplate } from "./components/drawer/templates/EventDrawer.template";
import { Drawer } from "./components/drawer/Drawer";
import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { SlotInfo } from "./components/calendar/Calendar";
import { useClickHandler } from "./hooks/useClickHandler";
import { useIsMobile } from "./hooks/useIsMobile";
import { CalendarToolbar } from "./components/calendar/CalendarToolbar";
import { CalendarView, useCalendarStore } from "./stores/useCalendarStore";
import { View } from "react-big-calendar";

export default function Home() {
  /* Event State */
  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);
  const setSelectedSlot = useEventStore((state) => state.setSelectedSlot);
  const handleEventClose = useEventStore((state) => state.handleEventClose);
  const handleFormSubmit = useEventStore((state) => state.handleFormSubmit);
  const handleDelete = useEventStore((state) => state.handleDelete);
  const setIsDeleting = useEventStore((state) => state.setIsDeleting);
  const setIsCreating = useEventStore((state) => state.setIsCreating);
  const selectedSlot = useEventStore((state) => state.selectedSlot);
  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const isCreating = useEventStore((state) => state.isCreating);
  const isDeleting = useEventStore((state) => state.isDeleting);
  const isEventInPast = useEventStore((state) => state.isEventInPast);
  const rawEvents = useEventStore((state) => state.events);
  const events = rawEvents ?? [];

  /* Calendar State */
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);
  const setCurrentView = useCalendarStore((state) => state.setCurrentView);
  const currentDate = useCalendarStore((state) => state.currentDate);
  const currentView = useCalendarStore((state) => state.currentView);

  const isMobile = useIsMobile();
  const { data: session } = useSession();

  /* Fetch all events on load */
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectSlot = useClickHandler<SlotInfo>({
    mode: isMobile ? "single" : "double",
    onClick: (slotData) => {
      if (slotData.end < new Date() || session?.user.role !== UserRole.ADMIN)
        return;
      setSelectedSlot({ ...slotData });
      setIsCreating(true);
    },
    threshold: 300,
    isEqual: (a, b) => a.start.getTime() === b.start.getTime(),
  });

  const onViewChange = (view: CalendarView) => {
    setCurrentView(view);
  };

  const handleCreateEvent = () => {
    setIsCreating(true);
  };

  const handleClose = () => {
    handleEventClose();
  };

  const handleBigCalendarViewChange = (view: View) => {
    setCurrentView(view as CalendarView);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  return (
    <main className="relative">
      <div className="border-b shadow relative">
        <div className="justify-center w-3/4 p-4 pb-6 mx-auto flex md:hidden">
          <Logos type={LogoType.PAGEANT_NO_STRAP} />
        </div>
      </div>
      <div className="flex flex-row-reverse w-full relative">
        <AdBanner />

        <div className="w-full">
          <>
            <CalendarToolbar
              currentDate={currentDate}
              currentView={currentView}
              canEdit={session?.user.role === UserRole.ADMIN}
              user={{
                firstName: session?.user.firstName,
                lastName: session?.user.lastName,
                email: session?.user.email ?? "",
              }}
              onNavigate={handleNavigate}
              onViewChange={onViewChange}
              onCreateEvent={handleCreateEvent}
            />
            <AdBanner variant="inline" />
            <Calendar
              events={events}
              view={currentView}
              date={currentDate}
              onSelectEvent={(event) => setSelectedEvent(event as EventDTO)}
              onSelectSlot={handleSelectSlot}
              onViewChange={handleBigCalendarViewChange}
              onNavigate={handleNavigate}
            />
          </>
        </div>
      </div>
      <div className="fixed bottom-0 right-0 z-20">
        <MeaChat />
      </div>
      <Drawer
        open={!!selectedEvent || !!selectedSlot || isCreating}
        onClose={handleClose}
      >
        <EventDrawerTemplate
          slotInfo={selectedSlot}
          selectedEvent={selectedEvent}
          isCreating={isCreating}
          isDeleting={isDeleting}
          isEventInPast={isEventInPast}
          mode={session?.user.role === UserRole.ADMIN ? "edit" : "view"}
          onClose={handleClose}
          onSubmit={handleFormSubmit}
          onDelete={handleDelete}
          onSetDeleting={setIsDeleting}
        />
      </Drawer>
    </main>
  );
}
