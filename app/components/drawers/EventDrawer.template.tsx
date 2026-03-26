import { EventDTO } from "@/actions/events.action";
import { lexicalToHtml } from "@/utils/lexical";
import { format } from "date-fns";
import {
  LuCalendarDays,
  LuClock,
  LuUser,
  LuPhone,
  LuMail,
} from "react-icons/lu";

export const EventDrawerTemplate = ({
  selectedEvent,
}: {
  selectedEvent: EventDTO;
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8">
      {/* Date & Time */}
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

      {/* Description */}
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-lg font-medium">Description</p>
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
              {selectedEvent.contactFirstName} {selectedEvent.contactLastName}
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
  );
};
