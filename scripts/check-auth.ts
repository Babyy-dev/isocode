import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { getAuth } from "../src/features/auth/server";
import {
  closeMongo,
  connectMongo,
  databaseName,
} from "../src/lib/mongodb/client";

async function checkAuth() {
  const email = `auth-check-${randomUUID()}@example.invalid`;
  const password = randomBytes(24).toString("hex");
  const auth = await getAuth();
  const origin = process.env.BETTER_AUTH_URL!;
  const database = (await connectMongo()).db(databaseName());
  let cookie = "";

  async function request(path: string, body?: object) {
    const response = await auth.handler(
      new Request(`${origin}/api/auth/${path}`, {
        method: body ? "POST" : "GET",
        headers: { origin, "content-type": "application/json", cookie },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
    );
    return response;
  }

  try {
    const signup = await request("sign-up/email", {
      email,
      password,
      name: "Synthetic auth check",
      role: "admin",
    });
    assert.equal(signup.status, 200, "Signup failed");
    cookie = signup.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    assert.ok(cookie, "Missing session cookie");
    const session = await (await request("get-session")).json();
    assert.equal(
      session.user.role,
      "buyer",
      "Signup must not grant requested admin role",
    );
    const update = await request("update-user", {
      role: "admin",
      name: "Synthetic auth check",
    });
    assert.ok(update.status < 500, "Profile update server error");
    const updated = await (await request("get-session")).json();
    assert.equal(
      updated.user.role,
      "buyer",
      "Profile update must not grant admin role",
    );
    assert.equal((await request("sign-out", {})).status, 200);
    assert.equal(
      await (await request("get-session")).json(),
      null,
      "Session should be revoked",
    );
    cookie = "";
    assert.equal(
      (await request("sign-in/email", { email, password })).status,
      200,
    );
    console.info(
      "Live auth passed: signup, stored session, role escalation rejection, sign-out revocation and sign-in.",
    );
  } finally {
    // Remove only this run's uniquely named, synthetic test identity and its records.
    const user = await database.collection("user").findOne({ email });
    if (user) {
      await database.collection("session").deleteMany({ userId: user._id });
      await database.collection("account").deleteMany({ userId: user._id });
      await database.collection("user").deleteOne({ _id: user._id, email });
    }
  }
}

checkAuth()
  .catch(() => {
    console.error(
      "Auth check failed. Check configuration; credentials and response bodies were not logged.",
    );
    process.exitCode = 1;
  })
  .finally(closeMongo);
