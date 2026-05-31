import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const subtotal = Number(body.subtotal ?? 0);

  if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ message: "Dữ liệu mã giảm giá không hợp lệ." }, { status: 400 });
  }

  const coupon = await prisma.coupon.findFirst({
    where: {
      code,
      isActive: true,
    },
  });
  const now = new Date();

  if (!coupon || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now)) {
    return NextResponse.json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn." }, { status: 404 });
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ message: "Mã giảm giá đã hết lượt sử dụng." }, { status: 409 });
  }

  if (coupon.minOrderTotal !== null && subtotal < coupon.minOrderTotal.toNumber()) {
    return NextResponse.json({ message: "Đơn hàng chưa đạt giá trị tối thiểu." }, { status: 409 });
  }

  const value = coupon.discountValue.toNumber();
  const discountTotal = coupon.discountType === "PERCENT" ? Math.round(subtotal * Math.min(value, 100) / 100) : value;

  return NextResponse.json({
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountTotal: Math.min(discountTotal, subtotal),
    },
  });
}
