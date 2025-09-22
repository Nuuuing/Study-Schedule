import { useState } from 'react';

export interface ScheduleItem {
  content: string;
  createdAt: number;
}

export interface UseSchedulesReturnType {
  schedules: Record<string, ScheduleItem[]>;
  addSchedule: (dateKey: string, content: string) => Promise<boolean>;
  removeSchedule: (dateKey: string, index: number) => Promise<boolean>;
  updateSchedule: (dateKey: string, index: number, newContent: string) => Promise<boolean>;
}

/**
 * 스케줄 관리를 위한 커스텀 훅
 */
export const useSchedules = (initialSchedules: Record<string, ScheduleItem[]> = {}): UseSchedulesReturnType => {
  const [schedules, setSchedules] = useState<Record<string, ScheduleItem[]>>(initialSchedules);

  const addSchedule = async (dateKey: string, content: string) => {
    if (!content.trim()) return false;
    
    try {
      const newSchedule: ScheduleItem = {
        content,
        createdAt: Date.now()
      };
      
      const updatedSchedules = { ...schedules };
      if (!updatedSchedules[dateKey]) {
        updatedSchedules[dateKey] = [];
      }
      updatedSchedules[dateKey] = [...updatedSchedules[dateKey], newSchedule];
      
      setSchedules(updatedSchedules);
      return true;
    } catch (error) {
      console.error("스케줄 추가 오류:", error);
      return false;
    }
  };
  
  const removeSchedule = async (dateKey: string, index: number) => {
    try {
      const updatedSchedules = { ...schedules };
      if (updatedSchedules[dateKey] && updatedSchedules[dateKey].length > index) {
        updatedSchedules[dateKey] = updatedSchedules[dateKey].filter((_, i) => i !== index);
        if (updatedSchedules[dateKey].length === 0) {
          delete updatedSchedules[dateKey];
        }
        setSchedules(updatedSchedules);
        return true;
      }
      return false;
    } catch (error) {
      console.error("스케줄 제거 오류:", error);
      return false;
    }
  };
  
  const updateSchedule = async (dateKey: string, index: number, newContent: string) => {
    if (!newContent.trim()) return false;
    
    try {
      const updatedSchedules = { ...schedules };
      if (updatedSchedules[dateKey] && updatedSchedules[dateKey].length > index) {
        updatedSchedules[dateKey][index] = {
          ...updatedSchedules[dateKey][index],
          content: newContent
        };
        setSchedules(updatedSchedules);
        return true;
      }
      return false;
    } catch (error) {
      console.error("스케줄 업데이트 오류:", error);
      return false;
    }
  };

  return { schedules, addSchedule, removeSchedule, updateSchedule };
};

export default useSchedules;