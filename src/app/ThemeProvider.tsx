"use client";
import React, { useState, useEffect } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import Home from './page';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function ThemeProvider() {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (!mounted) {
        return null; // hydration 문제 방지
    }
    
    return (
        <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <Home />
        </div>
    );
}
