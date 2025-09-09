import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const usePageLoading = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const navigateWithLoading = (url: string) => {
        setIsLoading(true);
        
        router.push(url);
        
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
