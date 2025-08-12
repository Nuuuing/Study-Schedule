import React from 'react';
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STUDY SCHEDULE",
  description: "STUDY SCHEDULER",
};



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SSR에서 쿠키 기반으로 테마 결정
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value;
  const resolvedTheme = (theme === 'dark' || theme === 'light') ? theme : 'light';
  return (
    <html lang="ko" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased${resolvedTheme === 'dark' ? ' dark' : ''}`}
        data-theme={resolvedTheme}
      >
        {children}
        {/* hydration 후 JS에서 theme 쿠키 동기화 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = document.cookie.match(/(?:^|; )theme=([^;]*)/);
                if (!theme) {
                  var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.cookie = 'theme=' + sys + '; path=/;';
                  document.documentElement.classList.toggle('dark', sys === 'dark');
                } else {
                  document.documentElement.classList.toggle('dark', theme[1] === 'dark');
                }
              })();
            `
          }}
        />
      </body>
    </html>
  );
}