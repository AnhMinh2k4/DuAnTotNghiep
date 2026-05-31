import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "hm_admin_session";
export const CUSTOMER_SESSION_COOKIE = "hm_customer_session";

const scrypt = promisify(scryptCallback);
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const CUSTOMER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: number;
  role: Role;
  exp: number;
  scope: "admin" | "customer";
};

export const ADMIN_ROLES = [Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN] as const;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "hoang-minh-dev-session-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function legacyHashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (passwordHash.startsWith("scrypt$")) {
    const [, salt, storedHash] = passwordHash.split("$");
    if (!salt || !storedHash) {
      return false;
    }

    const derived = (await scrypt(password, salt, 64)) as Buffer;
    const stored = Buffer.from(storedHash, "base64url");
    return stored.length === derived.length && timingSafeEqual(stored, derived);
  }

  return passwordHash === legacyHashPassword(password);
}

function createSessionToken(userId: number, role: Role, scope: SessionPayload["scope"], ttlMs: number) {
  const payload: SessionPayload = {
    userId,
    role,
    scope,
    exp: Date.now() + ttlMs,
  };
  const body = toBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", getSessionSecret()).update(body).digest("base64url");

  return `${body}.${signature}`;
}

export function createAdminSessionToken(userId: number, role: Role = Role.ADMIN) {
  return createSessionToken(userId, role, "admin", SESSION_TTL_MS);
}

export function createCustomerSessionToken(userId: number) {
  return createSessionToken(userId, Role.CUSTOMER, "customer", CUSTOMER_SESSION_TTL_MS);
}

export function verifySessionToken(token?: string, scope?: SessionPayload["scope"]) {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = createHmac("sha256", getSessionSecret()).update(body).digest("base64url");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;
    if (payload.exp < Date.now() || (scope && payload.scope !== scope)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminSessionToken(token?: string) {
  return verifySessionToken(token, "admin");
}

export async function getAdminSession() {
  noStore();
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value, "admin");

  if (!payload || !ADMIN_ROLES.includes(payload.role as (typeof ADMIN_ROLES)[number])) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      role: { in: [...ADMIN_ROLES] },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return user;
}

export async function getCurrentUser() {
  noStore();
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value, "customer");

  if (!payload) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id: payload.userId,
      role: Role.CUSTOMER,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      phone: true,
      address: true,
      role: true,
      isActive: true,
    },
  });
}

export async function requireAdminSession() {
  const user = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function requireAdminRole(roles: readonly Role[]) {
  const user = await requireAdminSession();

  if (!roles.includes(user.role)) {
    redirect("/admin");
  }

  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function canManageCatalog(role: Role) {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

export function canManageUsers(role: Role) {
  return role === Role.SUPER_ADMIN;
}

export function canManageOperations(role: Role) {
  return role === Role.STAFF || role === Role.ADMIN || role === Role.SUPER_ADMIN;
}
