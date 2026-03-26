import type { Metadata } from "next";
import "./globals.css";
import GoogleProvider from "@/components/providers/GoogleProvider";

export const metadata: Metadata = {
  title: "UK Pageant Calendar",
  description: "Welcome to the UK Pageant Calendar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <GoogleProvider>{children}</GoogleProvider>
      </body>
    </html>
  );
}
