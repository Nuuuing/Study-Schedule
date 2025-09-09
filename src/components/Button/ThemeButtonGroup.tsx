'use client';

import React from 'react';
import { PixelThemeButton } from './PixelThemeButton';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeButtonGroup: React.FC = () => {
  const { currentTheme, theme } = useTheme();
  const themeClasses = theme.classes;
  
  return (
      <div className={`${themeClasses.card} border-2 ${themeClasses.border} rounded-md p-2 shadow-[4px_4px_0px] shadow-t${currentTheme}-text w-[100px]`}>
        <div className="flex flex-col gap-2">
          <div className={`px-2 py-1 ${themeClasses.primary} border-b-2 ${themeClasses.border} -mt-2 -mx-2 flex items-center`}>
            <span className={`text-xs font-normal tracking-wide text-t${currentTheme}-card`}>✔&nbsp;</span>
            <span className={`text-xs font-normal tracking-wide text-t${currentTheme}-card`}>THEME</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <PixelThemeButton targetTheme="1" />
            <PixelThemeButton targetTheme="2" />
            <PixelThemeButton targetTheme="3" />
            <PixelThemeButton targetTheme="4" />
          </div>
        </div>
      </div>
  );
};
