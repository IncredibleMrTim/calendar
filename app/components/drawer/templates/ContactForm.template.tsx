"use client";
import { cva } from "class-variance-authority";

import { DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/useIsMobile";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendEmail } from "@/actions/mail.actions";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DrawerHeader } from "../DrawerHeader";
import { ContactEmailTemplate } from "./ContactEmail.template";
import { useState } from "react";

const drawerInner = cva(
  "flex flex-col h-full bg-zinc-50 transition-[transform,opacity] duration-300 ease-in-out " +
    "group-data-[state=open]/drawer-content:opacity-100 " +
    "group-data-[state=closed]/drawer-content:opacity-0",
  {
    variants: {
      device: {
        mobile: "group-data-[state=closed]/drawer-content:translate-y-4",
        desktop:
          "rounded-xl border border-zinc-200 shadow-xl group-data-[state=closed]/drawer-content:translate-x-8",
      },
    },
  },
);

interface ContactFormTemplateProps {
  onClose?: () => void;
  user?: { firstName?: string; lastName?: string; email?: string };
}

const formSchema = z.object({
  firstName: z.string().nonempty("Enter First name"),
  lastName: z.string().nonempty("Enter Last name"),
  email: z
    .string()
    .min(1, "Enter email address")
    .check(z.email("Invalid email address")),
  subject: z.string().nonempty("Enter a subject"),
  message: z.string().nonempty("Enter a message"),
});

export const ContactFormTemplate = ({ onClose, user }: ContactFormTemplateProps) => {
  const isMobile = useIsMobile();
  const [emailSuccess, setEmailSuccess] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      subject: "",
      message: "",
    },
  });

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await sendEmail({
        email: data.email,
        subject: data.subject,
        html: ContactEmailTemplate({
          email: data.email,
          message: data.message,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      });
      setEmailSuccess({ success: true, message: "" });
    } catch (error) {
      setEmailSuccess({
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  return (
    <div
      className={`${drawerInner({ device: isMobile ? "mobile" : "desktop" })} `}
    >
      <DrawerTitle className="hidden">Contact Us</DrawerTitle>
      <DrawerHeader title="Contact Us" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5">
        <DrawerDescription className="mb-4">
          Nulla vitae neque quis quam volutpat accumsan vel vitae quam. Etiam
          hendrerit lorem a dignissim condimentum. Sed venenatis ligula et urna
          porttitor lacinia. Maecenas pulvinar.
        </DrawerDescription>
        {emailSuccess?.success ? (
          <>
            <div>
              Thanks for your message, one of our team will be in touch with you
              shortly.
            </div>
            <Button
              type="button"
              variant={emailSuccess?.success ? "default" : "outline"}
              onClick={onClose}
              className={`${emailSuccess?.success ? "w-full!" : "w-auto"} mt-4`}
            >
              Close
            </Button>
          </>
        ) : (
          <form
            id="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              setTimeout(() => form.handleSubmit(handleFormSubmit)(), 0);
            }}
            className="flex flex-col gap-4"
          >
            {emailSuccess?.message && (
              <div className="flex flex-col gap-2 border p-2 rounded-md bg-gray-100">
                <span className="text-red-500">
                  We apologise for any inconvenience, but there was a problem
                  sending your message, please try again or email us at:
                </span>
                <a
                  href="mailto:info@pageantcalendar.co.uk"
                  className="text-blue-500 hover:underline"
                >
                  info@pageantcalendar.co.uk
                </a>
              </div>
            )}
            <FieldGroup>
              <div className="flex  gap-4">
                <Controller
                  name="firstName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="">
                      <FieldLabel>First name</FieldLabel>
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
                  name="lastName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="">
                      <FieldLabel>Last name</FieldLabel>
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
              </div>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="">
                    <FieldLabel>Email Address</FieldLabel>
                    <Input type="email" {...field} />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="absolute -bottom-7 right-0 w-auto!"
                      />
                    )}
                  </Field>
                )}
              />

              <div className="flex flex-col gap-2">
                <Controller
                  name="subject"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="">
                      <FieldLabel>Subject</FieldLabel>
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
                  name="message"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                      <FieldLabel className="hidden">Message</FieldLabel>
                      <Textarea
                        {...field}
                        className="min-h-40 field-sizing-fixed"
                        placeholder="Enter message"
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
              </div>
            </FieldGroup>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!form.formState.isValid}>
                Send
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
