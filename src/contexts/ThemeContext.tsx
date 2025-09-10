'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Theme, ThemeName, themes, DEFAULT_THEME } from '../modules/types/theme';

interface ThemeContextType {
    currentTheme: ThemeName;
    theme: Theme;
    setTheme: (theme: ThemeName) => void;
    availableThemes: Theme[];
}

// 테마 컨텍스트
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 쿠키 이름
const THEME_COOKIE_NAME = 'user_theme_preference';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeName>(DEFAULT_THEME);

    // 초기 테마 설정
    useEffect(() => {
        const savedTheme = Cookies.get(THEME_COOKIE_NAME) as ThemeName | undefined;
        if (savedTheme && themes[savedTheme]) {
            setCurrentTheme(savedTheme);
        }
    }, []);

    // 테마 변경시 쿠키에 저장
    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        // HTML 요소에 테마 속성 설정
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        console.log(`Theme changed to: ${currentTheme}`);

        // 쿠키에 테마 저장
        Cookies.set(THEME_COOKIE_NAME, currentTheme, { expires: 365 }); // 1년 유효
    }, [currentTheme]);

    // 테마 변경
    const setTheme = (newTheme: ThemeName) => {
        if (themes[newTheme]) {
            setCurrentTheme(newTheme);
        }
    };

    const value: ThemeContextType = {
        currentTheme,
        theme: themes[currentTheme],
        setTheme,
        availableThemes: Object.values(themes)
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
