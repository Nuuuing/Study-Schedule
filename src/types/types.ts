export type Participant = {
	id: string;
	name: string;
	color?: string; // hex or tailwind color
	icon?: string;  // emoji or image url
};
export type Goal = { id: string; participantId: string; content: string; completed: boolean };
export type Attendance = {
	[date: string]: {
		[participantId: string]: {
			present: boolean;
			start?: string;
			end?: string;
		}
	}
};
export type StudyHour = { hours: number; minutes: number };
export type StudyHours = { [date: string]: { [participantId: string]: StudyHour } };
