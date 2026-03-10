"use client";
import { useState, useCallback, useMemo } from "react";
import {
  dateFnsLocalizer,
  Event,
  ToolbarProps as RBCToolbarProps,
  View,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enUS } from "date-fns/locale";
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

const BigCalendar = dynamic(
  () => import("react-big-calendar").then((mod) => mod.Calendar),
  {
    ssr: false,
    loading: () => <div>Loading calendar...</div>,
  },
);

interface CustomEvent extends Event {
  description?: string;
}

export const Calendar = () => {
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [calendarView, setCalendarView] = useState<View>("week");

  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales: { "en-US": enUS },
      }),
    [],
  );

  const events: CustomEvent[] = [
    {
      start: new Date("2026-03-10T10:00:00Z"),
      end: new Date("2026-03-10T11:00:00Z"),
      title: "Some Text",
      description: "Some description text goes here",
    },
  ];

  const onSelectEvent = useCallback((calEvent: CustomEvent) => {
    setSelectedEvent(calEvent);
  }, []);

  const onCreateEvent = () => {
    const now = new Date();
    form.reset({
      title: "",
      description: "",
      startDate: now,
      endDate: addMinutes(now, 30),
    });
    setIsCreating(true);
  };

  const onViewChange = (view: View) => {
    setCalendarView(view);
  };

  const formSchema = z.object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters.")
      .max(32, "Title can only be 32 characters long."),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters long.")
      .max(500, "Description can only be 500 characters long."),
    startDate: z.date().min(new Date(), "Start Date cannot be in the past."),
    endDate: z
      .date()
      .min(
        addMinutes(new Date(), 30),
        "End Date must be at least 30 minutes after the start time.",
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  const CustomToolbar = (toolbar: RBCToolbarProps<CustomEvent>) => {
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
        startAccessor={(event: CustomEvent) => event.start!}
        endAccessor={(event: CustomEvent) => event.end!}
        events={events}
        view={calendarView}
        onView={onViewChange}
        defaultDate={new Date()}
        style={{ height: "calc(100vh - 100px)" }}
        onSelectEvent={onSelectEvent}
        components={{ toolbar: CustomToolbar }}
      />
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent>
          <DialogTitle>{selectedEvent?.title}</DialogTitle>
          {selectedEvent?.description}
        </DialogContent>
      </Dialog>
      <Dialog open={!!isCreating} onOpenChange={() => setIsCreating(false)}>
        <DialogContent>
          <DialogTitle>Creating New Event</DialogTitle>
          <form id="create-event-form">
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
              <Controller
                name="startDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
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
                name="endDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
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
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
