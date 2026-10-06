import type { Metadata } from "next";
import "./globals.css"; // <-- THIS IS THE MISSING LINK!

export const metadata: Metadata = {
  title: "AWS Route 53 Clone",
  description: "A clone of the AWS Route53 Console",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}