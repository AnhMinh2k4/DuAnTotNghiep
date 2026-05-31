import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function getSafeImageExtension(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return ".jpg";
  }

  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return ".png";
  }

  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return ".webp";
  }

  return null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Vui lòng chọn ảnh đại diện." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Tệp tải lên phải là hình ảnh." }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json({ message: "Ảnh đại diện tối đa 5MB." }, { status: 400 });
  }

  const originalExtension = extname(file.name).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(originalExtension)) {
    return NextResponse.json({ message: "Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WebP." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = getSafeImageExtension(bytes);
  if (!extension) {
    return NextResponse.json({ message: "Tệp tải lên không phải ảnh JPG, PNG hoặc WebP hợp lệ." }, { status: 400 });
  }

  const fileName = `${user.id}-${Date.now()}-${randomUUID()}${extension}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
  const uploadPath = join(uploadDir, fileName);
  const avatarUrl = `/uploads/avatars/${fileName}`;

  await mkdir(uploadDir, { recursive: true });
  await writeFile(uploadPath, bytes);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl },
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

  return NextResponse.json({ avatarUrl, user: updatedUser });
}
