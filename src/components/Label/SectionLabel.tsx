import React from 'react';

interface SectionLabelProps {
    children: React.ReactNode;
    className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children, className = '' }) => (
    <div className={`text-5xl font-bold ${className} text-center`}>{children}</div>
);
