import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
// import { getAuth } from 'firebase/auth' // 테스트 모드에서는 사용하지 않음

//로그인 여부
export type SignInState = {
    isSignedIn: boolean;
    setSignedIn: (next: boolean) => void;
    setSignOut: () => void;
}

//로그인 정보
export type AuthState = {
    authToken: string | null;
    userName: string | null;
    setAuthToken: (next: string | null) => void;
    clearAuth: () => void;
    setUserName: (next: string | null) => void;
    clearUserName: () => void;
}

export const useSignInStore = create<SignInState>()(
    devtools((set) => ({
        // 개발 테스트를 위해 초기값을 false로 설정 (로그인 필요)
        isSignedIn: false,
        setSignedIn: (next) => set({ isSignedIn: next }),
        setSignOut: () => set({ isSignedIn: false }),
    }))
);

export const useAuthStore = create<AuthState>()(
    devtools((set) => ({
        authToken: null,
        userName: null,
        setAuthToken: (next) => set({ authToken: next }),
        clearAuth: () => set({ authToken: null }),
        setUserName: (next) => set({ userName: next }),
        clearUserName: () => set({ userName: null }),
    }))
);

export const useIsSignedIn = () => useSignInStore((s) => s.isSignedIn);
export const useSetSignedIn = () => useSignInStore((s) => s.setSignedIn);

export const useAuthToken = () => useAuthStore((s) => s.authToken);
export const useSetAuthToken = () => useAuthStore((s) => s.setAuthToken);
export const useClearAuth = () => useAuthStore((s) => s.clearAuth);
export const useUserName = () => useAuthStore((s) => s.userName);
export const useSetUserName = () => useAuthStore((s) => s.setUserName);
export const useClearUserName = () => useAuthStore((s) => s.clearUserName);

export const useSignOut = () => {
    const setSignedIn = useSignInStore(state => state.setSignOut);
    const clearAuth = useAuthStore(state => state.clearAuth);
    const clearUserName = useAuthStore(state => state.clearUserName);
    
    return () => {
        // 테스트 모드에서는 즉시 로컬 상태만 초기화
        setSignedIn();
        clearAuth();
        clearUserName();
    };
};