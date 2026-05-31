import { NextResponse } from "next/server";
import { CUSTOMER_SESSION_COOKIE, createCustomerSessionToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const phone = String(body.phone ?? "").trim();
  const address = String(body.address ?? "").trim();

  if (!name || !email || !password) {
    return NextResponse.json({ message: "Vui lòng nhập họ tên, email và mật khẩu." }, { status: 400 });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ message: "Email không hợp lệ." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ message: "Mat khau can toi thieu 6 ky tu." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Email nay da duoc su dung." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      phone: phone || null,
      address: address || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const response = NextResponse.json({ user });
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
