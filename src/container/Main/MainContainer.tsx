import { Calendar, SectionLabel, ThemeButtonGroup } from "@/components";
import { useEffect, useState } from "react";
import { useCurrentDate, useSetCurrentDate, useResetToday } from "@/modules/stores";
import { useTheme } from "@/contexts/ThemeContext";
import dayjs from "dayjs";

export const MainContainer = () => {
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
            {/* 데스크탑 뷰 */}
            <div className="hidden md:flex w-full h-full relative">
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
                </div>
                <div className={`w-[80%] h-full flex transition-all duration-300`}>
                    <div className={`w-full h-full flex flex-col transition-all duration-300`}>
                        {/* ...기존 데스크탑 캘린더/탭/헤더/캘린더 코드... */}
                        {/* 상단 탭 바 */}
                        <div className={`flex flex-col sm:flex-row border-b ${themeClasses.border} mt-[0.5rem] mx-[1rem]`}>
                            <div className="flex border-b-0 z-10 min-w-fit">
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={`flex justify-center items-center px-4 py-1 cursor-pointer
                                        ${activeTab === tab.id
                                                ? `${themeClasses.card} border-2 ${themeClasses.border} rounded-t-md border-b-0 shadow-md`
                                                : 'opacity-60'
                                            }`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <span className={`text-xs font-bold ${themeClasses.text}`}>{tab.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-grow flex items-center py-2 sm:py-0">
                                <div className="flex w-full justify-end px-2 sm:px-4">
                                    <div className="flex items-center space-x-1 sm:space-x-2 mb-[0.2rem]">
                                        {/* 오른쪽 네비게이션 버튼 */}
                                        <button
                                            onClick={prevMonth}
                                            className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full border ${themeClasses.border} flex items-center justify-center hover:${themeClasses.card} shadow-sm cursor-pointer`}
                                            aria-label="이전 달"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 sm:h-4 sm:w-4 ${themeClasses.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={nextMonth}
                                            className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full border ${themeClasses.border} flex items-center justify-center hover:${themeClasses.card} shadow-sm cursor-pointer`}
                                            aria-label="다음 달"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 sm:h-4 sm:w-4 ${themeClasses.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setShowUserPanel((prev) => !prev)}
                                            className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full border ${themeClasses.border} flex items-center justify-center hover:${themeClasses.card} shadow-sm cursor-pointer`}
                                            aria-label="내정보"
                                        >
                                            {/* 아이콘: 닫힘/열림 상태에 따라 변경 가능. 여기선 항상 유저 아이콘 사용 */}
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 sm:h-4 sm:w-4 ${themeClasses.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </button>
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
                                    className={`px-2 py-0.5 text-xs rounded-md ${themeClasses.card} border ${themeClasses.border} hover:opacity-80 font-bold shadow-sm transition-all hover:shadow`}
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
                {/* 사용자 정보 및 테마 패널 (데스크탑) */}
                {showUserPanel && (
                    <div className="hidden md:block w-72 h-full transition-all duration-300">
                        {/* ...기존 유저 정보 패널 코드... */}
                        {/* 사용자 패널 */}
                        <div className={`w-full h-full ${themeClasses.card} border-l-2 ${themeClasses.border} shadow-xl`}>
                            {/* 패널 헤더 - Y2K 스타일 */}
                            <div className={`flex justify-between items-center p-3 border-b-2 ${themeClasses.border} bg-t${currentTheme}-primary bg-opacity-20`}>
                                <div className="flex items-center">
                                    <div className={`w-7 h-7 rounded-full ${themeClasses.primary} flex items-center justify-center mr-2`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-t${currentTheme}-card`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h2 className={`text-lg font-bold ${themeClasses.text}`}>내 정보</h2>
                                </div>
                                {/* X 버튼 제거: 유저 아이콘 버튼 하나로 열고 닫음 */}
                            </div>

                            {/* 사용자 정보 섹션 */}
                            <div className="p-4">
                                <div className={`flex items-center mb-6 p-3 border-2 ${themeClasses.border} rounded-md ${themeClasses.card}`}>
                                    <div className={`w-14 h-14 rounded-full ${themeClasses.primary} flex items-center justify-center text-t${currentTheme}-card text-xl font-bold mr-3 border-2 border-t${currentTheme}-text`}>
                                        U
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${themeClasses.text} mb-1`}>사용자</h3>
                                        <p className={`text-sm opacity-75 ${themeClasses.text}`}>user@example.com</p>
                                    </div>
                                </div>

                                {/* 설정 메뉴 항목들 */}
                                <div>
                                    <div className="flex items-center mb-3">
                                        <div className={`w-5 h-5 rounded-full ${themeClasses.primary} flex items-center justify-center mr-2`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-t${currentTheme}-card`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h4 className={`text-sm font-bold ${themeClasses.text}`}>메뉴</h4>
                                    </div>
                                    <ul className={`rounded-md border-2 ${themeClasses.border} overflow-hidden`}>
                                        <li className={`p-3 ${themeClasses.card} hover:bg-t${currentTheme}-primary hover:bg-opacity-10 cursor-pointer border-b-2 ${themeClasses.border} flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${themeClasses.text} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span className={`${themeClasses.text} text-sm`}>내 정보 수정</span>
                                        </li>
                                        <li className={`p-3 ${themeClasses.card} hover:bg-t${currentTheme}-primary hover:bg-opacity-10 cursor-pointer border-b-2 ${themeClasses.border} flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${themeClasses.text} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            <span className={`${themeClasses.text} text-sm`}>알림 설정</span>
                                        </li>
                                        <li className={`p-3 ${themeClasses.card} hover:bg-red-50 cursor-pointer flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span className="text-red-500 text-sm font-bold">로그아웃</span>
                                        </li>
                                    </ul>
                                </div>                   
                                <ThemeButtonGroup />                    
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 모바일 뷰 */}
            <div className="flex flex-col md:hidden w-full h-full">
                {showUserPanel ? (
                    // 모바일에서 유저 정보 패널만 전체 화면에 표시
                    <div className="w-full h-full">
                        <div className={`w-full h-full ${themeClasses.card} shadow-xl`}>
                            {/* 패널 헤더 - Y2K 스타일 */}
                            <div className={`flex justify-between items-center p-3 border-b-2 ${themeClasses.border} bg-t${currentTheme}-primary bg-opacity-20`}>
                                <div className="flex items-center">
                                    <div className={`w-7 h-7 rounded-full ${themeClasses.primary} flex items-center justify-center mr-2`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-t${currentTheme}-card`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h2 className={`text-lg font-bold ${themeClasses.text}`}>내 정보</h2>
                                </div>
                                {/* X 버튼 제거: 유저 아이콘 버튼 하나로 열고 닫음 */}
                            </div>
                            {/* 사용자 정보 섹션 */}
                            <div className="p-4">
                                <div className={`flex items-center mb-6 p-3 border-2 ${themeClasses.border} rounded-md ${themeClasses.card}`}>
                                    <div className={`w-14 h-14 rounded-full ${themeClasses.primary} flex items-center justify-center text-t${currentTheme}-card text-xl font-bold mr-3 border-2 border-t${currentTheme}-text`}>
                                        U
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${themeClasses.text} mb-1`}>사용자</h3>
                                        <p className={`text-sm opacity-75 ${themeClasses.text}`}>user@example.com</p>
                                    </div>
                                </div>
                                {/* 설정 메뉴 항목들 */}
                                <div>
                                    <div className="flex items-center mb-3">
                                        <div className={`w-5 h-5 rounded-full ${themeClasses.primary} flex items-center justify-center mr-2`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-t${currentTheme}-card`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h4 className={`text-sm font-bold ${themeClasses.text}`}>메뉴</h4>
                                    </div>
                                    <ul className={`rounded-md border-2 ${themeClasses.border} overflow-hidden`}>
                                        <li className={`p-3 ${themeClasses.card} hover:bg-t${currentTheme}-primary hover:bg-opacity-10 cursor-pointer border-b-2 ${themeClasses.border} flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${themeClasses.text} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span className={`${themeClasses.text} text-sm`}>내 정보 수정</span>
                                        </li>
                                        <li className={`p-3 ${themeClasses.card} hover:bg-t${currentTheme}-primary hover:bg-opacity-10 cursor-pointer border-b-2 ${themeClasses.border} flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${themeClasses.text} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            <span className={`${themeClasses.text} text-sm`}>알림 설정</span>
                                        </li>
                                        <li className={`p-3 ${themeClasses.card} hover:bg-red-50 cursor-pointer flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span className="text-red-500 text-sm font-bold">로그아웃</span>
                                        </li>
                                    </ul>
                                </div>                   
                                <ThemeButtonGroup />                    
                            </div>
                        </div>
                    </div>
                ) : (
                    // 기존 모바일 캘린더/헤더/버튼
                    <>
                        <div className={`w-full p-4 border-b-2 ${themeClasses.border}`}>
                            <SectionLabel>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full ${themeClasses.accent} mr-2`}></div>
                                        <span className={`text-xl font-bold ${themeClasses.text}`}>SCHEDULER</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`flex items-center px-4 py-2 ${themeClasses.card} rounded-lg border-2 ${themeClasses.border} shadow-[3px_3px_0px] shadow-t${currentTheme}-text`}>
                                            <span className={`font-bold text-lg ${themeClasses.text}`}>
                                                {currentDate.getMonth() + 1 < 10
                                                    ? `0${currentDate.getMonth() + 1}`
                                                    : `${currentDate.getMonth() + 1}`}
                                                월
                                            </span>
                                            <span className={`ml-2 text-lg ${themeClasses.accent}`}>✦</span>
                                        </div>
                                        <button
                                            onClick={() => setShowUserPanel((prev) => !prev)}
                                            className={`w-9 h-9 rounded-full border-2 ${themeClasses.border} ${themeClasses.card} flex items-center justify-center shadow-md`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${themeClasses.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </SectionLabel>
                        </div>
                        <div className="w-full flex-1 p-2">
                            <div className={`rounded-lg border-2 ${themeClasses.border} ${themeClasses.card} shadow-md p-1 h-full`}>
                                <Calendar />
                            </div>
                        </div>
                        {/* 하단 플로팅 액션 버튼 - 모바일에서만 표시 */}
                        <div className="fixed bottom-20 right-6">
                            <button className={`w-12 h-12 rounded-full ${themeClasses.primary} text-t${currentTheme}-card flex items-center justify-center shadow-lg`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}