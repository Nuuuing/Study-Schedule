import "./globals.css";
import type { Metadata } from "next";

import ThemeProvider from './ThemeProvider';

export const metadata: Metadata = {
  title: "STUDY SCHEDULE",
  description: "STUDY SCHEDULER",
};

export default function RootLayout() {
  return (
    <html lang="ko" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider />
      </body>
    </html>
  );
}