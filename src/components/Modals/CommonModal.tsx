import React, { ReactNode, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export interface CommonModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    width?: string;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    animation?: 'fade' | 'scale' | 'slide-down' | 'none';
    // 푸터 관련 속성
    showFooter?: boolean; // 푸터 표시 여부
    showCancelButton?: boolean; // 취소 버튼 표시 여부
    showConfirmButton?: boolean; // 확인 버튼 표시 여부
    cancelText?: string; // 취소 버튼 텍스트
    confirmText?: string; // 확인 버튼 텍스트
    onConfirm?: () => void; // 확인 버튼 클릭 시 실행할 함수
    confirmButtonColor?: 'primary' | 'success' | 'warning' | 'error' | 'default'; // 확인 버튼 색상
}

export const CommonModal: React.FC<CommonModalProps> = (props: CommonModalProps) => {
    const {
        isOpen,
        onClose,
        title,
        children,
        width = 'w-[400px]',
        showCloseButton = true,
        closeOnOverlayClick = true,
        animation = 'scale',
        // 푸터 관련 속성
        showFooter = true,
        showCancelButton = true,
        showConfirmButton = false,
        cancelText = '취소',
        confirmText = '확인',
        onConfirm,
        confirmButtonColor = 'primary'
    } = props;

    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;

    // 모달이 열렸을 때 배경 스크롤 막기
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // 애니메이션 클래스 결정
    const getAnimationClasses = () => {
        switch (animation) {
            case 'fade':
                return 'animate-fade-in';
            case 'scale':
                return 'animate-scale-in';
            case 'slide-down':
                return 'animate-slide-down';
            default:
                return '';
        }
    };

    const animationClass = getAnimationClasses();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            aria-modal="true"
            role="dialog"
        >
            {/* 배경 오버레이 */}
            <div
                className="fixed inset-0 bg-black opacity-30 transition-opacity"
                onClick={closeOnOverlayClick ? onClose : undefined}
            ></div>

            {/* 모달 내용 */}
            <div
                className={`${width} ${themeClasses.card} ${themeClasses.text} rounded-lg relative ${animationClass} z-10 max-h-[90vh] flex flex-col border-3 ${themeClasses.border} shadow-[8px_8px_0] shadow-t${currentTheme}-text`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`h-[2.5rem] flex items-center px-4 rounded-t-lg border-b-2 ${themeClasses.primary} ${themeClasses.border} relative`}>
                    {/* 왼쪽 미니 버튼 영역 */}
                    <div className='flex gap-1 min-w-[60px]'>
                        <div className={`w-4 h-4 flex items-center justify-center rounded-2xl border-2 ${themeClasses.border}`}></div>
                        <div className={`w-4 h-4 flex items-center justify-center rounded-2xl border-2 ${themeClasses.border}`}></div>
                        <div className={`w-4 h-4 flex items-center justify-center rounded-2xl border-2 ${themeClasses.border}`}></div>
                    </div>
                    {title && (
                        <div className={`absolute left-0 right-0 top-0 h-full flex items-center justify-center pointer-events-none`}>
                            <span className={`text-xl font-bold ${themeClasses.text}`}>{title}</span>
                        </div>
                    )}
                    {/* 오른쪽 닫기 버튼 */}
                    <div className='flex justify-end items-center min-w-[40px] ml-auto'>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className={`w-6 h-6 rounded-full ${themeClasses.border} border-2 flex items-center justify-center transition-all hover:scale-95 cursor-pointer`}
                                aria-label="Close modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* 본문 */}
                <div className={`p-6 ${themeClasses.card} text-t${currentTheme}-card overflow-y-auto flex-1`}>
                    {children}
                </div>

                {/* 푸터 */}
                {showFooter && (showCancelButton || showConfirmButton) && (
                    <div className={`p-2 flex justify-end space-x-3 border-t-1`}>
                        {showCancelButton && (
                            <button
                                onClick={onClose}
                                className={`px-3 py-0.5 text-sm rounded-md border-2 transition-all ${themeClasses.primary} ${themeClasses.text} ${themeClasses.border} shadow-[2px_2px_0px] shadow-t${currentTheme}-accent cursor-pointer hover:scale-95`}
                            >
                                {cancelText}
                            </button>
                        )}
                        {showConfirmButton && (
                            <button
                                onClick={() => {
                                    if (onConfirm) {
                                        onConfirm();
                                    }
                                    if (!onConfirm) {
                                        onClose();
                                    }
                                }}
                                className={`px-3 py-0.5 text-sm rounded-md font-bold border-2 transition-all shadow-[2px_2px_0px] shadow-t${currentTheme}-accent cursor-pointer hover:scale-95 ${confirmButtonColor === 'primary' ? `bg-t${currentTheme}-secondary text-t${currentTheme}-card` :
                                        confirmButtonColor === 'success' ? `${themeClasses.success} text-white` :
                                            confirmButtonColor === 'warning' ? `${themeClasses.warning} text-white` :
                                                confirmButtonColor === 'error' ? `${themeClasses.error} text-white` :
                                                    confirmButtonColor === 'default' ? `${themeClasses.card} ${themeClasses.text}` :
                                                        `bg-t${currentTheme}-secondary text-t${currentTheme}-card`
                                    } ${themeClasses.border}`}
                            >
                                {confirmText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
