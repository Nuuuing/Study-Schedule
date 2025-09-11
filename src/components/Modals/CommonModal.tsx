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

export const CommonModal: React.FC<CommonModalProps> = ({
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
    showConfirmButton = true,
    cancelText = '취소',
    confirmText = '확인',
    onConfirm,
    confirmButtonColor = 'primary'
}) => {
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
                className={`${width} ${themeClasses.card} ${themeClasses.text} rounded-xl shadow-xl relative ${animationClass} z-10 max-h-[90vh] flex flex-col border-2 ${themeClasses.border}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                {(title || showCloseButton) && (
                    <div className={`flex items-center justify-between p-4 border-b ${themeClasses.border}`}>
                        {title && <h3 className="text-lg font-bold">{title}</h3>}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className={`w-7 h-7 rounded-full ${themeClasses.background} hover:bg-black/10 flex items-center justify-center transition-colors cursor-pointer`}
                                aria-label="Close modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* 본문 */}
                <div className="p-4 overflow-y-auto flex-1">
                    {children}
                </div>

                {/* 푸터 */}
                {showFooter && (showCancelButton || showConfirmButton) && (
                    <div className={`p-4 border-t ${themeClasses.border} flex justify-end space-x-2`}>
                        {showCancelButton && (
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 text-sm rounded-md border ${themeClasses.border} ${themeClasses.background} ${themeClasses.text} transition hover:bg-black/5`}
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
                                className={`px-4 py-2 text-sm rounded-md transition ${confirmButtonColor === 'primary' ? `${themeClasses.primary}` :
                                        confirmButtonColor === 'success' ? `${themeClasses.success}` :
                                            confirmButtonColor === 'warning' ? `${themeClasses.warning}` :
                                                confirmButtonColor === 'error' ? `${themeClasses.error}` :
                                                    `${themeClasses.primary}`
                                    } ${confirmButtonColor === 'default' ?
                                        `${themeClasses.background} ${themeClasses.text} border ${themeClasses.border} hover:bg-black/5` :
                                        'text-white hover:brightness-95'
                                    }`}
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
