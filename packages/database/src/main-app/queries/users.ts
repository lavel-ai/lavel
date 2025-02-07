import { db } from '../db';
import { users } from '../schema/users-schema';
import { eq } from 'drizzle-orm';   

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

