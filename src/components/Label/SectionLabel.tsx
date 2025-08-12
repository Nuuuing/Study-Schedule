import React from 'react';

interface SectionLabelProps {
    children: React.ReactNode;
    className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children, className = '' }) => (
    <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
);
