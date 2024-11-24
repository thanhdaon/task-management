import { seed } from "drizzle-seed";
import { testClient } from "hono/testing";
import { expect, test } from "vitest";
import { createRouter } from "~/app/create-app";
import { BAD_REQUEST, OK } from "~/app/http-status-codes";
import { hashPassword } from "~/auth/password";
import { db } from "~/db/db";
import { users } from "~/db/schema";
import { handler, route } from "~/usecases/signin";

const client = testClient(createRouter().openapi(route, handler));

test("signin successfully", async () => {
  const { user, correctPassword } = await seedUser();

  const response = await client.api.auth.signin.$post({
    json: {
      username: user.username,
      password: correctPassword,
    },
  });

  if (response.status !== OK) {
    expect.fail("incorrect status");
  }

  expect(response.headers.getSetCookie()).toBeDefined();
  const json = await response.json();
  expect(json.data.id).toEqual(user.id);
  expect(json.data.username).toEqual(user.username);
  expect(json.data.role).toEqual(user.role);
});

test("signin with missing username", async () => {
  const response = await client.api.auth.signin.$post({
    json: {
      username: "",
      password: "dump-password",
    },
  });

  if (response.status !== BAD_REQUEST) {
    expect.fail("incorrect status");
  }

  const json = await response.json();
  expect(json.error.length).gt(0);
});

test("signin with non-existent username", async () => {
  const response = await client.api.auth.signin.$post({
    json: {
      username: "not-found-username",
      password: "dump-password",
    },
  });

  if (response.status !== BAD_REQUEST) {
    expect.fail("incorrect status");
  }

  const json = await response.json();
  expect(json.error.length).gt(0);
});

test("signin with incorrect password", async () => {
  const { user, correctPassword } = await seedUser();

  const response = await client.api.auth.signin.$post({
    json: {
      username: user.username,
      password: correctPassword + "dump",
    },
  });

  if (response.status !== BAD_REQUEST) {
    expect.fail("incorrect status");
  }

  const json = await response.json();
  expect(json.code).toEqual(BAD_REQUEST);
  expect(json.error.length).gt(0);
});

async function seedUser() {
  const correctPassword = "correct-password";
  const correctPasswordHashed = await hashPassword(correctPassword);

  await seed(db as any, { users }).refine((f) => ({
    users: {
      count: 1,
      columns: {
        password: f.default({ defaultValue: correctPasswordHashed }),
      },
    },
  }));

  const user = await db.query.users.findFirst();

  if (user === undefined) {
    expect.fail("setup seed data for test incorrect");
  }

  return { user, correctPassword };
}
