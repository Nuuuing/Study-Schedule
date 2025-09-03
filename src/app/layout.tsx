import "./globals.css";
import type { Metadata } from "next";

import ThemeProvider from './ThemeProvider';
import { Provider } from "@/components/ui/provider"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://study-schedule-f7005.web.app' : 'http://localhost:3000'),
  title: "STUDY SCHEDULE",
  description: "STUDY SCHEDULER",
  openGraph: {
    title: 'STUDY SCHEDULER',
    description: 'STUDY SCHEDULER with Firebase.',
    images: ['/cover.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Provider>
          <ThemeProvider>
              {children}            
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}