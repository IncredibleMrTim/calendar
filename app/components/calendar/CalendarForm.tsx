import { useEventStore } from "@/stores/useEventStore";
import { addMinutes, format } from "date-fns";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";
import { Rte } from "../rte/Rte";
import { Button } from "../ui/button";
import { SlotInfo } from "react-big-calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { lexicalToText } from "@/utils/lexical";

const formatTimeString = (date: Date) => format(date, "HH:mm");

const formSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters.")
      .max(32, "Title can only be 32 characters long."),
    description: z.string().refine(
      (val) => lexicalToText(val).trim().length > 0,
      { message: "Description is required." },
    ),
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

interface CalendarFormProps {
  slotInfo?: SlotInfo;
}

export const CalendarForm = ({ slotInfo }: CalendarFormProps) => {
  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const isDeleting = useEventStore((state) => state.isDeleting);
  const isEventInPast = useEventStore((state) => state.isEventInPast);
  const setIsDeleting = useEventStore((state) => state.setIsDeleting);
  const handleEventClose = useEventStore((state) => state.handleEventClose);
  const handleFormSubmit = useEventStore((state) => state.handleFormSubmit);
  const handleDelete = useEventStore((state) => state.handleDelete);

  const now = new Date();
  const currentTime = formatTimeString(now);
  const endDateDefault = addMinutes(now, 60);
  const endTimeString = formatTimeString(endDateDefault);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: selectedEvent
      ? {
          title: selectedEvent.title,
          description: selectedEvent.description ?? "",
          startDate: new Date(selectedEvent.startDate),
          startTime: formatTimeString(new Date(selectedEvent.startDate)),
          endDate: new Date(selectedEvent.endDate ?? selectedEvent.startDate),
          endTime: formatTimeString(
            new Date(selectedEvent.endDate ?? selectedEvent.startDate),
          ),
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
          startTime: currentTime,
          endDate: endDateDefault,
          endTime: endTimeString,
          contactFirstName: "",
          contactLastName: "",
          contactPhone: "",
          contactEmail: "",
        },
  });

  return (
    <>
      <form
        id="create-event-form"
        onSubmit={(e) => {
          e.preventDefault();
          setTimeout(() => form.handleSubmit(handleFormSubmit)(), 0);
        }}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="">
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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-muted-foreground text-lg">
                    Description
                  </FieldLabel>
                  <Rte
                    {...field}
                    data-invalid={fieldState.invalid}
                    disabled={isEventInPast}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <div className="space-y-2 my-6">
              <FieldLabel className="text-muted-foreground text-lg">
                Contact Details
              </FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="contactFirstName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="relative"
                    >
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
                    <Field
                      data-invalid={fieldState.invalid}
                      className="relative"
                    >
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
                    <Field
                      data-invalid={fieldState.invalid}
                      className="relative"
                    >
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
                    <Field
                      data-invalid={fieldState.invalid}
                      className="relative"
                    >
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
            </div>
          </FieldGroup>
        </div>
        <div className="shrink-0 bg-white px-5 py-4 border-t border-zinc-100">
          <div className="flex justify-between flex-row-reverse">
            <div className="flex gap-2 justify-end">
              {selectedEvent && !isEventInPast && (
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
                <Button type="submit" disabled={!form.formState.isValid}>
                  Submit
                </Button>
              )}
            </div>
            <Button
              onClick={handleEventClose}
              variant={isEventInPast ? "default" : "outline"}
              className={`${isEventInPast ? "w-full" : ""}`}
            >
              Close
            </Button>
          </div>
        </div>
      </form>
      {isDeleting && (
        <div className="text-red-500">
          You are about to delete this event. Please confirm deletion or cancel.
        </div>
      )}
    </>
  );
};
