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
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
              {isCreating
                ? "New Event"
                : mode === "edit"
                  ? "Edit Event"
                  : "Event"}
            </p>
          </DrawerHeader>

          {mode === "edit" ? (
            <CalendarForm slotInfo={slotInfo} />
          ) : selectedEvent ? (
            <>
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {/* Date & Time */}
                <div className="flex gap-8">
                  <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-lg font-medium">
                      Start
                    </p>
                    <div className="flex gap-2 items-center">
                      <LuCalendarDays
                        size={16}
                        className="text-zinc-400 shrink-0"
                      />
                      <p className="text-sm text-zinc-700">
                        {format(
                          new Date(selectedEvent.startDate),
                          "do MMMM yyyy",
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <LuClock size={13} className="text-zinc-400" />
                      {format(new Date(selectedEvent.startDate), "HH:mm")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-lg font-medium">
                      End
                    </p>
                    <div className="flex gap-2 items-center">
                      <LuCalendarDays
                        size={16}
                        className="text-zinc-400 shrink-0"
                      />
                      <p className="text-sm text-zinc-700">
                        {format(
                          new Date(selectedEvent.endDate),
                          "do MMMM yyyy",
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-zinc-500">
                      <LuClock size={13} className="text-zinc-400" />
                      {format(new Date(selectedEvent.endDate), "HH:mm")}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-lg font-medium">
                    Description
                  </p>
                  <div
                    className="[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 text-sm text-zinc-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: lexicalToHtml(selectedEvent.description),
                    }}
                  />
                </div>

                {/* Contact Details */}
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-lg font-medium">
                    Contact Details
                  </p>
                  <div className="divide-y divide-zinc-100">
                    <div className="flex items-center gap-3 py-3">
                      <LuUser size={15} className="text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700">
                        {selectedEvent.contactFirstName}{" "}
                        {selectedEvent.contactLastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-3">
                      <LuPhone size={15} className="text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700">
                        {selectedEvent.contactPhone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-3">
                      <LuMail size={15} className="text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700">
                        {selectedEvent.contactEmail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
