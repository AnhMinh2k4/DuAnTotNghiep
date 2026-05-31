import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { CUSTOMER_SESSION_COOKIE, createCustomerSessionToken, verifyPassword } from "@/lib/auth";
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
      role: Role.CUSTOMER,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ message: "Email hoặc mật khẩu không đúng." }, { status: 401 });
  }

  if (!user.isActive) {
    return NextResponse.json(
      {
        code: "ACCOUNT_LOCKED",
        message: "Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ TMDT Shop để được hỗ trợ mở lại tài khoản.",
      },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });

  response.cookies.set({
    name: CUSTOMER_SESSION_COOKIE,
    value: createCustomerSessionToken(user.id),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
