import React from 'react';

interface StatsCardProps {
    label: string;
    value: React.ReactNode;
    sub?: string;
    color?: string;
    bg?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    percentage?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
    label, 
    value, 
    sub, 
    bg, 
    icon, 
    trend, 
    percentage 
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
                <div 
                    className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-sm sm:text-base"
                    style={{ background: bg || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                    {icon}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
            </div>
            {percentage && (
                <div className={`flex items-center gap-1 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                    trend === 'up' 
                        ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                        : trend === 'down'
                        ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                        : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
                }`}>
                    {trend === 'up' && '↗'}
                    {trend === 'down' && '↘'}
                    {trend === 'neutral' && '→'}
                    {percentage}
                </div>
            )}
        </div>
        
        {/* 메인 값 */}
        <div className="mb-1 sm:mb-2">
            <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {value}
            </div>
        </div>
        
        {/* 서브 텍스트 */}
        {sub && (
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {sub}
            </div>
        )}
    </div>
);

export default StatsCard;
