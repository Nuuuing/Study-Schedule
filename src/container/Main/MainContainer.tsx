import { Calendar, SectionLabel, ThemeButtonGroup, Tooltip, CircleButton } from "@/components";
import UserInfoContainer from "./UserInfoContainer";
import { useEffect, useState } from "react";
import { useCurrentDate, useSetCurrentDate, useResetToday } from "@/modules/stores";
import { useTheme } from "@/contexts/ThemeContext";
import dayjs from "dayjs";

const MainContainer = () => {
    const currentDate = useCurrentDate();
    const setCurrentDate = useSetCurrentDate();
    const resetToday = useResetToday();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { currentTheme, theme, setTheme } = useTheme();
    const themeClasses = theme.classes;
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [activeTab, setActiveTab] = useState('my');

    // 탭 항목들
    const tabs = [
        { id: 'my', label: 'MY' },
        { id: 'all', label: 'ALL' }
    ];

    // 이전 달로 이동
    const prevMonth = () => {
        setCurrentDate(dayjs(currentDate).subtract(1, 'month').toDate());
    };

    // 다음 달로 이동
    const nextMonth = () => {
        setCurrentDate(dayjs(currentDate).add(1, 'month').toDate());
    };

    // 오늘 날짜로 이동
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    useEffect(() => {
        resetToday();
    }, [resetToday]);

    return (
        <>
            {/* Desktop */}
            <div className={`hidden md:flex w-full h-full relative ${currentTheme === '3' ? themeClasses.primary : themeClasses.background}`}>
                <div className={`w-[20%] p-4 border-r-2 ${themeClasses.border}`}>
                    <SectionLabel>
                        {(currentDate.getMonth() + 1 < 10
                            ? `0${currentDate.getMonth() + 1}`
                            : `${currentDate.getMonth() + 1}`)
                            .split("")
                            .map((char, idx) => (
                                <span key={idx} className={`px-[0.2rem] ${themeClasses.text}`}>{char}</span>
                            ))
                        }
                    </SectionLabel>


                    <div className="fixed left-4 bottom-4 z-10">
                        <ThemeButtonGroup />
                    </div>
                </div>
                <div className={`w-[80%] h-full flex transition-all duration-300`}>
                    <div className={`w-full h-full flex flex-col transition-all duration-300`}>
                        {/* 상단 탭 바 */}
                        <div className={`flex flex-col sm:flex-row border-b-2 ${themeClasses.border} mt-[0.5rem] mx-[1rem] relative`}>
                            <div className="flex z-10 min-w-fit">
                                {tabs.map((tab) => (
                                    <Tooltip
                                        key={tab.id}
                                        content={tab.id === 'my' ? '내 정보만 보기' : '전체 정보 보기'}
                                        placement="top"
                                    >
                                        <div
                                            className={`flex justify-center items-center px-4 py-[0.4rem] cursor-pointer transition-all duration-150
                                            border-2 rounded-t-md hover:bg-black/10
                                            ${activeTab === tab.id
                                                ? `${themeClasses.card} ${themeClasses.border} shadow-md border-b-transparent`
                                                : `${themeClasses.border} border-opacity-40 bg-transparent opacity-60 border-b-transparent`
                                            }`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            <span className={`text-xs font-bold ${themeClasses.text}`}>{tab.label}</span>
                                        </div>
                                    </Tooltip>
                                ))}
                            </div>
                            <div className="flex-grow flex items-center py-2 sm:py-0">
                                <div className="flex w-full justify-end px-2 sm:px-4">
                                    <div className="flex items-center space-x-1 sm:space-x-2 mb-[0.2rem]">
                                        {/* 네비게이션 버튼 */}
                                        <CircleButton
                                            onClick={prevMonth}
                                            ariaLabel="이전 달"
                                            tooltipContent="이전 달"
                                            tooltipPlacement="top"
                                            size="md"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </CircleButton>
                                        <CircleButton
                                            onClick={nextMonth}
                                            ariaLabel="다음 달"
                                            tooltipContent="다음 달"
                                            tooltipPlacement="top"
                                            size="md"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </CircleButton>
                                        <CircleButton
                                            onClick={() => setShowUserPanel((prev) => !prev)}
                                            ariaLabel="내정보"
                                            tooltipContent="내 정보"
                                            tooltipPlacement="top"
                                            size="md"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </CircleButton>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 캘린더 헤더 */}
                        <div className="flex justify-between items-center p-4">
                            <div className="flex items-center">
                                <h2 className={`text-xl sm:text-2xl font-bold ${themeClasses.text} mr-2`}>
                                    {dayjs(currentDate).format('YYYY년 M월')}
                                </h2>
                                <button
                                    onClick={goToToday}
                                    className={`cursor-pointer px-2 py-0.5 text-xs rounded-md ${themeClasses.secondary} border ${themeClasses.border} hover:opacity-80 font-bold shadow-sm transition-all hover:shadow `}
                                >
                                    Today
                                </button>
                            </div>
                        </div>

                        {/* 캘린더 */}
                        <div className="flex-1 overflow-hidden p-2">
                            <Calendar />
                        </div>
                    </div>
                </div>
                {showUserPanel && (
                    <div className="hidden md:block w-72 h-full transition-all duration-300">
                        <UserInfoContainer />
                    </div>
                )}
            </div>

            {/* Mobile */}
            <div className={`flex flex-col md:hidden w-full h-full ${currentTheme === '3' ? themeClasses.primary : themeClasses.background}`}>
                {showUserPanel ? (
                    <div className="w-full h-full">
                        <UserInfoContainer />
                    </div>
                ) : (
                    <>
                        <div className={`w-full p-4 border-b-2 ${themeClasses.border}`}>
                            <div className="flex justify-between items-center">
                                <div className={`flex items-center px-4 py-2 ${themeClasses.card} rounded-lg border-2 ${themeClasses.border} shadow-[3px_3px_0px] shadow-t${currentTheme}-text`}>
                                    <span className={`font-bold text-lg ${themeClasses.text}`}>
                                        {currentDate.getMonth() + 1 < 10
                                            ? `0${currentDate.getMonth() + 1}`
                                            : `${currentDate.getMonth() + 1}`}
                                        월
                                    </span>
                                    <span className={`ml-2 text-lg ${themeClasses.accent}`}>✦</span>
                                </div>
                                <CircleButton
                                    onClick={() => setShowUserPanel((prev) => !prev)}
                                    ariaLabel="내정보"
                                    size="lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </CircleButton>
                            </div>
                        </div>
                        <div className="w-full flex-1 p-2">
                            <Calendar />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default MainContainer;