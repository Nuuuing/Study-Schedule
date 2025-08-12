import React from 'react';

interface SubLabelProps {
    children: React.ReactNode;
    className?: string;
}

export const SubLabel: React.FC<SubLabelProps> = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold mb-2 ${className}`}>{children}</h3>
);