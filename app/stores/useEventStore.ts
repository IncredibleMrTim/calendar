import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  createEvent,
  EventDTO,
  getEvents,
  updateEvent,
  deleteEvent,
} from "@/actions/events.action";
import { infer as zInfer } from "zod";
import { createFormSchema } from "../components/calendar/CalendarForm";
import { subHours } from "date-fns";
import { SlotInfo } from "react-big-calendar";

interface EventStore {
  events: EventDTO[] | null;
  selectedEvent: EventDTO;
  selectedSlot: SlotInfo;
  isCreating: boolean;
  isDeleting: boolean;
  isEventInPast: boolean;
  isSlotInPast: boolean;

  // Actions
  fetchEvents: () => Promise<void>;
  setIsDeleting: (value: boolean) => void;
  setIsCreating: (value: boolean) => void;

  setSelectedEvent: (event: EventDTO) => void;
  setSelectedSlot: (slot: SlotInfo) => void;
  handleEventClose: () => void;
  handleFormSubmit: (
    data: zInfer<ReturnType<typeof createFormSchema>>,
  ) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export const useEventStore = create<EventStore>()(
  devtools(
    (set, get) => ({
      events: null,
      selectedEvent: null,
      selectedSlot: null,
      isCreating: false,
      isDeleting: false,
      isEventInPast: false,
      isSlotInPast: false,

      fetchEvents: async () => {
        const events = await getEvents();
        set({ events }, false, "fetchEvents");
      },

      setIsDeleting: (value: boolean) => {
        set({ isDeleting: value }, false, "setIsDeleting");
      },

      setIsCreating: (value: boolean) => {
        set({ isCreating: value }, false, "setIsCreating");
      },

      setSelectedSlot: (slot: SlotInfo) => {
        const isPast = slot ? slot.end < subHours(new Date(), 1) : false;

        set(
          { selectedSlot: slot, isSlotInPast: isPast },
          false,
          "setSelectedSlot",
        );
      },

      setSelectedEvent: (event: EventDTO) => {
        const eventPast = event
          ? event.endDate < subHours(new Date(), 1)
          : false;

        set(
          { selectedEvent: event, isEventInPast: eventPast },
          false,
          "setSelectedEvent",
        );
      },

      handleEventClose: () => {
        set(
          {
            selectedEvent: undefined,
            selectedSlot: undefined,
            isCreating: false,
            isDeleting: false,
            isEventInPast: false,
            isSlotInPast: false,
          },
          false,
          "handleEventClose",
        );
      },

      handleFormSubmit: async (
        data: zInfer<ReturnType<typeof createFormSchema>>,
      ) => {
        const { events } = get();
        const selectedEvent = data.id
          ? ((get().events || []).find((e) => e.id === data.id) ??
            get().selectedEvent)
          : null;

        const [startHours, startMinutes] = data.startTime
          .split(":")
          .map(Number);
        const startDate = new Date(data.startDate);
        startDate.setHours(startHours, startMinutes, 0, 0);

        const [endHours, endMinutes] = data.endTime.split(":").map(Number);
        const endDate = new Date(data.endDate);
        endDate.setHours(endHours, endMinutes, 0, 0);

        let newEvent: EventDTO;

        const contactFields = {
          contactFirstName: data.contactFirstName || null,
          contactLastName: data.contactLastName || null,
          contactPhone: data.contactPhone || null,
          contactEmail: data.contactEmail || null,
        };

        if (selectedEvent) {
          const eventData = {
            id: selectedEvent.id,
            title: data.title,
            description: data.description,
            startDate,
            endDate,
            color: data.color,
            ...contactFields,
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
            color: data.color,
            ...contactFields,
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
