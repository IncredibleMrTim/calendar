import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  createEvent,
  EventDTO,
  getEvents,
  updateEvent,
  deleteEvent,
} from "@/actions/events.action";
import * as z from "zod";
import { formSchema } from "../components/calendar/CalendarModal";

interface EventStore {
  events: EventDTO[] | null;
  selectedEvent: EventDTO | null;
  isCreating: boolean;
  isDeleting: boolean;

  // Actions
  fetchEvents: () => Promise<void>;
  setIsDeleting: (value: boolean) => void;
  onCreateEvent: () => void;
  onSelectEvent: (event: EventDTO) => void;
  handleEventClose: () => void;
  handleFormSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export const useEventStore = create<EventStore>()(
  devtools(
    (set, get) => ({
      events: null,
      selectedEvent: null,
      isCreating: false,
      isDeleting: false,

      fetchEvents: async () => {
        const events = await getEvents();
        set({ events }, false, "fetchEvents");
      },

      setIsDeleting: (value: boolean) => {
        set({ isDeleting: value }, false, "setIsDeleting");
      },

      onCreateEvent: () => {
        set({ isCreating: true }, false, "onCreateEvent");
      },

      onSelectEvent: (event: EventDTO) => {
        set({ selectedEvent: event }, false, "onSelectEvent");
      },

      handleEventClose: () => {
        set(
          { selectedEvent: null, isCreating: false, isDeleting: false },
          false,
          "handleEventClose",
        );
      },

      handleFormSubmit: async (data: z.infer<typeof formSchema>) => {
        const { selectedEvent, events } = get();

        const [startHours, startMinutes] = data.startTime
          .split(":")
          .map(Number);
        const startDate = new Date(data.startDate);
        startDate.setHours(startHours, startMinutes, 0, 0);

        const [endHours, endMinutes] = data.endTime.split(":").map(Number);
        const endDate = new Date(data.endDate);
        endDate.setHours(endHours, endMinutes, 0, 0);

        let newEvent: EventDTO;

        if (selectedEvent) {
          const eventData = {
            id: selectedEvent.id,
            title: data.title,
            description: data.description,
            startDate,
            endDate,
          } as EventDTO;
          newEvent = await updateEvent(eventData);
          set(
            {
              events: (events || []).map((event) =>
                event.id === selectedEvent.id ? newEvent : event,
              ),
            },
            false,
            "updateEvent",
          );
        } else {
          const eventData = {
            title: data.title,
            description: data.description,
            startDate,
            endDate,
          };
          newEvent = await createEvent(eventData as EventDTO);
          set({ events: [...(events || []), newEvent] }, false, "createEvent");
        }

        get().handleEventClose();
      },

      handleDelete: async () => {
        const { selectedEvent, events } = get();
        if (!selectedEvent) return;

        await deleteEvent(selectedEvent);
        set(
          {
            events: (events || []).filter(
              (event) => event.id !== selectedEvent.id,
            ),
          },
          false,
          "deleteEvent",
        );
        get().handleEventClose();
      },
    }),
    {
      name: "CalendarEventStore",
    },
  ),
);
