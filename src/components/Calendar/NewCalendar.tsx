import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    GridItem,
    Text,
    Flex,
    IconButton,
    Badge
} from '@chakra-ui/react';

// 이벤트 타입 정의
interface CalendarEvent {
    id: string;
    date: Date;
    title: string;
    color: string;
}

interface NewCalendarProps {
    events?: CalendarEvent[];
    onDateClick?: (date: Date) => void;
}

export const NewCalendar: React.FC<NewCalendarProps> = ({ events = [], onDateClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // 다크모드 감지
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };
        
        // 초기 체크
        checkDarkMode();
        
        // MutationObserver로 클래스 변경 감지
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    checkDarkMode();
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
        
        return () => observer.disconnect();
    }, []);

    // 현재 달의 시작일과 마지막일 구하기
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // 현재 달력에 표시할 날짜 배열 생성 (이전 달의 일부 + 현재 달 전체 + 다음 달의 일부)
    const daysInCalendar: Date[] = [];

    // 이전 달의 날짜를 채우기
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0: 일요일, 1: 월요일, ...
    if (firstDayOfWeek > 0) { // 첫날이 일요일이 아닐 때만 이전 달 날짜 채우기
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const prevMonthDay = new Date(firstDayOfMonth);
            prevMonthDay.setDate(prevMonthDay.getDate() - (i + 1));
            daysInCalendar.push(prevMonthDay);
        }
    }

    // 현재 달의 날짜를 채우기
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const currentMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        daysInCalendar.push(currentMonthDay);
    }

    // 다음 달의 날짜를 채워서 총 42칸(6주)이 되도록 함
    const remainingDays = 42 - daysInCalendar.length;
    for (let i = 1; i <= remainingDays; i++) {
        const nextMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
        daysInCalendar.push(nextMonthDay);
    }

    // 날짜별 이벤트 매핑
    const getEventsForDate = (date: Date) => {
        return events.filter(event =>
            event.date.getDate() === date.getDate() &&
            event.date.getMonth() === date.getMonth() &&
            event.date.getFullYear() === date.getFullYear()
        );
    };

    // 이전 달로 이동
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    // 다음 달로 이동
    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // 날짜 클릭 핸들러
    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        if (onDateClick) {
            onDateClick(date);
        }
    };

    // 요일 표시
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

    // 테마에 따른 색상 설정
    const cellBgColor = isDarkMode ? 'gray.800' : 'white';
    const cellHoverBgColor = isDarkMode ? 'gray.700' : 'gray.50';
    const todayBgColor = isDarkMode ? 'gray.800' : 'white'; // 오늘 배경색 변경
    const selectedBgColor = isDarkMode ? 'blue.800' : 'blue.100';
    const borderColor = isDarkMode ? 'gray.600' : 'gray.200';
    const weekendColor = isDarkMode ? 'red.300' : 'red.500';
    const grayedOutColor = isDarkMode ? 'gray.500' : 'gray.400';
    const textColor = isDarkMode ? 'white' : 'black';
    const accentColor = isDarkMode ? 'blue.300' : 'blue.500';

    return (
        <Box
            width="100%"
            maxWidth="800px"
            borderRadius="24px"
            overflow="hidden"
            border="1px solid"
            borderColor={borderColor}
            m="0 auto"
            bg={cellBgColor}
            boxShadow={isDarkMode ? "dark-lg" : "xl"}
            className="calendar-component"
        >
            {/* 캘린더 헤더 */}
            <Flex
                justify="space-between"
                align="center"
                p={4}
                borderBottom="1px solid"
                borderColor={borderColor}
            >
                <IconButton
                    aria-label="Previous month"
                    onClick={goToPreviousMonth}
                    size="sm"
                    variant="ghost"
                    borderRadius="full"
                    color={textColor}
                    _hover={{ bg: isDarkMode ? 'gray.700' : 'gray.100' }}
                >
                    <Text fontSize="lg">&lt;</Text>
                </IconButton>
                
                <Flex alignItems="center">
                    <Text 
                        fontWeight="bold" 
                        fontSize="lg" 
                        color={textColor}
                        mr={2}
                    >
                        {`${currentDate.getFullYear()}년`}
                    </Text>
                    <Box
                        py={1}
                        px={3}
                        borderRadius="full"
                        bg={accentColor}
                        color="white"
                    >
                        <Text fontWeight="bold" fontSize="md">
                            {`${currentDate.getMonth() + 1}월`}
                        </Text>
                    </Box>
                </Flex>
                
                <IconButton
                    aria-label="Next month"
                    onClick={goToNextMonth}
                    size="sm"
                    variant="ghost"
                    borderRadius="full"
                    color={textColor}
                    _hover={{ bg: isDarkMode ? 'gray.700' : 'gray.100' }}
                >
                    <Text fontSize="lg">&gt;</Text>
                </IconButton>
            </Flex>

            {/* 요일 헤더 - 원형 스타일 */}
            <Grid templateColumns="repeat(7, 1fr)" bg={cellBgColor} px={3} py={3}>
                {daysOfWeek.map((day, index) => (
                    <GridItem
                        key={index}
                        textAlign="center"
                        py={1}
                    >
                        <Flex 
                            w="36px" 
                            h="36px" 
                            borderRadius="full" 
                            justifyContent="center" 
                            alignItems="center"
                            bg={index === 0 || index === 6 ? (isDarkMode ? 'rgba(254, 178, 178, 0.15)' : 'rgba(254, 178, 178, 0.25)') : 'transparent'}
                            color={index === 0 || index === 6 ? weekendColor : textColor}
                            fontSize="sm"
                            fontWeight="600"
                            mx="auto"
                            boxShadow={index === 0 || index === 6 ? "none" : (isDarkMode ? "dark-sm" : "sm")}
                        >
                            {day}
                        </Flex>
                    </GridItem>
                ))}
            </Grid>

            {/* 캘린더 그리드 */}
            <Grid templateColumns="repeat(7, 1fr)" templateRows="repeat(6, 1fr)">
                {daysInCalendar.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday =
                        date.getDate() === new Date().getDate() &&
                        date.getMonth() === new Date().getMonth() &&
                        date.getFullYear() === new Date().getFullYear();
                    const isSelected =
                        selectedDate &&
                        date.getDate() === selectedDate.getDate() &&
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getFullYear() === selectedDate.getFullYear();

                    const eventsForDate = getEventsForDate(date);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    let bgColor = cellBgColor;
                    if (isSelected) bgColor = selectedBgColor;
                    else if (isToday) bgColor = todayBgColor;

                    return (
                        <GridItem
                            key={index}
                            minH="80px"
                            p={2}
                            bg={bgColor}
                            borderBottom="1px solid"
                            borderRight="1px solid"
                            borderColor={borderColor}
                            cursor="pointer"
                            position="relative"
                            _hover={{ bg: isSelected ? selectedBgColor : cellHoverBgColor }}
                            onClick={() => handleDateClick(date)}
                        >
                            <Text 
                                fontSize="xs" 
                                fontWeight={isToday ? "bold" : "normal"}
                                mb={1.5} 
                                color={!isCurrentMonth
                                    ? grayedOutColor
                                    : isWeekend
                                        ? weekendColor
                                        : textColor
                                }
                                position="absolute"
                                top="5px"
                                left="10px"
                            >
                                {date.getDate()}
                            </Text>
                            
                            {isToday && (
                                <Box 
                                    position="absolute"
                                    top="5px"
                                    right="10px"
                                    w="4px"
                                    h="4px"
                                    borderRadius="full"
                                    bg={weekendColor}
                                />
                            )}
                            
                            <Flex 
                                direction="column" 
                                gap={0.5}
                                mt={6} // 날짜 아래에 여백 추가
                            >
                                {eventsForDate.slice(0, 3).map((event) => (
                                    <Badge
                                        key={event.id}
                                        bg={event.color}
                                        color="white"
                                        fontSize="2xs"
                                        borderRadius="md"
                                        py={0.5}
                                        px={1}
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        width="90%"
                                        mx="auto"
                                    >
                                        {event.title}
                                    </Badge>
                                ))}
                                {eventsForDate.length > 3 && (
                                    <Badge
                                        bg={isDarkMode ? "gray.600" : "gray.200"}
                                        color={isDarkMode ? "gray.300" : "gray.600"}
                                        borderRadius="md"
                                        fontSize="2xs"
                                        textAlign="center"
                                        width="50%"
                                        mx="auto"
                                    >
                                        +{eventsForDate.length - 3}
                                    </Badge>
                                )}
                            </Flex>
                        </GridItem>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default NewCalendar;
