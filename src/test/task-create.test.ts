import { expect, test } from "vitest";
import { createSecureRouter } from "~/app/create-app";
import { FORBIDDEN } from "~/app/http-status-codes";
import { handler, route } from "~/usecases/task-create";
import { createSampleTask, seedEmployee, seedSession } from "~/test/helpers";

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
