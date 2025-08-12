import React from 'react';

interface StatsCardProps {
    label: string;
    value: React.ReactNode;
    sub?: string;
    color?: string;
    bg?: string;
    icon?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, sub, color, bg, icon }) => (
    <div
        className={`rounded-xl p-4 flex flex-col gap-1 shadow-md`}
        style={{ background: bg || 'linear-gradient(135deg, #23244a 60%, #3b82f6 100%)', color: color || '#fff' }}
    >
        <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
            {icon}
            <span>{label}</span>
        </div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
);

export default StatsCard;
