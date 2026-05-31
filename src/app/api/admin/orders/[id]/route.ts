import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { getAdminSession, canManageOperations } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedStatuses = new Set<string>(Object.values(OrderStatus));
const allowedPaymentStatuses = new Set<string>(Object.values(PaymentStatus));

type AdminOrderRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: AdminOrderRouteProps) {
  const user = await getAdminSession();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!canManageOperations(user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const orderId = Number(id);
  const body = await request.json();
  const status = String(body.status ?? "");
  const paymentStatus = body.paymentStatus ? String(body.paymentStatus) : "";
  const shipperId = "shipperId" in body ? body.shipperId === null || body.shipperId === "" ? null : Number(body.shipperId) : undefined;
  const provinceId = "provinceId" in body ? body.provinceId === null || body.provinceId === "" ? null : Number(body.provinceId) : undefined;

  if (!Number.isInteger(orderId) || orderId < 1) {
    return NextResponse.json({ message: "Mã đơn hàng không hợp lệ." }, { status: 400 });
  }

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ message: "Trạng thái đơn hàng không hợp lệ." }, { status: 400 });
  }

  if (paymentStatus && !allowedPaymentStatuses.has(paymentStatus)) {
    return NextResponse.json({ message: "Trạng thái thanh toán không hợp lệ." }, { status: 400 });
  }

  if (shipperId !== undefined && shipperId !== null && (!Number.isInteger(shipperId) || shipperId < 1)) {
    return NextResponse.json({ message: "Đơn vị vận chuyển không hợp lệ." }, { status: 400 });
  }

  if (provinceId !== undefined && provinceId !== null && (!Number.isInteger(provinceId) || provinceId < 1)) {
    return NextResponse.json({ message: "Tỉnh/thành không hợp lệ." }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!existing) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (existing.status === OrderStatus.CANCELLED && status !== OrderStatus.CANCELLED) {
        throw new Error("CANCELLED_LOCKED");
      }

      const nextShipperId = shipperId === undefined ? existing.shipperId : shipperId;
      const nextProvinceId = provinceId === undefined ? existing.provinceId : provinceId;
      const deliveryChanged =
        (shipperId !== undefined && shipperId !== existing.shipperId) ||
        (provinceId !== undefined && provinceId !== existing.provinceId);
      const canEditDelivery = existing.status === OrderStatus.PENDING || existing.status === OrderStatus.CONFIRMED;

      if (deliveryChanged && !canEditDelivery) {
        throw new Error("DELIVERY_LOCKED");
      }

      if (status === OrderStatus.SHIPPING && (!nextShipperId || !nextProvinceId)) {
        throw new Error("DELIVERY_REQUIRED");
      }

      if (status === OrderStatus.CANCELLED && existing.status !== OrderStatus.CANCELLED) {
        for (const item of existing.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        if (existing.couponCode) {
          await tx.coupon.updateMany({
            where: { code: existing.couponCode, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: status as OrderStatus,
          paymentStatus: paymentStatus ? paymentStatus as PaymentStatus : status === "COMPLETED" ? "PAID" : undefined,
          shipperId: canEditDelivery ? shipperId : undefined,
          provinceId: canEditDelivery ? provinceId : undefined,
        },
      });

      if (existing.status !== updated.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            previousStatus: existing.status,
            nextStatus: updated.status,
            note: "Admin cập nhật trạng thái đơn hàng.",
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ message: "Không tìm thấy đơn hàng." }, { status: 404 });
    }

    if (error instanceof Error && error.message === "DELIVERY_LOCKED") {
      return NextResponse.json({ message: "Thông tin giao hàng đã khóa sau khi đơn được bàn giao." }, { status: 409 });
    }

    if (error instanceof Error && error.message === "DELIVERY_REQUIRED") {
      return NextResponse.json({ message: "Cần gán tỉnh/thành và shipper trước khi chuyển sang đang giao." }, { status: 400 });
    }

    if (error instanceof Error && error.message === "CANCELLED_LOCKED") {
      return NextResponse.json({ message: "Đơn đã hủy không thể chuyển lại sang trạng thái khác." }, { status: 409 });
    }

    console.error(error);
    return NextResponse.json({ message: "Không thể cập nhật đơn hàng." }, { status: 500 });
  }
}
