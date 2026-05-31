import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CancelOrderRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, { params }: CancelOrderRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId < 1) {
    return NextResponse.json({ message: "Mã đơn hàng không hợp lệ." }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where: {
          id: orderId,
          userId: user.id,
        },
        include: {
          items: true,
        },
      });

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      if (existing.status !== "PENDING") {
        throw new Error("INVALID_STATUS");
      }

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

      const order = await tx.order.update({
        where: { id: existing.id },
        data: {
          status: "CANCELLED",
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: existing.id,
          previousStatus: existing.status,
          nextStatus: "CANCELLED",
          note: "Khách hàng hủy đơn khi đơn còn chờ xác nhận.",
        },
      });

      return order;
    });

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ message: "Không tìm thấy đơn hàng." }, { status: 404 });
    }

    if (error instanceof Error && error.message === "INVALID_STATUS") {
      return NextResponse.json({ message: "Chỉ có thể hủy đơn đang chờ xác nhận." }, { status: 409 });
    }

    console.error(error);
    return NextResponse.json({ message: "Không thể hủy đơn hàng." }, { status: 500 });
  }
}
