import { createSession, generateSessionToken, User } from "~/auth/auth";
import { hashPassword } from "~/auth/password";
import { db } from "~/db/db";
import { users } from "~/db/schema";

export function createSampleTask(assignee: User) {
  return {
    title: "task 1",
    assignedId: assignee.id,
    dueDate: "2025-12-30T05:58:35.633Z",
  };
}

export async function seedEmployee() {
  const correctPassword = "correct-password";
  const correctPasswordHashed = await hashPassword(correctPassword);

  const [user] = await db
    .insert(users)
    .values({
      username: "demo",
      password: correctPasswordHashed,
      role: "employee",
    })
    .returning({
      id: users.id,
      role: users.role,
      username: users.username,
      createdAt: users.createdAt,
    });

  return { user, correctPassword };
}

export async function seedSession(user: User): Promise<string> {
  const sessionToken = generateSessionToken();
  await createSession(sessionToken, user.id);
  return sessionToken;
}
