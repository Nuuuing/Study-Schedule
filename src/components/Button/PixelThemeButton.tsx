'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeName } from '@/modules/types/theme';

interface PixelThemeButtonProps {
  targetTheme: ThemeName;
  className?: string;
  style?: React.CSSProperties;
}

export const PixelThemeButton: React.FC<PixelThemeButtonProps> = ({
  targetTheme,
  className = '',
  style = {}
}) => {
  const { currentTheme, setTheme } = useTheme();
  
  // 테마 변경 함수
  const changeTheme = () => {
    console.log(`테마 변경: ${targetTheme}`);
    setTheme(targetTheme);
  };
  
  // 현재 선택된 테마인지 확인
  const isActive = currentTheme === targetTheme;
  
  // 테마별 아이콘과 색상 정의
  const getFolderStyle = () => {
    switch (targetTheme) {
      case '1':
        return {
          buttonColor: 'bg-[#B09B8C]',
          borderColor: 'border-[#4E423D]',
          shadowColor: 'shadow-[#554f4c]',
          icon: (
            <div className="text-[#4E423D] font-bold">
              <span className="text-lg">1</span>
            </div>
          )
        };
      case '2':
        return {
          buttonColor: 'bg-[#A2D2FF]',
          borderColor: 'border-[#0B4F6C]',
          shadowColor: 'shadow-[#214250]',
          icon: (
            <div className="text-[#0B4F6C] font-bold">
              <span className="text-lg">2</span>
            </div>
          )
        };
      case '3':
        return {
          buttonColor: 'bg-[#ffdbec]',
          borderColor: 'border-[#483D8B]',
          shadowColor: 'shadow-[#413c61]',
          icon: (
            <div className="text-[#483D8B] font-bold">
              <span className="text-lg">3</span>
            </div>
          )
        };
      case '4':
        return {
          buttonColor: 'bg-[#94A1B2]',
          borderColor: 'border-[#16161A]',
          shadowColor: 'shadow-[#4d4d4d]',
          icon: (
            <div className="text-[#16161A] font-bold">
              <span className="text-lg">4</span>
            </div>
          )
        };
      default:
        return {
          folderColor: 'bg-white',
          tabColor: 'bg-gray-200',
          icon: null
        };
    }
  };
  
  const folderStyle = getFolderStyle();

  return (
    <div className={`${className} relative`} style={style}>
      <button
        onClick={changeTheme}
        className={`
          w-[2.3rem] h-[2.3rem]
          transition-all duration-75
          hover:translate-y-0.5
          focus:outline-none
          cursor-pointer
          ${isActive ? 'scale-95' : ''}
        `}
      >
        {/* 픽셀 스타일 버튼 - 기본 블록 */}
        <div className={`
          w-full h-full 
          ${folderStyle.buttonColor} 
          border-2 border-b-4 ${folderStyle.borderColor}
          rounded-lg
          shadow-[2px_2px_0px_rgba(0,0,0,0.2)]
          flex items-center justify-center
        `}>
          {/* 버튼 내부 텍스트/아이콘 */}
          {folderStyle.icon}
        </div>
      </button>
    </div>
  );
};
