import React, { ReactNode } from 'react';
import { Tooltip } from '../Common';
import { useTheme } from '@/contexts/ThemeContext';

interface CircleButtonProps {
    onClick: () => void;
    ariaLabel?: string;
    tooltipContent?: string;
    tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    hoverEffect?: boolean;
    variant?: 'filled' | 'outlined';
    customStyle?: React.CSSProperties;
}

export const CircleButton: React.FC<CircleButtonProps> = ({
    onClick,
    ariaLabel,
    tooltipContent,
    tooltipPlacement = 'top',
    children,
    size = 'md',
    className = '',
    hoverEffect = true,
    variant = 'outlined',
    customStyle = {}
}) => {
    const { theme } = useTheme();
    const themeClasses = theme.classes;

    // 크기에 따른 클래스
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-7 h-7',
        lg: 'w-9 h-9',
    };

    // 아이콘 크기에 따른 클래스
    const iconSizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    // 반응형 클래스
    const responsiveSize = {
        sm: 'w-5 h-5 sm:w-6 sm:h-6',
        md: 'w-6 h-6 sm:w-7 sm:h-7',
        lg: 'w-8 h-8 sm:w-9 sm:h-9',
    };

    // 기본 스타일과 variant에 따른 스타일
    const variantClasses = variant === 'filled'
        ? `${themeClasses.primary} text-white`
        : `${themeClasses.card} ${themeClasses.text}`;

    // 기본 버튼 클래스
    const buttonClasses = `
    ${responsiveSize[size]}
    rounded-full 
    border-2 
    ${themeClasses.border} 
    flex 
    items-center 
    justify-center 
    shadow-sm 
    cursor-pointer 
    transition-all 
    duration-150
    ${variantClasses}
    ${hoverEffect ? `hover:shadow-md hover:bg-black/10` : ''}
    ${className}
  `;

    // 자식 요소 렌더링 (간단히 처리)
    const renderChildren = () => {
        return children;
    };

    // 툴팁이 있는 경우와 없는 경우 처리
    const button = (
        <button
            onClick={onClick}
            className={buttonClasses}
            aria-label={ariaLabel}
            style={customStyle}
        >
            {renderChildren()}
        </button>
    );

    return tooltipContent ? (
        <Tooltip content={tooltipContent} placement={tooltipPlacement}>
            {button}
        </Tooltip>
    ) : button;
};
