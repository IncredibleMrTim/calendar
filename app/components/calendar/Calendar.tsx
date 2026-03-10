"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Event as EventDto } from "@prisma/client";
import {
  dateFnsLocalizer,
  Calendar as RBCCalendar,
  ToolbarProps as RBCToolbarProps,
  View,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enGB } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Input } from "../ui/input";

import dynamic from "next/dynamic";
import { Textarea } from "../ui/textarea";
import {
  createEvent,
  EventDTO,
  getEvents,
  updateEvent,
} from "@/actions/events.action";

const BigCalendar = dynamic(() => Promise.resolve(RBCCalendar), {
  ssr: false,
  loading: () => <div>Loading calendar...</div>,
}) as typeof RBCCalendar;

interface CalendarEvent extends EventDTO {
  start: Date;
  end: Date;
}

export const Calendar = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventDTO | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [calendarView, setCalendarView] = useState<View>("week");
  const [events, setEvents] = useState<EventDTO[] | null>(null);
  useEffect(() => {
    (async () => {
      const e = await getEvents();
      setEvents(e);
    })();
  }, []);

  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales: { "en-GB": enGB },
      }),
    [],
  );

  const onCreateEvent = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const endDate = addMinutes(now, 30);
    const endTimeString = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

    form.reset({
      title: "",
      description: "",
      startDate: now,
      startTime: currentTime,
      endDate,
      endTime: endTimeString,
    });
    setIsCreating(true);
  };

  const onViewChange = (view: View) => {
    setCalendarView(view);
  };

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const endDateDefault = addMinutes(now, 30);
  const endTimeString = `${String(endDateDefault.getHours()).padStart(2, "0")}:${String(endDateDefault.getMinutes()).padStart(2, "0")}`;

  const formSchema = z
    .object({
      title: z
        .string()
        .min(5, "Title must be at least 5 characters.")
        .max(32, "Title can only be 32 characters long."),
      description: z
        .string()
        .max(500, "Description can only be 500 characters long."),
      startDate: z
        .date()
        .refine(() => true, "Start Date cannot be in the past."),
      startTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
      endDate: z.date(),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
    })
    .refine(
      (data) => {
        const startDateTime = new Date(data.startDate);
        const [hours, minutes] = data.startTime.split(":").map(Number);
        startDateTime.setHours(hours, minutes, 0, 0);
        return startDateTime > new Date();
      },
      {
        message: "Start date and time cannot be in the past.",
        path: ["startDate"],
      },
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      startDate: now,
      startTime: currentTime,
      endDate: endDateDefault,
      endTime: endTimeString,
    },
  });

  useEffect(() => {
    if (selectedEvent) {
      const startTimeString = `${String(selectedEvent.startDate.getHours()).padStart(2, "0")}:${String(selectedEvent.startDate.getMinutes()).padStart(2, "0")}`;
      const endTimeString = `${String(selectedEvent.endDate.getHours()).padStart(2, "0")}:${String(selectedEvent.endDate.getMinutes()).padStart(2, "0")}`;
      form.reset({
        title: selectedEvent.title,
        description: selectedEvent.description,
        startDate: selectedEvent.startDate,
        startTime: startTimeString,
        endDate: selectedEvent.endDate,
        endTime: endTimeString,
      });
    }
  }, [selectedEvent, form]);

  const handleFromSubmit = async (data: z.infer<typeof formSchema>) => {
    const [startHours, startMinutes] = data.startTime.split(":").map(Number);
    const startDate = new Date(data.startDate);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const [endHours, endMinutes] = data.endTime.split(":").map(Number);
    const endDate = new Date(data.endDate);
    endDate.setHours(endHours, endMinutes, 0, 0);

    let newEvent: EventDTO;

    if (selectedEvent) {
      const eventData: EventDTO = {
        id: selectedEvent.id,
        title: data.title,
        description: data.description,
        startDate,
        endDate,
      };
      newEvent = await updateEvent(eventData);
      setEvents((prevEvents) =>
        (prevEvents || []).map((event) =>
          event.id === selectedEvent.id ? newEvent : event,
        ),
      );
    } else {
      const eventData: Omit<EventDTO, "id"> = {
        title: data.title,
        description: data.description,
        startDate,
        endDate,
      };
      newEvent = await createEvent(eventData);
      setEvents((prevEvents) => [...(prevEvents || []), newEvent]);
    }

    setSelectedEvent(null);
    setIsCreating(false);
  };

  const CustomToolbar = (toolbar: RBCToolbarProps<CalendarEvent>) => {
    return (
      <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
        <div className="flex gap-2">
          <Button
            onClick={() => toolbar.onNavigate("TODAY")}
            className="px-3 py-1 bg-blue-500 text-white"
          >
            Today
          </Button>
          <Button
            onClick={() => toolbar.onNavigate("PREV")}
            className="px-3 py-1 bg-gray-300"
          >
            Back
          </Button>
          <Button
            onClick={() => toolbar.onNavigate("NEXT")}
            className="px-3 py-1 bg-gray-300"
          >
            Next
          </Button>
        </div>
        <h2 className="text-lg font-semibold">{toolbar.label}</h2>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onViewChange("month")}>
              Month
            </Button>
            <Button variant="outline" onClick={() => onViewChange("week")}>
              Week
            </Button>
            <Button variant="outline" onClick={() => onViewChange("day")}>
              Day
            </Button>
            <Button variant="outline" onClick={() => onViewChange("agenda")}>
              Agenda
            </Button>
          </div>
          <Button
            className="px-3 py-1 bg-green-500 text-white"
            onClick={() => onCreateEvent()}
          >
            + Add Event
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <BigCalendar
        localizer={localizer}
        startAccessor={(event: CalendarEvent) => event.start}
        endAccessor={(event: CalendarEvent) => event.end}
        events={(events || []).map(
          (event): CalendarEvent => ({
            ...event,
            start: event.startDate,
            end: event.endDate,
          }),
        )}
        view={calendarView}
        onView={onViewChange}
        defaultDate={new Date()}
        style={{ height: "calc(100vh - 100px)" }}
        onSelectEvent={(event: CalendarEvent) => setSelectedEvent(event)}
        components={{ toolbar: CustomToolbar }}
      />

      <Dialog
        open={!!isCreating || !!selectedEvent}
        onOpenChange={() => {
          setIsCreating(false);
          setSelectedEvent(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Creating New Event</DialogTitle>
          <form
            id="create-event-form"
            onSubmit={form.handleSubmit(handleFromSubmit)}
          >
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>Title</FieldLabel>
                    <Input {...field} />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="absolute -bottom-7 right-0 w-auto!"
                      />
                    )}
                  </Field>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="startDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="relative"
                    >
                      <FieldLabel>Start Date</FieldLabel>
                      <DatePicker
                        {...field}
                        onSelect={field.onChange}
                        data-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="absolute -bottom-7 right-0 w-auto!"
                        />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="startTime"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="relative"
                    >
                      <FieldLabel>Start Time</FieldLabel>
                      <Input type="time" {...field} />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="absolute -bottom-7 right-0 w-auto!"
                        />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="endDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="relative"
                    >
                      <FieldLabel>End Date</FieldLabel>
                      <DatePicker
                        value={field.value}
                        onSelect={field.onChange}
                        data-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="absolute -bottom-7 right-0 w-auto!"
                        />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="endTime"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="relative"
                    >
                      <FieldLabel>End Time</FieldLabel>
                      <Input type="time" {...field} />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="absolute -bottom-7 right-0 w-auto!"
                        />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      {...field}
                      data-invalid={fieldState.invalid}
                      maxLength={500}
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="absolute -bottom-7 right-0 w-auto!"
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <Button type="submit">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
