'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeName } from '../../modules/types/theme';

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
          buttonColor: 'bg-[#FFD485]',
          borderColor: 'border-[#E8B55D]',
          shadowColor: 'shadow-[#D19E45]',
          icon: (
            <div className="text-[#B8834F] font-bold">
              <span className="text-lg">1</span>
            </div>
          )
        };
      case '2':
        return {
          buttonColor: 'bg-[#94E8E7]',
          borderColor: 'border-[#5DC7C6]',
          shadowColor: 'shadow-[#45A4A2]',
          icon: (
            <div className="text-[#3A9B9A] font-bold">
              <span className="text-lg">2</span>
            </div>
          )
        };
      case '3':
        return {
          buttonColor: 'bg-[#FFAFD9]',
          borderColor: 'border-[#E884B3]',
          shadowColor: 'shadow-[#D2679C]',
          icon: (
            <div className="text-[#C25B89] font-bold">
              <span className="text-lg">3</span>
            </div>
          )
        };
      case '4':
        return {
          buttonColor: 'bg-[#E2E2E2]',
          borderColor: 'border-[#ADADAD]',
          shadowColor: 'shadow-[#8A8A8A]',
          icon: (
            <div className="text-[#595959] font-bold">
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
