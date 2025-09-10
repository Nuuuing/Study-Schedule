import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/contexts/ThemeContext";

interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    className?: string;
    placement?: "top" | "bottom" | "left" | "right";
}

export const Tooltip = (props: TooltipProps) => {
    const { children, content, className = "", placement = "bottom" } = props;
    const [show, setShow] = useState(false);
    const [coords, setCoords] = useState<{top: number, left: number}>({top: 0, left: 0});
    const triggerRef = useRef<HTMLSpanElement>(null);
    const { theme } = useTheme();
    const themeClasses = theme.classes;

    useEffect(() => {
        if (show && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            let top = 0, left = 0;
            switch (placement) {
                case "top":
                    top = rect.top - 8;
                    left = rect.left + rect.width / 2;
                    break;
                case "bottom":
                    top = rect.bottom + 8;
                    left = rect.left + rect.width / 2;
                    break;
                case "left":
                    top = rect.top + rect.height / 2;
                    left = rect.left - 8;
                    break;
                case "right":
                    top = rect.top + rect.height / 2;
                    left = rect.right + 8;
                    break;
            }
            setCoords({top, left});
        }
    }, [show, placement]);

    return (
        <>
            <span
                ref={triggerRef}
                className="inline-block cursor-pointer"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onClick={() => setShow((prev) => !prev)}
            >
                {children}
            </span>
            {show && createPortal(
                    <div
                        className={`fixed z-[9999] px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap overflow-hidden text-ellipsis ${themeClasses.card} ${themeClasses.text} ${className}`}
                        style={{
                            top: coords.top,
                            left: coords.left,
                            transform: placement === "top" ? "translate(-50%, -100%)" :
                                placement === "bottom" ? "translate(-50%, 0)" :
                                placement === "left" ? "translate(-100%, -50%)" :
                                "translate(0, -50%)",
                            maxWidth: '320px',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {content}
                    </div>,
                document.body
            )}
        </>
    );
}