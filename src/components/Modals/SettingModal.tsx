import React, { useState } from 'react';
import { CommonModal } from "./CommonModal";
import { useTheme } from '@/contexts/ThemeContext';
import { useUserInfo } from '@/modules/stores';

interface SettingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingModal: React.FC<SettingModalProps> = ({ isOpen, onClose }) => {
    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;

    const userInfo = useUserInfo();

    const handleSaveSettings = () => {


        // 모달 닫기
        onClose();
    };

    return (
        <CommonModal
            isOpen={isOpen}
            onClose={onClose}
            title="설정"
            animation="scale"
            width="w-[350px]"
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="취소"
            confirmText="저장"
            onConfirm={handleSaveSettings}
        >
            <div className="space-y-6">

                <div className="space-y-2">
                    <h3 className={`font-medium text-sm ${themeClasses.text}`}>계정정보</h3>
                    <div>
                        <p>{userInfo?.name}</p>
                        <p>{userInfo?.id}</p>
                        <p>{userInfo?.email}</p>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button
                            className={`text-xs py-1 px-2 rounded-md border ${themeClasses.border} hover:bg-black/5 transition mx-4`}
                            onClick={() => console.log('비밀번호 변경')}
                        >
                            비밀번호 변경
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className={`font-medium text-sm ${themeClasses.text}`}>데이터</h3>
                    <div className="flex flex-col space-y-3">
                        <button
                            className={`text-xs py-1 px-2 rounded-md border ${themeClasses.border} hover:bg-black/5 transition`}
                            onClick={() => console.log('구글')}
                        >
                            구글 캘린더
                        </button>

                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className={`font-medium text-sm ${themeClasses.text}`}>문의하기</h3>

                    <p className={`font-medium text-sm`}> 공지</p>
                    

                </div>
                <div className='flex justify-center items-center'>
                    <p className={`font-medium text-sm mx-1`}> Ver 2.0.0</p>
                    <p className={`font-medium text-sm mx-1`}>개인정보 약관</p>
                </div>

            </div>

        </CommonModal>
    );
}