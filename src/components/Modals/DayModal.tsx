import { CommonModal } from "./CommonModal";
import { useSelectedDate, useShowDayModal, useSetShowDayModal } from "@/modules/stores";
import dayjs from 'dayjs';
import { Tooltip } from "../Common";
import { useTheme } from "@/contexts";
import { useState } from "react";

interface DayModalProps {
    selectedDay: Date | null;
    onClose: () => void;
}

export const DayModal = (props: DayModalProps) => {
    const { selectedDay, onClose } = props;
    const showDayModal = useShowDayModal();

    const { theme, } = useTheme();
    const themeClasses = theme.classes;

    const [activeTab, setActiveTab] = useState('std');


    const handleSave = () => {
        // 저장 로직 추가
    }

    return (
        <CommonModal
            isOpen={showDayModal}
            onClose={() => onClose()}
            title={selectedDay ? dayjs(selectedDay).format('YYYY년 MM월 DD일') : '-'}
            animation="scale"
            width="w-[500px]"
            showCancelButton={true}
            cancelText="닫기"
        >
            <div className="flex flex-row items-center justify-center">
                {
                    [
                        { id: 'std', label: '공부 관리' },
                        { id: 'sch', label: '스케줄 관리' }
                    ].map((tab) => (
                        <div
                            key={tab.id}
                            className={`flex justify-center items-center w-[50%] px-4 py-[0.4rem] cursor-pointer transition-all duration-150
                                border-2 rounded-t-md hover:bg-black/10
                                ${activeTab === tab.id
                                    ? `${themeClasses.card} ${themeClasses.border} shadow-md `
                                    : `${themeClasses.border} border-opacity-40 bg-transparent opacity-60 `
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className={`text-sm font-bold ${themeClasses.text}`}>{tab.label}</span>
                        </div>
                    ))
                }
            </div>

            {
                activeTab === 'std' ? (
                    <div className="p-4  ">
                        <p>공부 참여 </p>
                        <p>시간 추가 </p>
                        <p>오늘 공부목표 설정 </p>
                        <p>공부 목표 퍼센트 </p>
                        <p>리스트  </p>
                    </div>
                ) : (
                    <div className="p-4 ">
                        <p>오늘 스케줄 추가 </p>
                    </div>
                )
            }
        </CommonModal>
    )
}