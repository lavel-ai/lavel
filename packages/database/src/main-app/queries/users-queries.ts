import { db } from '../db';
import { users } from '../schema/users-schema';
import { eq } from 'drizzle-orm';

export const findUserById = async (userId: string) => {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
};

export const findUserByClerkId = async (clerkId: string) => {
  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    with: {
      organizations: {
        with: {
          organization: {
            with: {
              projects: {
                columns: {
                  connectionUrl: true
                }
              }
            }
          }
        }
      }
    }
  });
};

// Add the missing function that pool.ts needs
export const findUserWithOrg = async (userId: string) => {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      organizations: {
        with: {
          organization: true
        }
      }
    }
  });
};

export const getAllUsers = () => db.select().from(users);

export const findUserWithConnectionByClerkId = async (clerkId: string) => {
  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    with: {
      organizations: {
        with: {
          organization: {
            with: {
              projects: {
                columns: {
                  connectionUrl: true
                }
              }
            }
          }
        }
      }
    }
  });
}; 