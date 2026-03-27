"use server";

import nodemailer from "nodemailer";

interface EmailUser {
  email: string;
}

export const sendEmail = async (
  user: EmailUser,
  subject: string,
  html: string,
) => {
  if (!user.email || !subject || !html) {
    throw new Error("Missing required fields: user.email, subject, html");
  }

  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP credentials not configured");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      type: "OAUTH2",
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: process.env.SMTP_EMAIL,
    replyTo: user.email,
    subject,
    html,
  });

  return { success: true, messageId: info.messageId };
};
