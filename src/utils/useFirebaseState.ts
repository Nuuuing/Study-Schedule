
import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, updateDoc, deleteDoc, deleteField, Firestore, QuerySnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { UserDataT, Goal, Participate, StudyHours } from '../modules/types/types';

interface ScheduleItem {
    content: string;
    createdAt: number;
}
type Schedules = {
    [date: string]: ScheduleItem[];
};

const useFirebaseState = () => {
    const [userList, setUserList] = useState<UserDataT[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [participate, setParticipate] = useState<Participate>({});
    const [studyHours, setStudyHoursState] = useState<StudyHours>({});
    const [schedules, setSchedules] = useState<Schedules>({});
    const [activeUserId, setActiveUserId] = useState<string | null>(null); // 현재 선택된 유저 id
    const [db, setDb] = useState<ReturnType<typeof getFirestore> | null>(null);

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

    // 전체 유저 목록은 항상 userList 컬렉션에서 가져옴
    useEffect(() => {
        if (!db) return;
        const userListCollectionRef = collection(db, `users`);
        const unsubscribeUserList = onSnapshot(userListCollectionRef, (snapshot) => {
            const p: UserDataT[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name ?? '',
                    color: data.color ?? '',
                    icon: data.icon ?? ''
                };
            });
            setUserList(p);

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
                            userId: data.userId ?? '',
                            content: data.content ?? '',
                            completed: !!data.completed,
                        };
                    });
                    // 기존 allGoals에서 이 유저의 goal만 제거 후 새로 추가
                    allGoals = allGoals.filter((g) => g.userId !== user.id).concat(userGoals);
                    setGoals([...allGoals]);
                });
                unsubGoalsArr.push(unsub);
            });
            // user가 바뀔 때 goals 구독 해제
            return () => { unsubGoalsArr.forEach(unsub => unsub()); };
        });
        return () => unsubscribeUserList();
    }, [db]);

    // 모든 참가자의 참가/공부시간 정보를 한 번에 구독해서 합침
    useEffect(() => {
        if (!db || userList.length === 0) return;
        const unsubParticipateList: (() => void)[] = [];
        const unsubStudyHoursList: (() => void)[] = [];
        const mergedParticipate: Participate = {};
        const mergedStudyHours: StudyHours = {};
        userList.forEach((user) => {
            // 참가 구독
            const participateDocRef = doc(db, `studies/${user.id}/data/participate`);
            const unsubP = onSnapshot(participateDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userParticipate = docSnap.data();
                    Object.entries(userParticipate).forEach(([date, value]) => {
                        if (!mergedParticipate[date]) mergedParticipate[date] = {};
                        // value는 { present, start, end } 구조로 저장됨
                        mergedParticipate[date][user.id] = value;
                    });
                }
                setParticipate({ ...mergedParticipate });
            });
            unsubParticipateList.push(unsubP);

            // 공부시간 구독
            const studyHoursDocRef = doc(db, `studies/${user.id}/data/studyHours`);
            const unsubS = onSnapshot(studyHoursDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userStudyHours = docSnap.data();
                    Object.entries(userStudyHours).forEach(([date, value]) => {
                        if (!mergedStudyHours[date]) mergedStudyHours[date] = {};
                        // 타입 안전성 체크
                        if (value && typeof value === 'object' && 'hours' in value && 'minutes' in value) {
                            mergedStudyHours[date][user.id] = {
                                hours: Number(value.hours) || 0,
                                minutes: Number(value.minutes) || 0
                            };
                        }
                    });
                }
                setStudyHoursState({ ...mergedStudyHours });
            });
            unsubStudyHoursList.push(unsubS);
        });
        return () => {
            unsubParticipateList.forEach(unsub => unsub());
            unsubStudyHoursList.forEach(unsub => unsub());
        };
    }, [db, userList]);

    //#region 유저
    //유저 추가
    const addUser = async (name: string, color?: string, icon?: string) => {
        if (!db) return;
        try {
            const ref = doc(collection(db, `users`));
            await setDoc(ref, { name, color: color || '', icon: icon || '' });
            // 유저 추가 후 해당 유저를 activeUserId로 자동 선택
            setActiveUserId(ref.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    // 유저 정보(이름, 색상, 아이콘) 수정
    const updateUser = async (id: string, data: Partial<UserDataT>) => {
        if (!db) return;
        try {
            const ref = doc(db, `users`, id);
            const filtered: Partial<UserDataT> = {};
            Object.entries(data).forEach(([k, v]) => {
                if (v !== undefined) filtered[k as keyof UserDataT] = v;
            });
            await updateDoc(ref, filtered);
        } catch (e) {
            console.error("Error updating user: ", e);
        }
    };

    //유저 삭제
    const removeUser = async (id: string): Promise<{success: boolean; message: string}> => {
        if (!db) return { success: false, message: "데이터베이스 연결 오류" };
        try {
            // 1. 유저 도큐먼트 삭제
            await deleteDoc(doc(db, `users`, id));

            // 2. 해당 유저의 goals/participate/studyHours 모두 삭제
            const goalsCollectionRef = collection(db, `studies/${id}/goals`);
            const { getDocs } = await import('firebase/firestore');
            const goalsDocs = await getDocs(goalsCollectionRef);
            for (const docSnap of goalsDocs.docs) {
                await deleteDoc(docSnap.ref);
            }

            // 참가(participate) 삭제
            const participateRef = doc(db, `studies/${id}/data/participate`);
            await deleteDoc(participateRef);

            // 공부시간(studyHours) 삭제
            const studyHoursRef = doc(db, `studies/${id}/data/studyHours`);
            await deleteDoc(studyHoursRef);
        } catch (e) {
            console.error("Error removing user and related data: ", e);
            return { success: false, message: "사용자 삭제 중 오류가 발생했습니다" };
        }
        return { success: true, message: "사용자가 성공적으로 삭제되었습니다" };
    };
    //#endregion

    //#region 참가자   
    // 시간 문자열을 분으로 변환하는 헬퍼 함수
    const timeStringToMinutes = (timeString: string): number => {
        try {
            const [time, period] = timeString.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            let totalHours = hours;
            
            if (period === 'PM' && hours !== 12) {
                totalHours += 12;
            } else if (period === 'AM' && hours === 12) {
                totalHours = 0;
            }
            
            return totalHours * 60 + minutes;
        } catch (e) {
            console.error('Error parsing time string:', timeString, e);
            return 0;
        }
    };

    // 참가 정보(참가여부, 시간) 수정
    const setParticipateDetail = async (date: string, userId: string, detail: { present: boolean; timeSlots?: Array<{ start: string; end: string; id?: string }> }) => {
        if (!db) return;
        try {
            const participateRef = doc(db, `studies/${userId}/data/participate`);
            await setDoc(participateRef, {
                [date]: detail
            }, { merge: true });

        } catch (e) {
            console.error("Error updating participate detail: ", e);
        }
    };

    // 특정 날짜의 참가 기록 삭제
    const removeParticipateForDate = async (userId: string, dateKey: string) => {
        
        if (!db) {
            return;
        }
        
        try {
            // 올바른 경로: 각 사용자별 문서에서 해당 날짜 필드를 삭제
            const participateRef = doc(db, `studies/${userId}/data/participate`);
            
            // 문서가 존재하는지 확인
            const docSnap = await getDoc(participateRef);
            
            if (docSnap.exists()) {                
                // 해당 날짜 데이터만 삭제
                await updateDoc(participateRef, {
                    [dateKey]: deleteField()
                });
            }

            // 로컬 상태도 즉시 업데이트
            setParticipate(prevParticipate => {
                
                const updatedParticipate = { ...prevParticipate };
                if (updatedParticipate[dateKey] && updatedParticipate[dateKey][userId]) {
                    delete updatedParticipate[dateKey][userId];
                    
                    // 해당 날짜에 다른 참가자가 없으면 날짜 자체도 삭제
                    if (Object.keys(updatedParticipate[dateKey]).length === 0) {
                        delete updatedParticipate[dateKey];
                    }
                }
                return updatedParticipate;
            });
        } catch (e) {
            console.error("🔥 Error removing participate for date: ", e);
        }
    };

    // 공부 시간 수정
    const updateStudyHours = async (date: string, userId: string, hours: number, minutes: number) => {
        if (!db || !userId) return;
        try {
            const studyHoursRef = doc(db, `studies/${userId}/data/studyHours`);
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
    //#endregion

    //#region 스케줄
    // 스케줄 추가
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

    // 스케줄 삭제
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

    // 스케줄 수정
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
    //#endregion

    //#region 목표
    // 목표 추가
    const addGoal = async (goal: Omit<Goal, 'id'>) => {
        if (!db || !goal.userId) return;
        try {
            await setDoc(doc(collection(db, `studies/${goal.userId}/goals`)), goal);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    // 목표 수정
    const updateGoal = async (id: string, userId: string, data: Partial<Goal>) => {
        if (!db || !userId) return;
        try {
            const ref = doc(db, `studies/${userId}/goals`, id);
            const filtered: Partial<Goal> = {};
            Object.entries(data).forEach(([k, v]) => {
                if (v !== undefined) {
                    if (k === 'completed') {
                        (filtered as Partial<Goal>)[k] = Boolean(v);
                    } else if (k === 'content' || k === 'userId' || k === 'id') {
                        (filtered as Partial<Goal>)[k] = String(v);
                    }
                }
            });
            await updateDoc(ref, filtered);
        } catch (e) {
            console.error("Error updating goal: ", e);
        }
    };

    // 목표 삭제 
    const deleteGoal = async (id: string, userId: string) => {
        if (!db || !userId) return;
        try {
            const ref = doc(db, `studies/${userId}/goals`, id);
            await deleteDoc(ref);
        } catch (e) {
            console.error("Error deleting goal: ", e);
        }
    };

    //목표 완료 토글
    const toggleGoalCompletion = async (goalId: string, userId: string) => {
        if (!db || !userId) return;
        try {
            const goalRef = doc(db, `studies/${userId}/goals`, goalId);
            const currentGoal = await getDoc(goalRef);
            if (currentGoal.exists()) {
                await updateDoc(goalRef, { completed: !currentGoal.data().completed });
            }
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const toggleParticipate = async (date: string, userId: string) => {
        if (!db || !activeUserId) return;
        try {
            const participateRef = doc(db, `studies/${activeUserId}/data/participate`);
            const prev = participate[date]?.[userId];
            const updatedParticipate = { ...participate };
            if (!participate[date]) updatedParticipate[date] = {};
            if (!prev) {
                // 없으면 추가 (참가)
                updatedParticipate[date][userId] = { present: true };
            } else {
                // 있으면 present만 토글
                updatedParticipate[date][userId] = {
                    ...prev,
                    present: !prev.present
                };
            }
            await setDoc(participateRef, updatedParticipate);
        } catch (e) {
            console.error("Error updating participate: ", e);
        }
    };
    //#endregion

    // 기존 participate 데이터에서 studyHours 동기화
    const syncStudyHoursFromParticipate = async () => {
        if (!db) return;
        
        try {
            for (const user of userList) {
                const participateRef = doc(db, `studies/${user.id}/data/participate`);
                const participateSnap = await getDoc(participateRef);
                
                if (participateSnap.exists()) {
                    const participateData = participateSnap.data();
                    
                    for (const [date, detail] of Object.entries(participateData)) {
                        const typedDetail = detail as { present: boolean; start?: string; end?: string };
                        
                        if (typedDetail.start && typedDetail.end && typedDetail.present) {
                            const startMinutes = timeStringToMinutes(typedDetail.start);
                            const endMinutes = timeStringToMinutes(typedDetail.end);
                            
                            if (endMinutes > startMinutes) {
                                const totalMinutes = endMinutes - startMinutes;
                                const hours = Math.floor(totalMinutes / 60);
                                const minutes = totalMinutes % 60;
                                
                                await updateStudyHours(date, user.id, hours, minutes);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error syncing study hours:', e);
        }
    };

    return {
        userList,
        goals,
        participate,
        studyHours,
        schedules,
        addSchedule,
        removeSchedule,
        updateSchedule,
        activeUserId,
        setActiveUserId,
        addUser,
        updateGoal,
        deleteGoal,
        removeUser,
        addGoal,
        toggleGoalCompletion,
        toggleParticipate,
        setParticipateDetail,
        removeParticipateForDate,
        setStudyHours: updateStudyHours,
        updateUser,
        syncStudyHoursFromParticipate, // 새로운 함수 추가
    };
};

export default useFirebaseState;
