
export interface UserDataT{
	id: string;
	name: string;
	color?: string;
	icon?: string; 
};

export type Goal = { id: string; userId: string; content: string; completed: boolean };

export type TimeSlot = {
	start: string;
	end: string;
	id?: string; // 각 시간대를 구분하기 위한 ID
};

export type Participate = {
	[date: string]: {
		[userId: string]: {
			present: boolean;
			timeSlots?: TimeSlot[]; // 여러 시간대 배열
		}
	}
};
export type StudyHour = { hours: number; minutes: number };
export type StudyHours = { [date: string]: { [participantId: string]: StudyHour } };
