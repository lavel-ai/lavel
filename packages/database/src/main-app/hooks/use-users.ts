'use client';

import { useQuery } from '@tanstack/react-query';
import { findUserById, getAllUsers } from '../queries/users-queries';
import type { User } from '../schema/users-schema';

export const useUser = (userId: string) => {
  return useQuery<User | undefined>({
    queryKey: ['user', userId],
    queryFn: () => findUserById(userId),
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => getAllUsers(),
  });
};
