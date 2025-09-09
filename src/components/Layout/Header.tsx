import { useTheme } from '../../contexts/ThemeContext';
import { ThemeButtonGroup } from '../Button';

export const Header = () => {
    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;
    
    return (
        <div 
            className={`h-16 flex items-center justify-between px-6 border-b-2 ${themeClasses.border} ${themeClasses.card}`}>
            <div className="flex items-center">
                <div className="flex gap-2 mr-4">
                    <div className={`w-4 h-4 rounded-full ${themeClasses.accent}`}></div>
                    <div className={`w-4 h-4 rounded-full ${themeClasses.primary}`}></div>
                    <div className={`w-4 h-4 rounded-full bg-t${currentTheme}-background`}></div>
                </div>
                <span className={`font-bold text-3xl ${themeClasses.text}`}>SCHEDULER</span>
            </div>
        </div>
    );
};
