export default function StatsLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                {/* 간단한 스피너 */}
                <div className="w-12 h-12 border-3 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                
                {/* 로딩 텍스트 */}
                <p className="text-gray-700 dark:text-gray-300">
                    📊 통계 로딩 중...
                </p>
            </div>
        </div>
    );
}
