import { useTheme } from '../../contexts/ThemeContext';
import { ThemeButtonGroup } from '../Button';

export const Header = () => {
    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;
    
    return (
        <div 
            className={`h-12 flex items-center justify-between px-6 border-b-2 ${themeClasses.border} ${themeClasses.card}`}>
            <div className="flex items-center">
                <span className={`nayn text-4xl ${themeClasses.text}`}>SCHEDULER</span>
            </div>
        </div>
    );
};
