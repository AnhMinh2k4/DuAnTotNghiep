import { NextResponse, type NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "hm_admin_session";
const CATALOG_PATHS = ["/admin/products", "/admin/categories", "/admin/coupons", "/admin/shipping"];
const SUPER_ADMIN_PATHS = ["/admin/users", "/admin/settings"];
const CATALOG_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

function decodeAdminRole(token?: string) {
  if (!token) {
    return null;
  }

  const [body] = token.split(".");
  if (!body) {
    return null;
  }

  try {
    const normalized = body.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { role?: string; scope?: string; exp?: number };

    if (payload.scope !== "admin" || !payload.role || !payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload.role;
  } catch {
    return null;
  }
}

function matchesAnyPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = decodeAdminRole(sessionToken);
  const isCatalogPath = matchesAnyPath(pathname, CATALOG_PATHS);
  const isSuperAdminPath = matchesAnyPath(pathname, SUPER_ADMIN_PATHS);

  if ((isCatalogPath && !CATALOG_ROLES.has(role ?? "")) || (isSuperAdminPath && role !== "SUPER_ADMIN")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
