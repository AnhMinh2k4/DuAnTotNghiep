import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ message: "Mật khẩu mới cần tối thiểu 6 ký tự." }, { status: 400 });
  }

  const savedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!savedUser || !(await verifyPassword(currentPassword, savedUser.passwordHash))) {
    return NextResponse.json({ message: "Mật khẩu hiện tại không đúng." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return NextResponse.json({ message: "Đã đổi mật khẩu." });
}
