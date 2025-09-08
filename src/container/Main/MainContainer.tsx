import { Calendar, SectionLabel } from "@/components";
import { useEffect, useState } from "react";
import { useCurrentDate, useSetCurrentDate, useResetToday } from "@/modules/stores/calendarStore";

export const MainContainer = () => {
    const currentDate = useCurrentDate();
    const setCurrentDate = useSetCurrentDate();
    const resetToday = useResetToday();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        resetToday();
    }, [resetToday]);

    return (
        <>
            <div className="flex w-full h-[100%]">
                <div className="w-[20%] pt-2">
                    <SectionLabel>
                        {(currentDate.getMonth() + 1 < 10
                            ? `0${currentDate.getMonth() + 1}`
                            : `${currentDate.getMonth() + 1}`)
                            .split("")
                            .map((char, idx) => (
                                <span key={idx} className="px-[0.2rem]">{char}</span>
                            ))
                        }
                    </SectionLabel>
                </div>
                <div className="w-[80%] h-[100%]">
                    <Calendar />
                </div>
            </div>
        </>
    )
}