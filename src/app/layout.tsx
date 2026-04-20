import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Women in Chess — a data story",
  description:
    "Did The Queen's Gambit really change chess? A data exploration of participation, peak age, and the rating gap at the FIDE elite level.",
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
