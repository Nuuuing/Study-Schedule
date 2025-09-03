import { getTextColor } from "@/utils/textUtils";

interface NameTagProps {
    color?: string;
    name: string;
    present?: boolean;
}
export const NameTag = (props: NameTagProps) => {
    const { color, name, present } = props;

    return (
        <span
            className="inline-flex font-semibold flex-shrink-0 px-1 py-0.5 rounded-full items-center gap-0.5 text-xs max-w-full px-[8px]"
            style={{
                backgroundColor: color || '#6366f1',
                color: getTextColor(color || '#6366f1'),
            }}
            title={`${name} (${present ? '참석' : '미참'})`}
        >
            <span
                className={`inline-block w-1 h-1 rounded-full flex-shrink-0 ${present ? 'bg-green-400' : 'bg-red-400'}`}
                aria-label={present ? '참석' : '미참'}
            />
            <span className="pl-[4px] overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
                {name}
            </span>
        </span>
    )
};