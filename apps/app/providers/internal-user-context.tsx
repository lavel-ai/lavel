'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useUser } from '@repo/auth/client';
import { findUserByClerkId } from '@repo/database/src/tenant-app/queries/users-queries';
import { getTenantDbClient } from '@/app/utils/get-tenant-db-connection';
// import type { NextRequest } from 'next/server'; // No longer needed

interface InternalUserContextType {
  internalUserId: string | null;
  isLoading: boolean;
  refetchInternalUser: () => Promise<void>;
  error: string | null;
}

const InternalUserContext = createContext<
  InternalUserContextType | undefined
>(undefined);

export const InternalUserProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInternalUser = async () => {
    if (isClerkLoaded && user) {
      setIsLoading(true);
      setError(null);
      try {
        // Create the mock request object HERE:
        const req = { headers: { get: (key: string) => {
            if (key === 'host') { return 'dummy-host'; }
            return null;
        }}} as any;
        const tenantDb = await getTenantDbClient(req);
        const foundUser = await findUserByClerkId(tenantDb, user.id);
        if (foundUser) {
          setInternalUserId(foundUser.id);
        } else {
          setInternalUserId(null);
          setError('User not found in tenant database.');
        }
      } catch (error: any) {
        console.error('Failed to fetch internal user:', error);
        setInternalUserId(null);
        setError(error.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setInternalUserId(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInternalUser();
  }, [isClerkLoaded, user]);

  const refetchInternalUser = async () => {
    await fetchInternalUser();
  };

  return (
    <InternalUserContext.Provider
      value={{ internalUserId, isLoading, refetchInternalUser, error }}
    >
      {children}
    </InternalUserContext.Provider>
  );
};

export const useInternalUser = () => {
  const context = useContext(InternalUserContext);
  if (context === undefined) {
    throw new Error(
      'useInternalUser must be used within an InternalUserProvider'
    );
  }
  return context;
}; 