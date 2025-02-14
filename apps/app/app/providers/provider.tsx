// packages/database/src/tenant-app/provider.tsx
"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getTenantConnection } from '@repo/database/src/tenant-app/tenant-connection-db'; // Import connection helper
import { getTenantIdentifier } from '../utils/tenant-identifier'; // Import identifier function
//import { getTenantConnectionUrl } from './queries/tenant-lookup'; // Import for connection url No Longer needed
import type { DrizzleClient } from '@repo/database/src/tenant-app/tenant-connection-db';
import * as schema from '@repo/database/src/tenant-app/schema';
import { createTenantConnection } from '@repo/database/src/tenant-app/tenant-connection-db';
import { getTenantConnectionUrlAction } from '../actions/users/tenant-actions'; //NEW IMPORT

type TenantDBContextType = {
  dbClient: DrizzleClient | null; // Drizzle client, or null if not yet loaded/error
  isLoading: boolean; // Indicates if the database is loading
  error: Error | null;   // Stores any error that occurred
};

const TenantDBContext = createContext<TenantDBContextType | undefined>(
  undefined
);

type TenantDBProviderProps = {
  children: ReactNode;
};

export const TenantDBProvider = ({ children }: TenantDBProviderProps) => {
  const [dbClient, setDbClient] = useState<DrizzleClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const setupTenantDb = async () => { // Make this an async function
      try {
        setIsLoading(true);
        const identifier = await getTenantIdentifier(); // AWAIT the identifier
        // If it is the main domain, do nothing, no tenant to setup.
        if (identifier === "") {
          setIsLoading(false);
          return;
        }

        const connectionUrl = await getTenantConnectionUrlAction(identifier); // Call the *server action*

        if (!connectionUrl) {
          throw new Error(`No connection URL found for tenant: ${identifier}`);
        }
        const tenantDb = createTenantConnection(connectionUrl);
        setDbClient(tenantDb);

      } catch (error: any) {
        setError(error);
        console.error('Error setting up tenant DB:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupTenantDb(); // Call the async function
  }, []); // Empty dependency array: run only once on mount

  if (isLoading) {
    return <div>Loading tenant database...</div>; // Or a better loading indicator
  }

  if (error) {
    return <div>Error: {error.message}</div>; // Or a more user-friendly error message
  }

    //If the DB client is null, don't render the context
  if(!dbClient) return <>{children}</>

  return (
    <TenantDBContext.Provider value={{ dbClient, isLoading, error }}>
      {children}
    </TenantDBContext.Provider>
  );
};

// Custom hook to access the tenant DB client
export const useTenantDB = () => {
  const context = useContext(TenantDBContext);
  if (!context) {
    throw new Error('useTenantDB must be used within a TenantDBProvider');
  }
   if (!context.dbClient) {
    throw new Error('useTenantDB was used in a place without a valid DB context');
  }
  return context.dbClient;
};