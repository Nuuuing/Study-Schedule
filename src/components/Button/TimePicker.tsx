import React, { useState } from 'react';

interface TimePickerProps {
    value?: string;
    onChange: (time: string) => void;
    placeholder?: string;
    defaultTime?: string; // 기본 시간 설정
    disabled?: boolean; // 비활성화 옵션
}

export const TimePicker = (props: TimePickerProps) => {
    const { value, onChange, placeholder = "시간", defaultTime, disabled = false } = props;
    const [isOpen, setIsOpen] = useState(false);
    
    // 현재 시간을 기본값으로 설정하는 함수
    const getCurrentTime = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        let displayHour = hour;
        let period = 'AM';
        
        if (hour === 0) {
            displayHour = 12;
            period = 'AM';
        } else if (hour < 12) {
            displayHour = hour;
            period = 'AM';
        } else if (hour === 12) {
            displayHour = 12;
            period = 'PM';
        } else {
            displayHour = hour - 12;
            period = 'PM';
        }
        
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    };
    
    const parseTime = React.useCallback((timeStr: string) => {
        // 기본 시간이 설정되어 있고 값이 없으면 기본 시간 사용
        if (!timeStr && defaultTime) {
            timeStr = defaultTime;
        }
        // 값도 없고 기본 시간도 없으면 현재 시간 사용
        if (!timeStr) {
            timeStr = getCurrentTime();
        }
    
        
        const [time, period] = timeStr.includes(' ') ? timeStr.split(' ') : [timeStr, 'AM'];
        const [hourStr, minuteStr] = time.split(':');
        
        const hour = parseInt(hourStr) || 1;
        let displayHour = hour;
        let displayPeriod = period || 'AM'; 
        
        if (period === '오전') displayPeriod = 'AM';
        if (period === '오후') displayPeriod = 'PM';
        
        if (hour === 0) {
            displayHour = 12;
            displayPeriod = 'AM';
        } else if (hour > 12) {
            displayHour = hour - 12;
            displayPeriod = 'PM';
        }
        
        const result = {
            hour: displayHour.toString(),
            minute: (minuteStr || '00').padStart(2, '0'),
            period: displayPeriod
        };
        
        return result;
    }, [defaultTime]);

    const [timeState, setTimeState] = useState(parseTime(value || ''));

    React.useEffect(() => {
        setTimeState(parseTime(value || ''));
    }, [value, parseTime]);

    React.useEffect(() => {
        if (!value && defaultTime) {
            setTimeState(parseTime(defaultTime));
        }
    }, [defaultTime, value, parseTime]);

    const formatTime = (hour: string, minute: string, period: string) => {
        if (!hour || minute === '') return '';
        
        // AM/PM 형식으로 저장 (예: "4:05 AM")
        const formattedMinute = minute.padStart(2, '0');
        return `${hour}:${formattedMinute} ${period}`;
    };

    const handleTimeChange = (field: 'hour' | 'minute' | 'period', newValue: string) => {
        const newTimeState = { ...timeState, [field]: newValue };
        
        // 시간 변경 시 자동으로 AM/PM 조정
        if (field === 'hour') {
            const newHour = parseInt(newValue);
            const currentHour = parseInt(timeState.hour);
            
            // 11 AM → 12시로 올릴 때 PM으로 변경
            if (currentHour === 11 && newHour === 12 && timeState.period === 'AM') {
                newTimeState.period = 'PM';
            }
            // 12 PM → 11시로 내릴 때 AM으로 변경  
            else if (currentHour === 12 && newHour === 11 && timeState.period === 'PM') {
                newTimeState.period = 'AM';
            }
            // 12 AM → 11시로 내릴 때 PM으로 변경
            else if (currentHour === 12 && newHour === 11 && timeState.period === 'AM') {
                newTimeState.period = 'PM';
            }
            // 11 PM → 12시로 올릴 때 AM으로 변경
            else if (currentHour === 11 && newHour === 12 && timeState.period === 'PM') {
                newTimeState.period = 'AM';
            }
        }
        
        setTimeState(newTimeState);
    };

    const handleSave = () => {
        if (timeState.hour && timeState.minute !== '') {
            const formattedTime = formatTime(timeState.hour, timeState.minute, timeState.period);
            console.log('TimePicker Save - formattedTime:', formattedTime);
            onChange(formattedTime);
        }
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTimeState(parseTime(value || ''));
        setIsOpen(false);
    };

    const displayValue = value ? 
        `${timeState.hour}:${timeState.minute} ${timeState.period === 'AM' ? '오전' : '오후'}` : 
        placeholder;

    if (!isOpen) {
        return (
            <button
                onClick={() => {
                    if (!disabled) {
                        // 모달이 열릴 때 최신 defaultTime 적용
                        if (!value && defaultTime) {
                            setTimeState(parseTime(defaultTime));
                        }
                        setIsOpen(true);
                    }
                }}
                disabled={disabled}
                className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg border text-xs font-medium transition-colors ${
                    disabled 
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : value 
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 cursor-pointer'
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-pointer'
                }`}
            >
                {displayValue}
            </button>
        );
    }

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => handleCancel()}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                    시간 입력
                </h3>
                
                <div className="flex items-center justify-center gap-4 mb-8">
                    {/* Hour */}
                    <div className="text-center">
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={timeState.hour}
                                onChange={(e) => handleTimeChange('hour', e.target.value)}
                                onWheel={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const currentHour = parseInt(timeState.hour) || 1;
                                    const delta = e.deltaY < 0 ? 1 : -1;
                                    let newHour = currentHour + delta;
                                    
                                    if (newHour > 12) newHour = 1;
                                    if (newHour < 1) newHour = 12;
                                    
                                    handleTimeChange('hour', newHour.toString());
                                }}
                                className="w-16 h-13 text-xl font-bold text-center border-2 border-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                                placeholder="1"
                            />
                        </div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mt-2 block">시</label>
                    </div>

                    {/* Colon */}
                    <div className="text-3xl font-bold text-gray-400 pb-6">:</div>

                    {/* Minute */}
                    <div className="text-center">
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={timeState.minute}
                                onChange={(e) => handleTimeChange('minute', e.target.value)}
                                onWheel={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const currentMinute = parseInt(timeState.minute) || 0;
                                    const delta = e.deltaY < 0 ? 5 : -5; // 5분 단위로 변경
                                    let newMinute = currentMinute + delta;
                                    
                                    if (newMinute > 59) newMinute = 0;
                                    if (newMinute < 0) newMinute = 55;
                                    
                                    handleTimeChange('minute', newMinute.toString().padStart(2, '0'));
                                }}
                                className="w-16 h-13 text-xl font-bold text-center border-2 border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-gray-400"
                                placeholder="00"
                            />
                        </div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mt-2 block">분</label>
                    </div>

                    {/* AM/PM */}
                    <div className="text-center">
                        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => handleTimeChange('period', 'AM')}
                                className={`w-16 h-8 text-xs font-semibold transition-colors cursor-pointer ${
                                    timeState.period === 'AM'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                오전
                            </button>
                            <button
                                onClick={() => handleTimeChange('period', 'PM')}
                                className={`w-16 h-8 text-xs font-semibold transition-colors cursor-pointer ${
                                    timeState.period === 'PM'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                            >
                                오후
                            </button>
                        </div>
                        <label className="text-sm text-gray-500 dark:text-gray-400 mt-2 block">오전/오후</label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};
