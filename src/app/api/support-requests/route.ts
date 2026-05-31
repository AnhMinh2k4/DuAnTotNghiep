import { NextResponse } from "next/server";
import { SupportRequestType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = await request.json();
  const type = String(body.type ?? "");
  const orderId = body.orderId ? Number(body.orderId) : null;
  const customerName = String(body.customerName ?? user?.name ?? "").trim();
  const customerEmail = String(body.customerEmail ?? user?.email ?? "").trim();
  const customerPhone = String(body.customerPhone ?? user?.phone ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (type !== SupportRequestType.WARRANTY && type !== SupportRequestType.RETURN) {
    return NextResponse.json({ message: "Vui lòng chọn loại yêu cầu hợp lệ." }, { status: 400 });
  }

  if (orderId !== null && (!Number.isInteger(orderId) || orderId < 1)) {
    return NextResponse.json({ message: "Mã đơn hàng không hợp lệ." }, { status: 400 });
  }

  if (!customerName || !customerEmail || !subject || !message) {
    return NextResponse.json({ message: "Vui lòng nhập đầy đủ họ tên, email, tiêu đề và nội dung." }, { status: 400 });
  }

  if (!isEmail(customerEmail)) {
    return NextResponse.json({ message: "Email không hợp lệ." }, { status: 400 });
  }

  if (orderId && user) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Không tìm thấy đơn hàng thuộc tài khoản của bạn." }, { status: 404 });
    }
  }

  if (orderId && !user) {
    const contactMatches = [
      { customerEmail },
      ...(customerPhone ? [{ customerPhone }] : []),
    ];
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: contactMatches,
      },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Thông tin liên hệ không khớp với đơn hàng cần hỗ trợ." }, { status: 404 });
    }
  }

  const supportRequest = await prisma.supportRequest.create({
    data: {
      type,
      orderId,
      userId: user?.id,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      subject,
      message,
    },
  });

  return NextResponse.json({ requestId: supportRequest.id });
}
