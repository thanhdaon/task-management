import { createSession, generateSessionToken, Role, User } from "~/auth/auth";
import { hashPassword } from "~/auth/password";
import { db } from "~/db/db";
import { users } from "~/db/schema";

export function createSampleTask(assignee: User) {
  return {
    title: "task 1",
    assigneeId: assignee.id,
    dueDate: "2025-12-30T05:58:35.633Z",
  };
}

export function createInvalidTask(assignee: User) {
  return {
    title: "task 1",
    assigneeId: assignee.id,
    dueDate: "2021115-12-30",
  };
}

export async function seedEmployee() {
  return await seedUser("employee");
}

export async function seedEmployer() {
  return await seedUser("employer");
}

export async function seedUser(role: Role) {
  const correctPassword = "correct-password";
  const correctPasswordHashed = await hashPassword(correctPassword);

  const [user] = await db
    .insert(users)
    .values({
      username: "demo",
      password: correctPasswordHashed,
      role,
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
