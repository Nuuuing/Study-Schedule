import React, { useRef, useEffect, useState } from "react";
interface TodoListProps {
    todos: string[];
    themeClasses: { [key: string]: string };
    onDelete?: (idx: number) => void;
    onEdit?: (idx: number, value: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, themeClasses, onDelete, onEdit }) => {
    const [editIdx, setEditIdx] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const secondaryColors: Record<string, string> = {
        'bg-t1-secondary': '#EADDCD',
        'bg-t2-secondary': '#A2D2FF',
        'bg-t3-secondary': '#fdfd96',
        'bg-t4-secondary': '#94A1B2',
    };
    const accentColor = secondaryColors[themeClasses.secondary] || '#A2D2FF';

    const primaryColorClass = themeClasses.primary.replace('bg-', 'scrollbar-thumb-');
    // 스크롤바 너비를 고려한 컨테이너
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number | null>(null);

    // 컨테이너 크기 측정
    useEffect(() => {
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver(entries => {
                const width = entries[0].contentRect.width;
                setContainerWidth(width);
            });
            
            resizeObserver.observe(containerRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className={`w-full flex flex-col items-center flex-grow h-full custom-scrollbar ${primaryColorClass} relative`}
            style={{ 
                overflowY: 'auto', 
                paddingLeft: '4px',
                paddingRight: '8px', 
                boxSizing: 'border-box',
                scrollbarGutter: 'stable'  // 스크롤바 영역 미리 확보
            }}
        >
            {todos.map((todo, i) => (
                <div
                    key={i}
                    className={`w-full min-w-0 flex items-center mb-2 px-3 ${themeClasses.card} ${themeClasses.text} rounded-lg border-2 ${themeClasses.border}`}
                    style={{ 
                        width: containerWidth ? `${containerWidth - 8}px` : '100%', 
                        maxWidth: '100%',
                        margin: '0 auto'
                    }}
                >
                    <input type="checkbox" className={`custom-checkbox mr-2 flex-shrink-0 border-2 ${themeClasses.primary}`}
                        style={{ borderColor: themeClasses.primary ? undefined : "#000", accentColor }} />
                    {editIdx === i ? (
                        <>
                            <input
                                className={`flex-1 mr-1 px-1 border-2 ${themeClasses.border} ${themeClasses.card} ${themeClasses.text} text-xs`}
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                            />
                            <button 
                                className={`w-6 h-6 flex items-center justify-center rounded-full ${themeClasses.background} hover:bg-black/10 transition flex-shrink-0 mr-1`} 
                                onClick={() => { onEdit?.(i, editValue); setEditIdx(null); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${themeClasses.text}`}>
                                    <path d="M20 6L9 17l-5-5"></path>
                                </svg>
                            </button>
                            <button 
                                className={`w-6 h-6 flex items-center justify-center rounded-full ${themeClasses.background} hover:bg-black/10 transition flex-shrink-0`} 
                                onClick={() => setEditIdx(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${themeClasses.text}`}>
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </>
                    ) : (
                        <>
                            <span className={`text-xs ${themeClasses.text} line-clamp-2 block py-1 flex-1 min-w-0`} style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{todo}</span>
                            <div className="flex-shrink-0 flex items-center ml-1">
                                <button 
                                    className={`w-6 h-6 flex items-center justify-center rounded-full ${themeClasses.background} hover:bg-black/10 transition flex-shrink-0 mr-1`} 
                                    onClick={() => { setEditIdx(i); setEditValue(todo); }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${themeClasses.text}`}>
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button 
                                    className={`w-6 h-6 flex items-center justify-center rounded-full ${themeClasses.background} hover:bg-black/10 transition flex-shrink-0`} 
                                    onClick={() => onDelete?.(i)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${themeClasses.text}`}>
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};
