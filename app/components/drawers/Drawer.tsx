"use client";
import { cva } from "class-variance-authority";
import {
  Drawer as ShadDrawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEventStore } from "@/stores/useEventStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { lexicalToHtml } from "@/utils/lexical";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { CalendarForm } from "../calendar/CalendarForm";
import { SlotInfo } from "react-big-calendar";
import {
  LuCalendarDays,
  LuClock,
  LuUser,
  LuPhone,
  LuMail,
  LuX,
} from "react-icons/lu";
import { EventDrawerTemplate } from "./EventDrawer.template";

const drawerContent = cva("bg-transparent border-none shadow-none", {
  variants: {
    device: {
      mobile: "h-[100dvh] max-h-[100dvh] mt-0! rounded-t-xl",
      desktop: "md:max-w-130! h-full p-2",
    },
  },
});

const drawerInner = cva(
  "flex flex-col h-full bg-zinc-50 transition-[transform,opacity] duration-300 ease-in-out " +
    "group-data-[state=open]/drawer-content:opacity-100 " +
    "group-data-[state=closed]/drawer-content:opacity-0",
  {
    variants: {
      device: {
        mobile: "group-data-[state=closed]/drawer-content:translate-y-4",
        desktop:
          "rounded-xl border border-zinc-200 shadow-xl group-data-[state=closed]/drawer-content:translate-x-8",
      },
    },
  },
);

interface DrawerProps {
  mode?: "view" | "edit";
  slotInfo?: SlotInfo;
}

export const Drawer = ({ mode = "view", slotInfo }: DrawerProps) => {
  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const isCreating = useEventStore((state) => state.isCreating);
  const isEventInPast = useEventStore((state) => state.isEventInPast);
  const handleEventClose = useEventStore((state) => state.handleEventClose);

  const isMobile = useIsMobile();
  const isOpen = !!selectedEvent || isCreating;

  return (
    <ShadDrawer
      open={isOpen}
      direction={isMobile ? "bottom" : "right"}
      onClose={mode === "view" || isEventInPast ? handleEventClose : undefined}
      shouldScaleBackground={false}
      dismissible={false}
    >
      <DrawerContent
        className={drawerContent({ device: isMobile ? "mobile" : "desktop" })}
        onOverlayClick={
          !isMobile && (mode === "view" || isEventInPast)
            ? handleEventClose
            : undefined
        }
      >
        <div
          className={drawerInner({ device: isMobile ? "mobile" : "desktop" })}
        >
          <DrawerTitle className="hidden">
            {isCreating
              ? "New Event"
              : `${mode === "edit" ? "Edit" : "View"}: ${selectedEvent?.title}`}
          </DrawerTitle>
          <DrawerHeader className="bg-white border-b border-zinc-100 py-4 flex flex-row items-center gap-2 shrink-0 rounded-t-md">
            <button
              onClick={handleEventClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              aria-label="Close"
            >
              <LuX size={18} />
            </button>
            <p className="font-medium text-zinc-400 uppercase tracking-widest">
              {isCreating
                ? "New Event"
                : `${mode === "edit" ? "Editing: " : ""}${selectedEvent?.title}`}
            </p>
          </DrawerHeader>

          {mode === "edit" ? (
            <CalendarForm slotInfo={slotInfo} />
          ) : selectedEvent ? (
            <>
              <EventDrawerTemplate selectedEvent={selectedEvent} />
              <div className="shrink-0 bg-white px-5 py-4 border-t border-zinc-100">
                <Button onClick={handleEventClose} className="w-full">
                  Close
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </ShadDrawer>
  );
};
