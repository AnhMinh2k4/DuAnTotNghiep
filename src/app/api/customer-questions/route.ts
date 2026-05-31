import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json();
  const customerName = String(body.customerName ?? "").trim();
  const customerEmail = String(body.customerEmail ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!customerName || !customerEmail || !subject || !message) {
    return NextResponse.json({ message: "Vui lòng nhập đầy đủ họ tên, email, chủ đề và nội dung." }, { status: 400 });
  }

  if (!isEmail(customerEmail)) {
    return NextResponse.json({ message: "Email không hợp lệ." }, { status: 400 });
  }

  const question = await prisma.customerQuestion.create({
    data: {
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      subject,
      message,
    },
  });

  return NextResponse.json({ questionId: question.id });
}
