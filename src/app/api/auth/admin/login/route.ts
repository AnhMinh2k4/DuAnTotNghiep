import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { ADMIN_ROLES, ADMIN_SESSION_COOKIE, createAdminSessionToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ message: "Vui lòng nhập email và mật khẩu." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ message: "Email hoặc mật khẩu không đúng." }, { status: 401 });
  }

  if (!ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json(
      { message: "Tài khoản này không có quyền truy cập CMS. Vui lòng sử dụng tài khoản quản trị được cấp quyền." },
      { status: 403 },
    );
  }

  if (!user.isActive) {
    return NextResponse.json(
      { message: "Tài khoản quản trị của bạn đã bị chặn. Vui lòng liên hệ quản trị viên để được hỗ trợ." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken(user.id, user.role as Role),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
