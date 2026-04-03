"use client";
import { CalendarForm, FormSchema } from "@/components/calendar/CalendarForm";
import { lexicalToHtml } from "@/utils/lexical";
import { format } from "date-fns";
import { SlotInfo } from "react-big-calendar";
import { cva } from "class-variance-authority";
import {
  LuCalendarDays,
  LuClock,
  LuUser,
  LuPhone,
  LuMail,
} from "react-icons/lu";
import { DrawerTitle } from "@/components/ui/drawer";
import { DrawerHeader } from "../DrawerHeader";
import { useIsMobile } from "@/hooks/useIsMobile";
import { EventDTO } from "@/actions/events.action";

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

interface EventDrawerTemplateProps {
  mode?: "view" | "edit";
  slotInfo?: SlotInfo;
  selectedEvent?: EventDTO | null;
  isCreating: boolean;
  isDeleting: boolean;
  isEventInPast: boolean;
  onClose: () => void;
  onSubmit: (data: FormSchema) => Promise<void>;
  onDelete: () => Promise<void>;
  onSetDeleting: (value: boolean) => void;
}

export const EventDrawerTemplate = ({
  mode = "view",
  slotInfo,
  selectedEvent,
  isCreating,
  isDeleting,
  isEventInPast,
  onClose,
  onSubmit,
  onDelete,
  onSetDeleting,
}: EventDrawerTemplateProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={drawerInner({ device: isMobile ? "mobile" : "desktop" })}>
      <DrawerTitle className="hidden">
        {isCreating
          ? "New Event"
          : `${mode === "edit" ? "Edit" : "View"}: ${selectedEvent?.title}`}
      </DrawerTitle>

      <DrawerHeader
        onClose={onClose}
        title={
          isCreating
            ? "New Event"
            : `${mode === "edit" ? "Editing: " : ""}${selectedEvent?.title}`
        }
        className="bg-white border-b border-zinc-100 py-4 flex flex-row items-center gap-2 shrink-0 rounded-t-md"
      />

      {mode === "view" && selectedEvent ? (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8">
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-lg font-medium">Start</p>
              <div className="flex gap-2 items-center">
                <LuCalendarDays size={16} className="text-zinc-400 shrink-0" />
                <p className="text-sm text-zinc-700">
                  {format(new Date(selectedEvent.startDate), "do MMMM yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <LuClock size={13} className="text-zinc-400" />
                {format(new Date(selectedEvent.startDate), "HH:mm")}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-lg font-medium">End</p>
              <div className="flex gap-2 items-center">
                <LuCalendarDays size={16} className="text-zinc-400 shrink-0" />
                <p className="text-sm text-zinc-700">
                  {format(new Date(selectedEvent.endDate), "do MMMM yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-zinc-500">
                <LuClock size={13} className="text-zinc-400" />
                {format(new Date(selectedEvent.endDate), "HH:mm")}
              </div>
            </div>
          </div>
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
      ) : (
        <CalendarForm
          slotInfo={slotInfo}
          selectedEvent={selectedEvent}
          isDeleting={isDeleting}
          isEventInPast={isEventInPast}
          onClose={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
          onSetDeleting={onSetDeleting}
        />
      )}
    </div>
  );
};
