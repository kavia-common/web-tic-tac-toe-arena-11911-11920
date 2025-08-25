import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tic Tac Toe Arena",
  description: "Play Tic Tac Toe in User vs User or User vs Computer modes.",
  applicationName: "Tic Tac Toe Arena",
  authors: [{ name: "Tic Tac Toe" }],
};

export const viewport: Viewport = {
  themeColor: "#1976d2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
