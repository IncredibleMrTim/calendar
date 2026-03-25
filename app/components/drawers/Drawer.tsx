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
    >
      <DrawerContent
        className={drawerContent({ device: isMobile ? "mobile" : "desktop" })}
      >
        <div
          className={drawerInner({ device: isMobile ? "mobile" : "desktop" })}
        >
          <DrawerTitle className="hidden">
            {isCreating
              ? "New Event"
              : `${mode === "edit" ? "Edit" : "View"}: ${selectedEvent?.title}`}
          </DrawerTitle>
          <DrawerHeader className="bg-white border-b border-zinc-100 py-4 flex flex-row items-center gap-2 shrink-0">
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
          <div className="flex flex-col gap-5 p-5 flex-1 overflow-y-auto">
            {mode === "edit" ? (
              <CalendarForm slotInfo={slotInfo} />
            ) : selectedEvent ? (
              <>
                {/* Date & Time */}
                <div className="bg-white rounded-lg border border-zinc-100 shadow-sm divide-y divide-zinc-100">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <LuCalendarDays
                      size={16}
                      className="text-zinc-400 shrink-0"
                    />
                    <div>
                      <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                        Start
                      </p>
                      <p className="text-sm text-zinc-700">
                        {format(
                          new Date(selectedEvent.startDate),
                          "do MMMM yyyy",
                        )}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 text-sm text-zinc-500">
                      <LuClock size={13} className="text-zinc-400" />
                      {format(new Date(selectedEvent.startDate), "HH:mm")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <LuCalendarDays
                      size={16}
                      className="text-zinc-400 shrink-0"
                    />
                    <div>
                      <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                        End
                      </p>
                      <p className="text-sm text-zinc-700">
                        {format(
                          new Date(
                            selectedEvent.endDate ?? selectedEvent.startDate,
                          ),
                          "do MMMM yyyy",
                        )}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 text-sm text-zinc-500">
                      <LuClock size={13} className="text-zinc-400" />
                      {format(
                        new Date(
                          selectedEvent.endDate ?? selectedEvent.startDate,
                        ),
                        "HH:mm",
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg border border-zinc-100 shadow-sm">
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest px-4 pt-3 pb-2 border-b border-zinc-100">
                    Description
                  </h2>
                  <div
                    className="[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 text-sm text-zinc-700 leading-relaxed p-4"
                    dangerouslySetInnerHTML={{
                      __html: lexicalToHtml(selectedEvent.description),
                    }}
                  />
                </div>

                {/* Contact Details */}
                <div className="bg-white rounded-lg border border-zinc-100 shadow-sm">
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest px-4 pt-3 pb-2 border-b border-zinc-100">
                    Contact Details
                  </h2>
                  <div className="divide-y divide-zinc-50">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <LuUser size={15} className="text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700">
                        {selectedEvent.contactFirstName}{" "}
                        {selectedEvent.contactLastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <LuPhone size={15} className="text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700">
                        {selectedEvent.contactPhone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <LuMail size={15} className="text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700">
                        {selectedEvent.contactEmail}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          {mode !== "edit" && (
            <div className="px-5 pb-5 shrink-0">
              <Button
                onClick={handleEventClose}
                variant="outline"
                className="w-full text-zinc-600 border-zinc-200 hover:bg-zinc-100"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </ShadDrawer>
  );
};
