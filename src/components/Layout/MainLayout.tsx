import { Header } from "./Header";

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout = (props: MainLayoutProps) => {
    const { children } = props;

    return (
        <div className="w-[100%] h-[100%]">
            <Header />
            <div className="w-[100%] mt-[1rem]">
                {children}
            </div>
        </div>
    );
};
