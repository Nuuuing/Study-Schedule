export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 bg-white/50 dark:bg-black/50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-t-transparent border-black dark:border-white rounded-full animate-spin" />
        </div>
    );
}