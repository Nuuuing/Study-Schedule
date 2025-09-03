import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const usePageLoading = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const navigateWithLoading = (url: string) => {
        setIsLoading(true);
        
        // 페이지 전환
        router.push(url);
        
        // 일정 시간 후 로딩 상태 해제 (Next.js가 페이지를 로드할 시간)
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    return {
        isLoading,
        navigateWithLoading,
        setIsLoading
    };
};
