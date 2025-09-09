import { Header } from "./Header";
import { useTheme } from '../../contexts/ThemeContext';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout = (props: MainLayoutProps) => {
    const { children } = props;
    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;

    return (
        <div className={`w-full h-screen flex flex-col overflow-hidden ${themeClasses.background} ${themeClasses.text} bg-[size:20px_20px] bg-[-1px_-1px] bg-fixed`}>
            <Header />
            <div className="w-full flex-1 overflow-hidden">
                {children}
            </div>            
        </div>
    );
};
