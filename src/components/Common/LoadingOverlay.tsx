import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
    isLoading, 
    message = "로딩 중..." 
}) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                
                <p className="text-gray-700 dark:text-gray-300">
                    {message}
                </p>
            </div>
        </div>
    );
};
