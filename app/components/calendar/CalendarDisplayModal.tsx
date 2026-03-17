"use client";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { useEventStore } from "@/stores/useEventStore";
import { lexicalToHtml } from "@/utils/lexical";
import format from "date-fns/format";
import { Button } from "../ui/button";

export const CalendarDisplayModal = () => {
  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const handleEventClose = useEventStore((state) => state.handleEventClose);
  if (!selectedEvent) return null;
  return (
    <Dialog open={!!selectedEvent} onOpenChange={handleEventClose}>
      <DialogContent className="max-h-[90vh] md:max-h-2/3 overflow-y-auto">
        <DialogTitle>
          <h1 className="text-2xl">{selectedEvent?.title}</h1>
        </DialogTitle>

        <div className="flex flex-col">
          <div className="bg-blue-50 p-4 rounded-md">
            <p>
              <span className="font-bold">Start:</span>{" "}
              {format(selectedEvent?.startDate, "do MMMM yyy hh:mm")}
            </p>
            <p>
              <span className="font-bold">End:</span>{" "}
              {format(selectedEvent?.startDate, "do MMMM yyy hh:mm")}
            </p>
          </div>
        </div>

        <h2 className="font-bold text-lg">Description</h2>
        <div
          className="bg-blue-50 p-4 rounded-md [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
          dangerouslySetInnerHTML={{
            __html: lexicalToHtml(selectedEvent.description),
          }}
        />

        <h2 className="font-bold text-lg">Contact Details</h2>
        <div>
          <div className="bg-blue-50 p-4 rounded-md">
            <p>
              <span className="font-bold">Name:</span>{" "}
              {selectedEvent.contactFirstName} {selectedEvent.contactLastName}
            </p>
            <p>
              <span className="font-bold">Phone:</span>{" "}
              {selectedEvent.contactPhone}
            </p>
            <p>
              <span className="font-bold">Email:</span>{" "}
              {selectedEvent.contactEmail}
            </p>
          </div>
        </div>
        <Button onClick={handleEventClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};
