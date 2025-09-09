'use client';

// import { useEffect } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { useSignInStore, useAuthStore } from '@/modules/stores/auth/authStore';
import { ThemeProvider } from '../contexts/ThemeContext';

// 애플리케이션의 모든 프로바이더를 관리하는 컴포넌트
export function Providers({ children }: { children: React.ReactNode }) {
    // 테스트 개발 모드에서는 providers에서 인증 상태를 관리하지 않음
    // 로그인 페이지에서 직접 상태를 업데이트함
    
    return (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );
}
