import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = normalizeOptionalText(body.phone);
  const address = normalizeOptionalText(body.address);
  const avatarUrl = normalizeOptionalText(body.avatarUrl);

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ message: "Họ tên phải từ 2 đến 80 ký tự." }, { status: 400 });
  }

  if (phone && !/^[0-9+\-\s().]{8,20}$/.test(phone)) {
    return NextResponse.json({ message: "Số điện thoại không hợp lệ." }, { status: 400 });
  }

  if (address && (address.length < 5 || address.length > 255)) {
    return NextResponse.json({ message: "Địa chỉ phải từ 5 đến 255 ký tự." }, { status: 400 });
  }

  if (avatarUrl && !/^https?:\/\/.+/i.test(avatarUrl) && !avatarUrl.startsWith("/")) {
    return NextResponse.json({ message: "Ảnh đại diện phải là URL hợp lệ." }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone,
      address,
      avatarUrl,
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

  return NextResponse.json({ user: updatedUser });
}
