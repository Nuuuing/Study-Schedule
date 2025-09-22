import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts';

interface ToastProps {
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
    message, 
    type = 'error', 
    duration = 3000, 
    onClose 
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const { theme } = useTheme();
    const themeClasses = theme.classes;
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // 애니메이션 완료 후 제거
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastStyles = () => {
        const baseClasses = `${themeClasses.card} ${themeClasses.border} ${themeClasses.text}`;
        
        switch (type) {
            case 'error':
                return `${baseClasses} border-red-500`;
            case 'success':
                return `${baseClasses} border-green-500`;
            case 'warning':
                return `${baseClasses} border-yellow-500`;
            case 'info':
                return `${baseClasses} border-blue-500`;
            default:
                return `${baseClasses} border-red-500`;
        }
    };

    const getIcon = () => {
        const iconClass = `w-4 h-4 ${themeClasses.text}`;
        
        switch (type) {
            case 'error':
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'success':
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
        >
            <div className={`rounded-md border p-3 shadow-md backdrop-blur-sm ${getToastStyles()}`}>
                <div className="flex items-start gap-2">
                    {getIcon()}
                    <div className="flex-1">
                        <p className="text-xs leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${themeClasses.text}`}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
