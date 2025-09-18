'use client'

import { useTheme } from "@/contexts";

export default function StatsPage() {

    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${themeClasses.background} ${themeClasses.text} bg-[size:20px_20px] bg-[-1px_-1px] bg-fixed`}>
            
        </div>
    )
}