"use server";

import nodemailer from "nodemailer";

interface SendMailProps {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ email, subject, html }: SendMailProps) => {
  if (!email || !subject || !html) {
    throw new Error("Missing required fields: email, subject, message");
  }

  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP credentials not configured");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: process.env.SMTP_EMAIL,
    replyTo: email,
    subject,
    html,
  });

  return { success: true, messageId: info.messageId };
};
