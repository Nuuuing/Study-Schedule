'use client'

import { useState } from 'react';
// import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useSignInStore, useAuthStore } from '@/modules/stores/auth/authStore';
import { ThemeButtonGroup } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginPage() {
    const [email, setEmail] = useState('test');
    const [password, setPassword] = useState('1234');
    const [error, setError] = useState('');
    const router = useRouter();
    const { setSignedIn } = useSignInStore();
    const { setAuthToken, setUserName } = useAuthStore();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // 테스트 계정으로 고정
            if (email === 'test' && password === '1234') {
                // 로그인 성공 처리
                setSignedIn(true);
                setUserName('테스트 사용자');
                setAuthToken('test-token-1234');
                router.push('/');
            } else {
                setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (err: any) {
            setError(err.message || '로그인 중 오류가 발생했습니다.');
        }
    };

    const handleGoogleLogin = async () => {
        setError('');

        try {
            // 구글 로그인 테스트용 처리
            setSignedIn(true);
            setUserName('구글 테스트 사용자');
            setAuthToken('google-test-token-1234');
            router.push('/');
        } catch (err: any) {
            setError(err.message || '로그인 중 오류가 발생했습니다.');
        }
    };

    const handleGithubLogin = async () => {
        setError('');

        try {
            // GitHub 로그인 테스트용 처리
            setSignedIn(true);
            setUserName('GitHub 테스트 사용자');
            setAuthToken('github-test-token-1234');
            router.push('/');
        } catch (err: any) {
            setError(err.message || '로그인 중 오류가 발생했습니다.');
        }
    };

    const { currentTheme, theme } = useTheme();
    const themeClasses = theme.classes;

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${themeClasses.background} ${themeClasses.text} bg-[size:20px_20px] bg-[-1px_-1px] bg-fixed`}>

            {/* 별모양 장식 */}
            <div className={`absolute top-10 right-10 text-4xl ${themeClasses.accent}`}>✧</div>
            <div className={`absolute top-40 left-16 text-2xl ${themeClasses.accent} `}>✦</div>
            <div className={`absolute bottom-20 right-24 text-3xl ${themeClasses.accent}`}>✧</div>
            <div className={`absolute bottom-40 left-10 text-xl ${themeClasses.accent}`}>○</div>

            <div className={`w-full max-w-md border-3 rounded-lg ${themeClasses.card} ${themeClasses.border} shadow-[8px_8px_0] shadow-t${currentTheme}-text`}>
                {/* Y2K 스타일 헤더 */}
                <div className={`h-[2.5rem] flex items-center px-4 justify-between rounded-t-lg border-b-2 ${themeClasses.card} ${themeClasses.border}`}>

                    <div className='flex justify-end gap-1'>
                        <div className={`w-5 h-5 flex items-center justify-center rounded-2xl border-2 ${themeClasses.border}`}>
                        </div>
                        <div className={`w-5 h-5 flex items-center justify-center rounded-2xl border-2 ${themeClasses.border}`}>
                        </div>
                        <div className={`w-5 h-5 flex items-center justify-center rounded-2xl border-2 ${themeClasses.border}`}>
                        </div>
                    </div>
                    <div className={`text-xl font-bold ${themeClasses.text}`}>HELLO!</div>
                </div>

                <div className={`p-6 ${themeClasses.primary} text-t${currentTheme}-card`}>

                    <h1 className={`text-2xl font-bold mb-4 text-center text-t${currentTheme}-card`}>Study Scheduler</h1>

                    {error && <div className={`p-3 mb-4 border rounded-md ${themeClasses.error} text-white ${themeClasses.border}`}>{error}</div>}

                    <form onSubmit={handleEmailLogin} className="mb-6">
                        <div className="mb-4">
                            <label htmlFor="email" className={`block mb-2 text-md font-medium text-t${currentTheme}-card`}>
                                아이디
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-2 rounded-md focus:outline-none transition-all border-2 ${themeClasses.card} ${themeClasses.text} ${themeClasses.border}`}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className={`block mb-2 text-md font-medium text-t${currentTheme}-card`}>
                                비밀번호
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-4 py-2 rounded-md focus:outline-none transition-all border-2 ${themeClasses.card} ${themeClasses.text} ${themeClasses.border}`}
                                required
                            />
                        </div>

                    </form>

                    <div className="mb-6">
                        <button
                            className={`w-full rounded-md p-1 mb-3 font-bold border-2 transition-all bg-t${currentTheme}-secondary text-t${currentTheme}-card ${themeClasses.border} shadow-[3px_3px_0px] shadow-t${currentTheme}-accent cursor-pointer hover:scale-95`}
                            onClick={handleEmailLogin}
                        >
                            로그인
                        </button>
                    </div>

                    <div className="flex justify-center gap-6 mt-6">
                        {/* 구글 로그인 버튼 */}
                        <button
                            onClick={handleGoogleLogin}
                            className={`w-12 h-12 rounded-full transition-all flex items-center justify-center border-2 hover:scale-105 ${themeClasses.card} ${themeClasses.text} ${themeClasses.border} shadow-[2px_2px_0px] shadow-t${currentTheme}-accent cursor-pointer`}
                            aria-label="Google 로그인"
                        >
                            <div className="w-6 h-6 flex-shrink-0">
                                <svg viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                                    <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                                    <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                                    <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                                </svg>
                            </div>
                        </button>

                        {/* GitHub 로그인 버튼 */}
                        <button
                            onClick={handleGithubLogin}
                            className={`w-12 h-12 rounded-full transition-all flex items-center justify-center border-2 hover:scale-105 ${themeClasses.card} ${themeClasses.text} ${themeClasses.border} shadow-[2px_2px_0px] shadow-t${currentTheme}-accent cursor-pointer`}
                            aria-label="GitHub 로그인"
                        >
                            <div className="w-6 h-6 flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* 테마 버튼 그룹 */}

            <div className="fixed left-6 bottom-8 z-10">
                <ThemeButtonGroup />
            </div>
            {/* Y2K 스타일 CSS */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                
                .float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
