"use client";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import {
  Field,
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

import { addMinutes, format } from "date-fns";
import { useEventStore } from "../../stores/useEventStore";
import { Rte } from "../rte/Rte";
import { SlotInfo } from "react-big-calendar";

const formatTimeString = (date: Date) => format(date, "HH:mm");

const now = new Date();
const currentTime = formatTimeString(now);
const endDateDefault = addMinutes(now, 30);
const endTimeString = formatTimeString(endDateDefault);

const formSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters.")
      .max(32, "Title can only be 32 characters long."),
    description: z.string(),
    startDate: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
    endDate: z.date(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
    contactFirstName: z.string().optional(),
    contactLastName: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z
      .union([z.email("Invalid email address"), z.literal("")])
      .optional(),
  })
  .refine(
    (data) => {
      const state = useEventStore.getState();
      const isEditing = !!state.selectedEvent;
      if (isEditing) return true;
      const startDateTime = new Date(data.startDate);
      const [hours, minutes] = data.startTime.split(":").map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      const now = new Date();
      return startDateTime >= new Date(now.getTime() - 300000);
    },
    {
      message: "Start date and time cannot be in the past.",
      path: ["startDate"],
    },
  );

export type FormSchema = z.infer<typeof formSchema>;
export { formSchema };

interface CalendarModalProps {
  slotInfo?: SlotInfo;
}

export const CalendarModal = ({ slotInfo }: CalendarModalProps) => {
  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const isCreating = useEventStore((state) => state.isCreating);
  const isDeleting = useEventStore((state) => state.isDeleting);
  const setIsDeleting = useEventStore((state) => state.setIsDeleting);
  const handleEventClose = useEventStore((state) => state.handleEventClose);
  const handleFormSubmit = useEventStore((state) => state.handleFormSubmit);
  const handleDelete = useEventStore((state) => state.handleDelete);

  const isEventInPast = selectedEvent
    ? selectedEvent.endDate < new Date()
    : false;
  const isOpen = Boolean(isCreating || selectedEvent);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      startDate:
        slotInfo?.start && slotInfo.start >= now ? slotInfo.start : now,
      startTime:
        slotInfo?.start && slotInfo.start >= now
          ? formatTimeString(slotInfo.start)
          : currentTime,
      endDate:
        slotInfo?.end && slotInfo.end >= now ? slotInfo.end : endDateDefault,
      endTime:
        slotInfo?.end && slotInfo.end >= now
          ? formatTimeString(slotInfo.end)
          : endTimeString,
      contactFirstName: "",
      contactLastName: "",
      contactPhone: "",
      contactEmail: "",
    },
  });

  useEffect(() => {
    const resetData = selectedEvent
      ? {
          title: selectedEvent.title,
          description: selectedEvent.description,
          startDate: selectedEvent.startDate,
          startTime: formatTimeString(selectedEvent.startDate),
          endDate: selectedEvent.endDate,
          endTime: formatTimeString(selectedEvent.endDate),
          contactFirstName: selectedEvent.contactFirstName ?? "",
          contactLastName: selectedEvent.contactLastName ?? "",
          contactPhone: selectedEvent.contactPhone ?? "",
          contactEmail: selectedEvent.contactEmail ?? "",
        }
      : {
          title: "",
          description: "",
          startDate:
            slotInfo?.start && slotInfo.start >= now ? slotInfo.start : now,
          startTime:
            slotInfo?.start && slotInfo.start >= now
              ? formatTimeString(slotInfo.start)
              : currentTime,
          endDate:
            slotInfo?.end && slotInfo.end >= now
              ? slotInfo.end
              : endDateDefault,
          endTime:
            slotInfo?.end && slotInfo.end >= now
              ? formatTimeString(slotInfo.end)
              : endTimeString,
          contactFirstName: "",
          contactLastName: "",
          contactPhone: "",
          contactEmail: "",
        };

    form.reset(resetData);
    if (selectedEvent) form.clearErrors();
  }, [selectedEvent, isCreating, slotInfo, form]);

  return (
    <Dialog open={isOpen} onOpenChange={handleEventClose}>
      <DialogContent>
        <DialogTitle>{isCreating ? "Create Event" : "Edit Event"}</DialogTitle>
        <form
          id="create-event-form"
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="relative">
                  <FieldLabel>Title</FieldLabel>
                  <Input {...field} disabled={isEventInPast} />
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
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>Start Date</FieldLabel>
                    <DatePicker
                      {...field}
                      onSelect={field.onChange}
                      data-invalid={fieldState.invalid}
                      disabled={isEventInPast}
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
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>Start Time</FieldLabel>
                    <Input type="time" {...field} disabled={isEventInPast} />
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
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>End Date</FieldLabel>
                    <DatePicker
                      value={field.value}
                      onSelect={field.onChange}
                      data-invalid={fieldState.invalid}
                      disabled={isEventInPast}
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
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>End Time</FieldLabel>
                    <Input type="time" {...field} disabled={isEventInPast} />
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
                  <Rte
                    {...field}
                    data-invalid={fieldState.invalid}
                    disabled={isEventInPast}
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

          <FieldGroup>
            <p className="text-sm font-medium text-muted-foreground">Contact Details</p>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="contactFirstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>First Name</FieldLabel>
                    <Input {...field} disabled={isEventInPast} />
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
                name="contactLastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>Last Name</FieldLabel>
                    <Input {...field} disabled={isEventInPast} />
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
                name="contactPhone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>Phone</FieldLabel>
                    <Input type="tel" {...field} disabled={isEventInPast} />
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
                name="contactEmail"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel>Email</FieldLabel>
                    <Input type="email" {...field} disabled={isEventInPast} />
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
          </FieldGroup>

          <div className="flex justify-between flex-row-reverse">
            <div className="flex gap-2 justify-end">
              {selectedEvent && (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      !isDeleting ? setIsDeleting(true) : handleDelete()
                    }
                  >
                    {!isDeleting ? "Delete Event" : "Confirm Delete!"}
                  </Button>
                  {isDeleting && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsDeleting(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </>
              )}
              {!isDeleting && !isEventInPast && (
                <Button type="submit">Submit</Button>
              )}
            </div>
            <Button onClick={handleEventClose}>Close</Button>
          </div>
        </form>
        {isDeleting && (
          <div className="text-red-500">
            You are about to delete this event. Please confirm deletion or
            cancel.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
