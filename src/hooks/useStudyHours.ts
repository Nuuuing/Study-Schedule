import { useState } from 'react';

export interface StudyHoursDetail {
  hours: number;
  minutes: number;
}

export interface UseStudyHoursReturnType {
  studyHours: Record<string, Record<string, StudyHoursDetail>>;
  setStudyHoursForDate: (dateKey: string, userId: string, hours: number, minutes: number) => void;
  removeStudyHoursForDate: (userId: string, dateKey: string) => void;
}

/**
 * 공부 시간 관리를 위한 커스텀 훅
 */
export const useStudyHours = (initialHours: Record<string, Record<string, StudyHoursDetail>> = {}): UseStudyHoursReturnType => {
  const [studyHours, setStudyHours] = useState<Record<string, Record<string, StudyHoursDetail>>>(initialHours);

  const setStudyHoursForDate = (dateKey: string, userId: string, hours: number, minutes: number) => {
    setStudyHours(prev => {
      const updatedHours = { ...prev };
      
      if (!updatedHours[dateKey]) {
        updatedHours[dateKey] = {};
      }
      
      updatedHours[dateKey][userId] = { hours, minutes };
      
      return updatedHours;
    });
  };

  const removeStudyHoursForDate = (userId: string, dateKey: string) => {
    setStudyHours(prev => {
      const updatedHours = { ...prev };
      
      if (updatedHours[dateKey] && updatedHours[dateKey][userId]) {
        const { [userId]: _, ...rest } = updatedHours[dateKey];
        
        if (Object.keys(rest).length === 0) {
          const { [dateKey]: __, ...remainingDates } = updatedHours;
          return remainingDates;
        }
        
        updatedHours[dateKey] = rest;
      }
      
      return updatedHours;
    });
  };

  return { studyHours, setStudyHoursForDate, removeStudyHoursForDate };
};

export default useStudyHours;