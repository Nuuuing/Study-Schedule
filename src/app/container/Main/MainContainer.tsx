import { SectionLabel } from "@/components";
import NewCalendar from "@/components/Calendar/NewCalendar";
import { useEffect, useState } from "react";

export const MainContainer = () => {
    const [currentDate, setCurrentDate] = useState<Date | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentDate(new Date());
    }, []);

    return (
        <>
            <div className="flex w-[100%] h-[100%]">
                <div className="w-[20%]">
                    <SectionLabel>
                        {currentDate
                            ? (currentDate.getMonth() + 1 < 10
                                ? `0${currentDate.getMonth() + 1}`
                                : `${currentDate.getMonth() + 1}`)
                                .split("")
                                .map((char, idx) => (
                                    <span key={idx} className="px-[0.2rem]">{char}</span>
                                ))
                            : ""}
                    </SectionLabel>
                </div>
                <div className="w-[80%]">
                    <NewCalendar />
                </div>
            </div>
        </>
    )
}