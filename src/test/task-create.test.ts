import { expect, test } from "vitest";
import { createSecureRouter } from "~/app/create-app";
import { BAD_REQUEST, FORBIDDEN, OK } from "~/app/http-status-codes";
import { handler, route } from "~/usecases/task-create";
import {
  createInvalidTask,
  createSampleTask,
  seedEmployee,
  seedEmployer,
  seedSession,
} from "~/test/helpers";

const app = createSecureRouter().openapi(route, handler);

test("should return 403 FORBIDDEN if user is not an employer", async () => {
  const { user } = await seedEmployee();
  const sessionToken = await seedSession(user);

  const response = await app.request("/tasks", {
    method: "POST",
    body: JSON.stringify(createSampleTask(user)),
    headers: new Headers({
      "Content-Type": "application/json",
      Cookie: `session=${sessionToken}`,
    }),
  });

  expect(response.status).toBe(FORBIDDEN);
  const json = await response.json();
  expect(json.code).toBe(FORBIDDEN);
  expect(json.error).toBeDefined();
});

test("should create a new task and return 200 OK with task details", async () => {
  const { user } = await seedEmployer();
  const sessionToken = await seedSession(user);

  const newTask = createSampleTask(user);

  const response = await app.request("/tasks", {
    method: "POST",
    body: JSON.stringify(newTask),
    headers: new Headers({
      "Content-Type": "application/json",
      Cookie: `session=${sessionToken}`,
    }),
  });

  expect(response.status).toBe(OK);
  const json = await response.json();
  expect(json.code).toEqual(OK);
  expect(json.data.id).toBeDefined();
  expect(json.data.title).toEqual(newTask.title);
  expect(json.data.assigneeId).toEqual(newTask.assigneeId);
  expect(json.data.dueDate).toEqual(newTask.dueDate);
});

test("should return 400 BAD_REQUEST if request body is invalid", async () => {
  const { user } = await seedEmployer();
  const sessionToken = await seedSession(user);

  const response = await app.request("/tasks", {
    method: "POST",
    body: JSON.stringify(createInvalidTask(user)),
    headers: new Headers({
      "Content-Type": "application/json",
      Cookie: `session=${sessionToken}`,
    }),
  });

  expect(response.status).toBe(BAD_REQUEST);
  const json = await response.json();
  console.log(json);
  expect(json.code).toEqual(BAD_REQUEST);
  expect(json.error).toBeDefined();
});
