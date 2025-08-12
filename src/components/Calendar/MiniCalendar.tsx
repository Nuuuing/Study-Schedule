import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

type Props = {
    currentDate: Date;
};

export const MiniCalendar = ({ currentDate }: Props) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return (
        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">{format(currentDate, 'yyyy년 MM월')}</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs text-center">
                {[...'일월화수목금토'].map(d => <div key={d} className="font-bold text-gray-400">{d}</div>)}
                {days.map(day => (
                    <button
                        key={day.toISOString()}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors
                            ${isToday(day) ? 'bg-blue-500 text-white' : isSameMonth(day, currentDate) ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}
                    >
                        {format(day, 'd')}
                    </button>
                ))}
            </div>
        </div>
    );
}
