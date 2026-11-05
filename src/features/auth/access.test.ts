import assert from "node:assert/strict";
import test from "node:test";
import { canAccess, normalizeRole, safeReturnTo } from "./access";

test("unknown or missing role never grants staff access", () => {
  for (const role of [undefined, null, "owner", "ADMIN", { role: "admin" }]) {
    assert.equal(normalizeRole(role), "buyer");
    assert.equal(canAccess(role, ["consultant", "admin"]), false);
  }
});

test("consultants cannot access admin-only pages", () => {
  assert.equal(canAccess("buyer", ["admin"]), false);
  assert.equal(canAccess("consultant", ["admin"]), false);
  assert.equal(canAccess("admin", ["admin"]), true);
  assert.equal(canAccess("consultant", ["consultant", "admin"]), true);
});

test("return targets are restricted to known local routes", () => {
  for (const value of [
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/api/auth/sign-out",
    ["/admin"],
    undefined,
  ]) {
    assert.equal(safeReturnTo(value), "/account");
  }
  assert.equal(safeReturnTo("/book"), "/book");
});

import { authErrorMessage } from "./error-message";

test("rate limiting and unavailability have distinct user feedback", () => {
  assert.match(authErrorMessage(429, false), /Too many attempts/);
  assert.match(authErrorMessage(429, true), /Too many attempts/);
  assert.match(authErrorMessage(503, false), /temporarily unavailable/);
  assert.match(authErrorMessage(401, false), /email\/password/);
});
