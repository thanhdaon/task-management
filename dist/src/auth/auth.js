import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase, } from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { sessions, users } from "../db/schema.js";
import { hashPassword } from "../auth/password.js";
export function generateSessionToken() {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}
export async function createSession(token, userId) {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await db.insert(sessions).values(session);
    return session;
}
export async function validateSessionToken(token) {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const result = await db
        .select({
        user: {
            id: users.id,
            role: users.role,
            username: users.username,
            createdAt: users.createdAt,
        },
        session: {
            id: sessions.id,
            userId: sessions.userId,
            expiresAt: sessions.expiresAt,
        },
    })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.id, sessionId));
    if (result.length < 1) {
        return { session: null, user: null };
    }
    const { user, session } = result[0];
    if (Date.now() >= session.expiresAt.getTime()) {
        await db.delete(sessions).where(eq(sessions.id, session.id));
        return { session: null, user: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db
            .update(sessions)
            .set({ expiresAt: session.expiresAt })
            .where(eq(sessions.id, session.id));
    }
    return { session, user };
}
export async function invalidateSession(sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
}
export async function createUser(username, password, role) {
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
        .insert(users)
        .values({ username, password: hashedPassword, role })
        .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
    });
    return newUser;
}
export async function getUserPasswordHash(username) {
    const found = await db.query.users.findFirst({
        where: eq(users.username, username),
        columns: {
            password: true,
        },
    });
    if (found) {
        return found.password;
    }
    throw new Error(`user ${username} not found`);
}
export async function getUserById(userId) {
    const found = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
        },
    });
    if (found) {
        return found;
    }
    throw new Error(`user with id ${userId} not found`);
}
export async function getUserByUsername(username) {
    const found = await db.query.users.findFirst({
        where: eq(users.username, username),
        columns: {
            id: true,
            role: true,
            username: true,
            createdAt: true,
        },
    });
    return found;
}
export async function checkUsernameAvailability(username) {
    const count = await db.$count(users, eq(users.username, username));
    return count === 0;
}
