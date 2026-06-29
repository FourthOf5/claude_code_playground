// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const { createSession, getSession } = await import("../auth");

const makeToken = async (overrides: Record<string, unknown> = {}, expiry = "7d") => {
  const { SignJWT } = await import("jose");
  return new SignJWT({
    userId: "user-1",
    email: "a@b.com",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ...overrides,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiry)
    .setIssuedAt()
    .sign(TEST_SECRET);
};

const TEST_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  vi.clearAllMocks();
});

test("createSession sets an httpOnly auth-token cookie", async () => {
  await createSession("user-1", "a@b.com");

  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  const [name, , options] = mockCookieStore.set.mock.calls[0];
  expect(name).toBe("auth-token");
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("createSession cookie expires ~7 days from now", async () => {
  await createSession("user-1", "a@b.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const diff = options.expires.getTime() - Date.now();
  expect(diff).toBeGreaterThan(sevenDays - 5_000);
  expect(diff).toBeLessThan(sevenDays + 5_000);
});

test("createSession JWT payload contains userId and email", async () => {
  await createSession("user-42", "foo@bar.com");

  const [, token] = mockCookieStore.set.mock.calls[0];
  const { payload } = await jwtVerify(token, TEST_SECRET);
  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("foo@bar.com");
});

test("getSession returns null when no cookie is set", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  expect(await getSession()).toBeNull();
});

test("getSession returns the session payload for a valid token", async () => {
  const token = await makeToken({ userId: "user-7", email: "x@y.com" });
  mockCookieStore.get.mockReturnValue({ value: token });

  const session = await getSession();
  expect(session?.userId).toBe("user-7");
  expect(session?.email).toBe("x@y.com");
});

test("getSession returns null for a malformed token", async () => {
  mockCookieStore.get.mockReturnValue({ value: "not.a.jwt" });

  expect(await getSession()).toBeNull();
});

test("getSession returns null for an expired token", async () => {
  const token = await makeToken({}, "-1d");
  mockCookieStore.get.mockReturnValue({ value: token });

  expect(await getSession()).toBeNull();
});

test("getSession returns null for a token signed with a different secret", async () => {
  const { SignJWT } = await import("jose");
  const wrongSecret = new TextEncoder().encode("wrong-secret");
  const token = await new SignJWT({ userId: "u", email: "e@e.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(wrongSecret);
  mockCookieStore.get.mockReturnValue({ value: token });

  expect(await getSession()).toBeNull();
});
