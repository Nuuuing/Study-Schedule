
import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, updateDoc, deleteDoc, deleteField, Firestore, QuerySnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Participant, Goal, Attendance, StudyHours } from '../types/types';

interface ScheduleItem {
    content: string;
    createdAt: number;
}
type Schedules = {
    [date: string]: ScheduleItem[];
};

const useFirebaseState = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [attendance, setAttendance] = useState<Attendance>({});
    const [studyHours, setStudyHoursState] = useState<StudyHours>({});
    const [schedules, setSchedules] = useState<Schedules>({});
    const [activeUserId, setActiveUserId] = useState<string | null>(null); // 현재 선택된 유저 id
    const [db, setDb] = useState<ReturnType<typeof getFirestore> | null>(null);

    useEffect(() => {
        if (!db) return;
        // Firestore 타입 체크
        if (!(db instanceof Firestore)) return;
        const schedulesCol = collection(db, 'schedules');
        const unsub = onSnapshot(schedulesCol, (snapshot: QuerySnapshot<DocumentData>) => {
            const newSchedules: Schedules = {};
            snapshot.docs.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
                const date = docSnap.id;
                const data = docSnap.data();
                newSchedules[date] = data.items || [];
            });
            setSchedules(newSchedules);
        });
        return () => unsub();
    }, [db]);

    // 공통 스케줄 추가
    const addSchedule = async (date: string, content: string) => {
        if (!db) return;
        try {
            const ref = doc(db, `schedules/${date}`);
            const prevSnap = await getDoc(ref);
            let prevItems: ScheduleItem[] = [];
            if (prevSnap.exists()) {
                prevItems = prevSnap.data().items || [];
            }
            const newItem: ScheduleItem = {
                content,
                createdAt: Date.now(),
            };
            await setDoc(ref, { items: [...prevItems, newItem] }, { merge: true });
        } catch (e) {
            console.error('Error adding schedule:', e);
        }
    };

    // 공통 스케줄 삭제
    const removeSchedule = useCallback(async (date: string, idx: number) => {
        if (!db) return;
        try {
            const ref = doc(db, `schedules/${date}`);
            const prevSnap = await getDoc(ref);
            if (!prevSnap.exists()) return;
            const prevItems: ScheduleItem[] = prevSnap.data().items || [];
            const newItems = prevItems.slice(0, idx).concat(prevItems.slice(idx + 1));
            await setDoc(ref, { items: newItems }, { merge: true });
        } catch (e) {
            console.error('Error removing schedule:', e);
        }
    }, [db]);

    // 공통 스케줄 수정
    const updateSchedule = useCallback(async (date: string, idx: number, newContent: string) => {
        if (!db) return;
        try {
            const ref = doc(db, `schedules/${date}`);
            const prevSnap = await getDoc(ref);
            if (!prevSnap.exists()) return;
            const prevItems: ScheduleItem[] = prevSnap.data().items || [];
            if (!prevItems[idx]) return;
            prevItems[idx] = { ...prevItems[idx], content: newContent };
            await setDoc(ref, { items: prevItems }, { merge: true });
        } catch (e) {
            console.error('Error updating schedule:', e);
        }
    }, [db]);

    useEffect(() => {
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        if (!firebaseConfig.apiKey) {
            console.error("Firebase config is missing. Make sure to provide it.");
            return;
        }
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        setDb(firestore);
    }, []);

    // 전체 유저 목록은 항상 participants 컬렉션에서 가져옴
    useEffect(() => {
        if (!db) return;
        const participantsCollectionRef = collection(db, `participants`);
        const unsubscribeParticipants = onSnapshot(participantsCollectionRef, (snapshot) => {
            const p: Participant[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name ?? '',
                    color: data.color ?? '',
                    icon: data.icon ?? ''
                };
            });
            setParticipants(p);

            // 모든 유저의 goals를 합쳐서 불러오기
            if (!db) return;
            // 기존 goals 구독 해제용
            const unsubGoalsArr: (() => void)[] = [];
            let allGoals: Goal[] = [];
            p.forEach(user => {
                const goalsCollectionRef = collection(db, `studies/${user.id}/goals`);
                const unsub = onSnapshot(goalsCollectionRef, (snapshot) => {
                    // 이 유저의 goals만 추출
                    const userGoals: Goal[] = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            participantId: data.participantId ?? '',
                            content: data.content ?? '',
                            completed: !!data.completed,
                        };
                    });
                    // 기존 allGoals에서 이 유저의 goal만 제거 후 새로 추가
                    allGoals = allGoals.filter((g) => g.participantId !== user.id).concat(userGoals);
                    setGoals([...allGoals]);
                });
                unsubGoalsArr.push(unsub);
            });
            // participants가 바뀔 때 goals 구독 해제
            return () => { unsubGoalsArr.forEach(unsub => unsub()); };
        });
        return () => unsubscribeParticipants();
    }, [db]);

    // 모든 참가자의 출석/공부시간 정보를 한 번에 구독해서 합침
    useEffect(() => {
        if (!db || participants.length === 0) return;
        const unsubAttendanceList: (() => void)[] = [];
        const unsubStudyHoursList: (() => void)[] = [];
        const mergedAttendance: Attendance = {};
        const mergedStudyHours: StudyHours = {};
        participants.forEach((user) => {
            // 출석 구독
            const attendanceDocRef = doc(db, `studies/${user.id}/data/attendance`);
            const unsubA = onSnapshot(attendanceDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userAttendance = docSnap.data();
                    Object.entries(userAttendance).forEach(([date, value]) => {
                        if (!mergedAttendance[date]) mergedAttendance[date] = {};
                        // value는 { present, start, end } 구조로 저장됨
                        mergedAttendance[date][user.id] = value;
                    });
                }
                setAttendance({ ...mergedAttendance });
            });
            unsubAttendanceList.push(unsubA);

            // 공부시간 구독
            const studyHoursDocRef = doc(db, `studies/${user.id}/data/studyHours`);
            const unsubS = onSnapshot(studyHoursDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userStudyHours = docSnap.data();
                    Object.entries(userStudyHours).forEach(([date, value]) => {
                        if (!mergedStudyHours[date]) mergedStudyHours[date] = {};
                        mergedStudyHours[date][user.id] = value;
                    });
                }
                setStudyHoursState({ ...mergedStudyHours });
            });
            unsubStudyHoursList.push(unsubS);
        });
        return () => {
            unsubAttendanceList.forEach(unsub => unsub());
            unsubStudyHoursList.forEach(unsub => unsub());
        };
    }, [db, participants]);

    const addParticipant = async (name: string, color?: string, icon?: string) => {
        if (!db) return;
        try {
            const ref = doc(collection(db, `participants`));
            await setDoc(ref, { name, color: color || '', icon: icon || '' });
            // 유저 추가 후 해당 유저를 activeUserId로 자동 선택
            setActiveUserId(ref.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };
    const updateGoal = async (id: string, participantId: string, data: Partial<Goal>) => {
        if (!db || !participantId) return;
        try {
            const ref = doc(db, `studies/${participantId}/goals`, id);
            const filtered: Partial<Goal> = {};
            Object.entries(data).forEach(([k, v]) => {
                if (v !== undefined) {
                    if (k === 'completed') {
                        (filtered as Partial<Goal>)[k] = Boolean(v);
                    } else if (k === 'content' || k === 'participantId' || k === 'id') {
                        (filtered as Partial<Goal>)[k] = String(v);
                    }
                }
            });
            await updateDoc(ref, filtered);
        } catch (e) {
            console.error("Error updating goal: ", e);
        }
    };

    const deleteGoal = async (id: string, participantId: string) => {
        if (!db || !participantId) return;
        try {
            const ref = doc(db, `studies/${participantId}/goals`, id);
            await deleteDoc(ref);
        } catch (e) {
            console.error("Error deleting goal: ", e);
        }
    };
    const removeParticipant = async (id: string) => {
        if (!db) return;
        try {
            // 1. 유저 도큐먼트 삭제
            await deleteDoc(doc(db, `participants`, id));

            // 2. 해당 유저의 goals/attendance/studyHours 모두 삭제
            const goalsCollectionRef = collection(db, `studies/${id}/goals`);
            const { getDocs } = await import('firebase/firestore');
            const goalsDocs = await getDocs(goalsCollectionRef);
            for (const docSnap of goalsDocs.docs) {
                await deleteDoc(docSnap.ref);
            }

            // 출석(attendance) 삭제
            const attendanceRef = doc(db, `studies/${id}/data/attendance`);
            await deleteDoc(attendanceRef);

            // 공부시간(studyHours) 삭제
            const studyHoursRef = doc(db, `studies/${id}/data/studyHours`);
            await deleteDoc(studyHoursRef);
        } catch (e) {
            console.error("Error removing participant and related data: ", e);
        }
    };
    const addGoal = async (goal: Omit<Goal, 'id'>) => {
        if (!db || !goal.participantId) return;
        try {
            await setDoc(doc(collection(db, `studies/${goal.participantId}/goals`)), goal);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };
    const toggleGoalCompletion = async (goalId: string, participantId: string) => {
        if (!db || !participantId) return;
        try {
            const goalRef = doc(db, `studies/${participantId}/goals`, goalId);
            const currentGoal = await getDoc(goalRef);
            if (currentGoal.exists()) {
                await updateDoc(goalRef, { completed: !currentGoal.data().completed });
            }
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const toggleAttendance = async (date: string, participantId: string) => {
        if (!db || !activeUserId) return;
        try {
            const attendanceRef = doc(db, `studies/${activeUserId}/data/attendance`);
            const prev = attendance[date]?.[participantId];
            const updatedAttendance = { ...attendance };
            if (!attendance[date]) updatedAttendance[date] = {};
            if (!prev) {
                // 없으면 추가 (참석)
                updatedAttendance[date][participantId] = { present: true };
            } else {
                // 있으면 present만 토글
                updatedAttendance[date][participantId] = {
                    ...prev,
                    present: !prev.present
                };
            }
            await setDoc(attendanceRef, updatedAttendance);
        } catch (e) {
            console.error("Error updating attendance: ", e);
        }
    };

    // 출석 정보(참석여부, 시간) 수정
    const setAttendanceDetail = async (date: string, participantId: string, detail: { present: boolean; start?: string; end?: string }) => {
        if (!db) return;
        try {
            const attendanceRef = doc(db, `studies/${participantId}/data/attendance`);
            await setDoc(attendanceRef, {
                [date]: detail
            }, { merge: true });
        } catch (e) {
            console.error("Error updating attendance detail: ", e);
        }
    };

    // 특정 날짜의 출석 기록 삭제
    const removeAttendanceForDate = async (date: string, participantId: string) => {
        if (!db) return;
        try {
            const attendanceRef = doc(db, `studies/${participantId}/data/attendance`);
            await updateDoc(attendanceRef, {
                [date]: deleteField()
            });
            
            // 로컬 상태도 즉시 업데이트
            setAttendance(prevAttendance => {
                const updatedAttendance = { ...prevAttendance };
                if (updatedAttendance[date] && updatedAttendance[date][participantId]) {
                    delete updatedAttendance[date][participantId];
                    // 해당 날짜에 다른 참가자가 없으면 날짜 자체도 삭제
                    if (Object.keys(updatedAttendance[date]).length === 0) {
                        delete updatedAttendance[date];
                    }
                }
                return updatedAttendance;
            });
        } catch (e) {
            console.error("Error removing attendance for date: ", e);
        }
    };

    // 유저 정보(이름, 색상, 아이콘) 수정
    const updateParticipant = async (id: string, data: Partial<Participant>) => {
        if (!db) return;
        try {
            const ref = doc(db, `participants`, id);
            const filtered: Partial<Participant> = {};
            Object.entries(data).forEach(([k, v]) => {
                if (v !== undefined) filtered[k as keyof Participant] = v;
            });
            await updateDoc(ref, filtered);
        } catch (e) {
            console.error("Error updating participant: ", e);
        }
    };
    
    const updateStudyHours = async (date: string, participantId: string, hours: number, minutes: number) => {
        if (!db || !participantId) return;
        try {
            const studyHoursRef = doc(db, `studies/${participantId}/data/studyHours`);
            // 기존 데이터를 불러와서 안전하게 머지
            let prevData: Record<string, { hours: number; minutes: number }> = {};
            try {
                const prevSnap = await getDoc(studyHoursRef);
                if (prevSnap.exists()) prevData = prevSnap.data() as Record<string, { hours: number; minutes: number }>;
            } catch { }
            await setDoc(studyHoursRef, {
                ...prevData,
                [date]: { hours: Number(hours), minutes: Number(minutes) }
            }, { merge: true });
        } catch (e) {
            console.error("Error updating study hours: ", e);
        }
    };

    return {
        participants,
        goals,
        attendance,
        studyHours,
        schedules,
        addSchedule,
        removeSchedule,
        updateSchedule,
        activeUserId,
        setActiveUserId,
        addParticipant,
        updateGoal,
        deleteGoal,
        removeParticipant,
        addGoal,
        toggleGoalCompletion,
        toggleAttendance,
        setAttendanceDetail,
        removeAttendanceForDate,
        setStudyHours: updateStudyHours,
        updateParticipant,
    };
};

export default useFirebaseState;
