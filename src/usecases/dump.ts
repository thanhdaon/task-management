import { db } from "~/db/db";

export async function dump() {
  return await db.query.users.findMany();
}
