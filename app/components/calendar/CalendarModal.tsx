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
import { CalendarForm } from "./CalendarForm";

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
      <DialogContent className="max-h-[90vh] md:max-h-2/3 overflow-y-auto">
        <DialogTitle>{isCreating ? "Create Event" : "Edit Event"}</DialogTitle>
        <CalendarForm slotInfo={slotInfo} />
      </DialogContent>
    </Dialog>
  );
};
