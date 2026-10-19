import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import app from "../src/app.js";
import { query } from "../src/db/index.js";
import { initializeDatabase } from "../src/db/schema.js";
import { env } from "../src/env.js";

const password = "password123";

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

async function registerUser(name, email) {
  const response = await request(app).post("/api/v1/auth/register").send({
    name,
    email,
    password,
  });
  expect(response.status).toBe(201);
  return response.body;
}

describe("auth, teams, and tasks", () => {
  beforeAll(async () => {
    if (!env.DB_NAME.endsWith("_test")) {
      throw new Error(`Refusing to run against database "${env.DB_NAME}"`);
    }
    await initializeDatabase();
  });

  beforeEach(async () => {
    await query("TRUNCATE users RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await query("TRUNCATE users RESTART IDENTITY CASCADE");
  });

  it("registers the first user as admin and rejects a weak password", async () => {
    const weak = await request(app).post("/api/v1/auth/register").send({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    });
    expect(weak.status).toBe(400);

    const invalidEmail = await request(app).post("/api/v1/auth/register").send({
      name: "Ada",
      email: "not-an-email",
      password,
    });
    expect(invalidEmail.status).toBe(400);

    const first = await registerUser("Ada Lovelace", "ada@example.com");
    expect(first.user.isAdmin).toBe(true);
    expect(first.token).toEqual(expect.any(String));

    const duplicate = await request(app).post("/api/v1/auth/register").send({
      name: "Ada Again",
      email: "Ada@example.com",
      password,
    });
    expect(duplicate.status).toBe(409);

    const second = await registerUser("Grace Hopper", "grace@example.com");
    expect(second.user.isAdmin).toBe(false);
  });

  it("logs in with the right password and rejects the wrong one", async () => {
    await registerUser("Ada Lovelace", "ada@example.com");

    const wrong = await request(app).post("/api/v1/auth/login").send({
      email: "ada@example.com",
      password: "not-the-password",
    });
    expect(wrong.status).toBe(401);

    const right = await request(app).post("/api/v1/auth/login").send({
      email: "ada@example.com",
      password,
      rememberMe: true,
    });
    expect(right.status).toBe(200);
    expect(right.body.user.email).toBe("ada@example.com");
    expect(right.body.user.isAdmin).toBe(true);
  });

  it("hides another user's tasks until they share a team", async () => {
    const ada = await registerUser("Ada Lovelace", "ada@example.com");
    const grace = await registerUser("Grace Hopper", "grace@example.com");

    const team = await request(app)
      .post("/api/v1/teams")
      .set(auth(ada.token))
      .send({ name: "Compilers", description: "Language work" });
    expect(team.status).toBe(201);
    const teamId = team.body.team.id;

    const hidden = await request(app)
      .get(`/api/v1/teams/${teamId}`)
      .set(auth(grace.token));
    expect(hidden.status).toBe(403);

    const created = await request(app)
      .post("/api/v1/tasks")
      .set(auth(ada.token))
      .send({
        title: "  Write the parser  ",
        teamId,
        priority: "high",
        status: "todo",
      });
    expect(created.status).toBe(201);
    expect(created.body.task.title).toBe("Write the parser");
    const taskId = created.body.task.id;

    const outsiderRead = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set(auth(grace.token));
    expect(outsiderRead.status).toBe(404);

    const outsiderList = await request(app)
      .get(`/api/v1/tasks?teamId=${teamId}`)
      .set(auth(grace.token));
    expect(outsiderList.status).toBe(403);

    const allTasks = await request(app)
      .get("/api/v1/tasks?all=true")
      .set(auth(grace.token));
    expect(allTasks.status).toBe(403);

    const blank = await request(app)
      .post("/api/v1/tasks")
      .set(auth(ada.token))
      .send({ title: "   ", teamId });
    expect(blank.status).toBe(400);

    const outsiderAssignee = await request(app)
      .post("/api/v1/tasks")
      .set(auth(ada.token))
      .send({ title: "Review", teamId, assignedTo: "grace@example.com" });
    expect(outsiderAssignee.status).toBe(400);

    const joined = await request(app)
      .post(`/api/v1/teams/${teamId}/join`)
      .set(auth(grace.token));
    expect(joined.status).toBe(200);

    const visible = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set(auth(grace.token));
    expect(visible.status).toBe(200);
    expect(visible.body.task.title).toBe("Write the parser");

    const updated = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .set(auth(grace.token))
      .send({ status: "in-progress", assignedTo: grace.user.id });
    expect(updated.status).toBe(200);
    expect(updated.body.task.status).toBe("in-progress");
    expect(updated.body.task.assignedTo).toBe("Grace Hopper");

    const forbiddenDelete = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set(auth(grace.token));
    expect(forbiddenDelete.status).toBe(403);

    const deleted = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set(auth(ada.token));
    expect(deleted.status).toBe(200);
  });

  it("lets an admin list users and forbids everyone else", async () => {
    const ada = await registerUser("Ada Lovelace", "ada@example.com");
    const grace = await registerUser("Grace Hopper", "grace@example.com");

    const forbidden = await request(app)
      .get("/api/v1/users")
      .set(auth(grace.token));
    expect(forbidden.status).toBe(403);

    const forged = jwt.sign(
      { id: grace.user.id, email: grace.user.email, isAdmin: true },
      env.JWT_SECRET,
    );
    const forgedRequest = await request(app)
      .get("/api/v1/users")
      .set(auth(forged));
    expect(forgedRequest.status).toBe(403);

    const directory = await request(app)
      .get("/api/v1/users")
      .set(auth(ada.token));
    expect(directory.status).toBe(200);
    expect(directory.body.users.map((user) => user.email).sort()).toEqual([
      "ada@example.com",
      "grace@example.com",
    ]);

    const selfDelete = await request(app)
      .delete(`/api/v1/users/${ada.user.id}`)
      .set(auth(ada.token));
    expect(selfDelete.status).toBe(400);

    const removed = await request(app)
      .delete(`/api/v1/users/${grace.user.id}`)
      .set(auth(ada.token));
    expect(removed.status).toBe(200);

    const gone = await request(app)
      .get(`/api/v1/users/${grace.user.id}`)
      .set(auth(ada.token));
    expect(gone.status).toBe(404);
  });

  it("rejects requests without a token", async () => {
    const response = await request(app).get("/api/v1/tasks");
    expect(response.status).toBe(401);
  });
});
