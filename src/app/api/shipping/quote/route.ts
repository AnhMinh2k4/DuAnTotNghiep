import { NextResponse } from "next/server";
import { calculateShippingFee } from "@/lib/shipping";

export async function POST(request: Request) {
  const body = await request.json();
  const provinceId = Number(body.provinceId ?? 0);
  const subtotal = Number(body.subtotal ?? 0);

  if (!Number.isInteger(provinceId) || provinceId < 1 || !Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ message: "Dữ liệu tính phí vận chuyển không hợp lệ." }, { status: 400 });
  }

  const shippingFee = await calculateShippingFee(provinceId, subtotal);
  return NextResponse.json({ shippingFee });
}
