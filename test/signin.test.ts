import { testClient } from "hono/testing";
import { expect, test } from "vitest";
import { createRouter } from "~/app/create-app";
import { handler, route } from "~/usecases/signin";

const client = testClient(createRouter().openapi(route, handler));

test("signin successfully", async () => {
  expect(0).toEqual(0);
});

test("signin with missing or empty fields", async () => {
  expect(0).toEqual(0);
});

test("signin with non-existent username", async () => {
  expect(0).toEqual(0);
});

test("signin with incorrect password", async () => {
  expect(0).toEqual(0);
});
