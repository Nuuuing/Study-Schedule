import { useState } from 'react';
import { TimeSlot } from '@/modules/types';

export interface ParticipateDetail {
  present?: boolean;
  timeSlots?: TimeSlot[];
}

export interface UseParticipationReturnType {
  participation: Record<string, Record<string, ParticipateDetail>>;
  setParticipateDetail: (dateKey: string, userId: string, detail: { present: boolean; timeSlots?: TimeSlot[] }) => Promise<void>;
  removeParticipateForDate: (userId: string, dateKey: string) => Promise<void>;
}

/**
 * 참여 관리를 위한 커스텀 훅
 */
export const useParticipation = (initialParticipation: Record<string, Record<string, ParticipateDetail>> = {}): UseParticipationReturnType => {
  const [participation, setParticipation] = useState<Record<string, Record<string, ParticipateDetail>>>(initialParticipation);

  const setParticipateDetail = async (dateKey: string, userId: string, detail: { present: boolean; timeSlots?: TimeSlot[] }) => {
    setParticipation(prev => {
      const updatedParticipation = { ...prev };
      
      if (!updatedParticipation[dateKey]) {
        updatedParticipation[dateKey] = {};
      }
      
      updatedParticipation[dateKey][userId] = {
        ...(updatedParticipation[dateKey][userId] || {}),
        ...detail
      };
      
      return updatedParticipation;
    });
  };

  const removeParticipateForDate = async (userId: string, dateKey: string) => {
    setParticipation(prev => {
      const updatedParticipation = { ...prev };
      
      if (updatedParticipation[dateKey] && updatedParticipation[dateKey][userId]) {
        const { [userId]: _, ...rest } = updatedParticipation[dateKey];
        
        if (Object.keys(rest).length === 0) {
          const { [dateKey]: __, ...remainingDates } = updatedParticipation;
          return remainingDates;
        }
        
        updatedParticipation[dateKey] = rest;
      }
      
      return updatedParticipation;
    });
  };

  return { participation, setParticipateDetail, removeParticipateForDate };
};

export default useParticipation;