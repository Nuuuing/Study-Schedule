'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useSignInStore, useAuthStore, useIsSignedIn } from '@/modules/stores/auth/authStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

// default로 내보내기 변경
export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const isSignedIn = useIsSignedIn();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthGuard - 로그인 상태:", isSignedIn);
        
        // 테스트 개발 모드에서는 로그인 상태를 체크하기만 함
        if (!isSignedIn) {
            console.log("AuthGuard - 로그인 페이지로 리다이렉트");
            // 명시적으로 경로 지정하고 즉시 리다이렉트
            window.location.href = '/login';
            return;
        }
        
        // 로딩 상태 해제
        setLoading(false);
    }, [isSignedIn, router]);

    if (loading) {
        return <div>인증 상태 확인 중...</div>;
    }

    if (!isSignedIn) {
        return null; // 인증되지 않은 경우 리다이렉트 중이므로 아무것도 표시하지 않음
    }

    return <>{children}</>;
}
