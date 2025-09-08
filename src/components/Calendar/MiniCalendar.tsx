import React from 'react';
import type { Participate, UserDataT } from '@/modules/types/types';

type ScheduleItem = {
    content: string;
    createdAt: number;
};

type Props = {
    currentDate: Date;
    participate?: Participate;
    userList?: UserDataT[];
    filterUserId?: string;
    selectedDate?: Date | null;
    onDayClick?: (date: Date) => void;
    schedules?: Record<string, ScheduleItem[]>;
};

export const MiniCalendar = ({ currentDate, participate = {}, userList = [], filterUserId, selectedDate, onDayClick, schedules = {} }: Props) => {

    
    return (
       <></>
    );
}
