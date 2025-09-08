"use client";

import React, { useState, useEffect, ReactNode } from 'react';

interface ThemeProviderProps {
    children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

    useEffect(() => {
        // 클라이언트 사이드에서만 실행되도록 보장
        if (typeof window !== 'undefined') {
            setMounted(true);
            
            // 로컬 스토리지에서 테마 불러오기
            try {
                const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
                if (savedTheme) {
                    setTheme(savedTheme);
                }
            } catch (error) {
                console.error('테마 로딩 중 오류 발생:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (!mounted || typeof window === 'undefined') return;

        try {
            const root = document.documentElement;
            
            if (theme === 'dark') {
                root.classList.add('dark');
            } else if (theme === 'light') {
                root.classList.remove('dark');
            } else {
                // system 모드일 때
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                if (mediaQuery.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        } catch (error) {
            console.error('테마 적용 중 오류 발생:', error);
        }
    }, [theme, mounted]);

    if (!mounted) {
        return null;
    }

    return (
        <div>
            {children}
        </div>
    );
}
