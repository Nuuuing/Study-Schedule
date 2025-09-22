import { useState } from 'react';
import { UserDataT } from '@/modules/types';

export interface UseUsersReturnType {
  users: UserDataT[];
  addUser: (name: string) => Promise<void>;
  updateUser: (userId: string, data: Partial<UserDataT>) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
}

/**
 * 사용자 관리를 위한 커스텀 훅
 */
export const useUsers = (initialUsers: UserDataT[] = []): UseUsersReturnType => {
  const [users, setUsers] = useState<UserDataT[]>(initialUsers);

  const addUser = async (name: string) => {
    const newUser: UserDataT = {
      id: `user-${Date.now()}`,
      name,
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      icon: 'default'
    };
    
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (userId: string, data: Partial<UserDataT>) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, ...data } : user
      )
    );
  };

  const removeUser = async (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  return { users, addUser, updateUser, removeUser };
};

export default useUsers;