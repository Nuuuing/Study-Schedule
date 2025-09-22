import { useState } from 'react';
import { Goal } from '@/modules/types';

export interface UseGoalsReturnType {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, userId: string, data: Partial<Goal>) => void;
  deleteGoal: (goalId: string, userId: string) => Promise<void>;
  toggleGoalCompletion: (goalId: string, userId: string) => void;
}

/**
 * 목표 관리를 위한 커스텀 훅
 */
export const useGoals = (initialGoals: Goal[] = []): UseGoalsReturnType => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const addGoal = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (goalId: string, userId: string, data: Partial<Goal>) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId && goal.userId === userId
          ? { ...goal, ...data }
          : goal
      )
    );
  };

  const deleteGoal = async (goalId: string, userId: string) => {
    setGoals(prev => prev.filter(goal => !(goal.id === goalId && goal.userId === userId)));
  };

  const toggleGoalCompletion = (goalId: string, userId: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId && goal.userId === userId
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  };

  return { goals, addGoal, updateGoal, deleteGoal, toggleGoalCompletion };
};

export default useGoals;