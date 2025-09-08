"use client";

import React, { ReactNode, StrictMode } from 'react';
import ThemeProvider from './ThemeProvider';
import { ToastProvider } from '@/contexts';

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
                <ThemeProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </ThemeProvider>
    );
}
