import { useState, useEffect } from "react";
import {
  createEvent,
  EventDTO,
  getEvents,
  updateEvent,
  deleteEvent,
} from "@/actions/events.action";
import * as z from "zod";
import { formSchema } from "./CalendarModal";

export const useCalendarEvents = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventDTO | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [events, setEvents] = useState<EventDTO[] | null>(null);

  useEffect(() => {
    (async () => {
      const e = await getEvents();
      setEvents(e);
    })();
  }, []);

  const onCreateEvent = () => {
    setIsCreating(true);
  };

  const onSelectEvent = (event: EventDTO) => {
    setSelectedEvent(event);
  };

  const handleEventClose = () => {
    setSelectedEvent(null);
    setIsCreating(false);
    setIsDeleting(false);
  };

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    const [startHours, startMinutes] = data.startTime.split(":").map(Number);
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
      setEvents((prevEvents) =>
        (prevEvents || []).map((event) =>
          event.id === selectedEvent.id ? newEvent : event,
        ),
      );
    } else {
      const eventData = {
        title: data.title,
        description: data.description,
        startDate,
        endDate,
      };
      newEvent = await createEvent(eventData as EventDTO);
      setEvents((prevEvents) => [...(prevEvents || []), newEvent]);
    }

    handleEventClose();
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    await deleteEvent(selectedEvent);
    setEvents((prevEvents) =>
      (prevEvents || []).filter((event) => event.id !== selectedEvent.id),
    );
    handleEventClose();
  };

  return {
    events,
    selectedEvent,
    isCreating,
    isDeleting,
    setIsDeleting,
    onCreateEvent,
    onSelectEvent,
    handleEventClose,
    handleFormSubmit,
    handleDelete,
  };
};
