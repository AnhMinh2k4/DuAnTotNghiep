import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateShippingFee } from "@/lib/shipping";
import type { CheckoutPayload } from "@/types/cart";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type NormalizedOrderItem = {
  productId: number;
  variantId: number | null;
  selectedOptions?: Record<string, string>;
  quantity: number;
};

function mergeDuplicateItems(items: NormalizedOrderItem[]) {
  const itemMap = new Map<string, NormalizedOrderItem>();

  for (const item of items) {
    const key = `${item.productId}:${item.variantId ?? "base"}`;
    const existing = itemMap.get(key);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      itemMap.set(key, { ...item });
    }
  }

  return [...itemMap.values()];
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CheckoutPayload;
  const currentUser = await getCurrentUser();

  if (!payload.customerName || !payload.customerEmail || !payload.customerPhone || !payload.shippingAddress) {
    return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin giao hàng." }, { status: 400 });
  }

  const provinceId = Number(payload.provinceId);
  if (!Number.isInteger(provinceId) || provinceId < 1) {
    return NextResponse.json({ message: "Vui lòng chọn tỉnh/thành giao hàng." }, { status: 400 });
  }

  if (!isEmail(payload.customerEmail)) {
    return NextResponse.json({ message: "Email không hợp lệ." }, { status: 400 });
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ message: "Giỏ hàng đang trống." }, { status: 400 });
  }

  const normalizedItems = payload.items.map((item) => ({
    productId: Number(item.productId),
    variantId: item.variantId ? Number(item.variantId) : null,
    selectedOptions: item.selectedOptions,
    quantity: Number(item.quantity),
  }));
  const paymentMethod = payload.paymentMethod === "BANK_TRANSFER" ? "BANK_TRANSFER" : "COD";

  if (normalizedItems.some((item) =>
    !Number.isInteger(item.productId) ||
    item.productId < 1 ||
    (item.variantId !== null && (!Number.isInteger(item.variantId) || item.variantId < 1)) ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1
  )) {
    return NextResponse.json({ message: "Dữ liệu giỏ hàng không hợp lệ." }, { status: 400 });
  }

  const mergedItems = mergeDuplicateItems(normalizedItems);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: { in: mergedItems.map((item) => item.productId) },
          isActive: true,
        },
        include: {
          variants: true,
        },
      });

      if (products.length !== new Set(mergedItems.map((item) => item.productId)).size) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const province = await tx.province.findUnique({
        where: { id: provinceId },
        select: { id: true },
      });

      if (!province) {
        throw new Error("PROVINCE_NOT_FOUND");
      }

      const productMap = new Map(products.map((product) => [product.id, product]));
      let subtotal = 0;
      let discountTotal = 0;
      let couponCode: string | null = null;

      const orderItems = mergedItems.map((item) => {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        const variant = item.variantId
          ? product.variants.find((candidate) => candidate.id === item.variantId && candidate.isActive)
          : null;

        if (item.variantId && !variant) {
          throw new Error("VARIANT_NOT_FOUND");
        }

        const availableStock = variant ? variant.stock : product.stock;
        if (availableStock < item.quantity) {
          throw new Error(`LOW_STOCK:${variant ? `${product.name} - ${variant.name}` : product.name}`);
        }

        const unitPrice = (product.salePrice ?? product.price).toNumber() + (variant?.priceDelta.toNumber() ?? 0);
        const total = unitPrice * item.quantity;
        subtotal += total;

        return {
          productId: product.id,
          variantId: variant?.id,
          name: variant ? `${product.name} - ${variant.name}` : product.name,
          sku: variant?.sku ?? product.sku,
          selectedOptions: variant?.options ?? item.selectedOptions ?? undefined,
          price: unitPrice,
          quantity: item.quantity,
          total,
        };
      });

      const shippingFee = await calculateShippingFee(provinceId, subtotal, tx);

      const normalizedCouponCode = String(payload.couponCode ?? "").trim().toUpperCase();
      if (normalizedCouponCode) {
        const coupon = await tx.coupon.findFirst({
          where: {
            code: normalizedCouponCode,
            isActive: true,
          },
        });
        const now = new Date();

        if (!coupon || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now)) {
          throw new Error("COUPON_INVALID");
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw new Error("COUPON_INVALID");
        }

        if (coupon.minOrderTotal !== null && subtotal < coupon.minOrderTotal.toNumber()) {
          throw new Error("COUPON_MIN_TOTAL");
        }

        const value = coupon.discountValue.toNumber();
        discountTotal = coupon.discountType === "PERCENT" ? Math.round(subtotal * Math.min(value, 100) / 100) : value;
        discountTotal = Math.min(discountTotal, subtotal);
        couponCode = coupon.code;

        if (coupon.usageLimit !== null) {
          const result = await tx.coupon.updateMany({
            where: {
              id: coupon.id,
              usedCount: { lt: coupon.usageLimit },
            },
            data: { usedCount: { increment: 1 } },
          });

          if (result.count !== 1) {
            throw new Error("COUPON_INVALID");
          }
        } else {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          ...(currentUser ? { userId: currentUser.id } : {}),
          provinceId,
          customerName: payload.customerName,
          customerEmail: payload.customerEmail,
          customerPhone: payload.customerPhone,
          shippingAddress: payload.shippingAddress,
          note: [
            payload.note,
            paymentMethod === "BANK_TRANSFER" ? "Thanh toán điện tử demo: đã ghi nhận giao dịch sandbox." : "",
          ].filter(Boolean).join("\n") || null,
          paymentStatus: paymentMethod === "BANK_TRANSFER" ? "PAID" : "UNPAID",
          subtotal,
          shippingFee,
          discountTotal,
          couponCode,
          total: subtotal + shippingFee - discountTotal,
          items: {
            create: orderItems,
          },
          statusHistory: {
            create: {
              nextStatus: "PENDING",
              note: "Đơn hàng được tạo từ checkout.",
            },
          },
        },
      });

      for (const item of mergedItems) {
        if (item.variantId) {
          const result = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });

          if (result.count !== 1) {
            throw new Error("LOW_STOCK");
          }
        } else {
          const result = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });

          if (result.count !== 1) {
            throw new Error("LOW_STOCK");
          }
        }
      }

      return createdOrder;
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("LOW_STOCK:")) {
      return NextResponse.json({ message: `Sản phẩm sắp hết hàng: ${error.message.replace("LOW_STOCK:", "")}` }, { status: 409 });
    }

    if (error instanceof Error && error.message === "LOW_STOCK") {
      return NextResponse.json({ message: "Sản phẩm trong giỏ vừa hết hàng. Vui lòng kiểm tra lại giỏ hàng." }, { status: 409 });
    }

    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ message: "Một sản phẩm trong giỏ hàng không còn tồn tại." }, { status: 404 });
    }

    if (error instanceof Error && error.message === "PROVINCE_NOT_FOUND") {
      return NextResponse.json({ message: "Tỉnh/thành giao hàng không được hỗ trợ." }, { status: 400 });
    }

    if (error instanceof Error && error.message === "VARIANT_NOT_FOUND") {
      return NextResponse.json({ message: "Biến thể sản phẩm không còn tồn tại." }, { status: 404 });
    }

    if (error instanceof Error && error.message === "COUPON_INVALID") {
      return NextResponse.json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn." }, { status: 400 });
    }

    if (error instanceof Error && error.message === "COUPON_MIN_TOTAL") {
      return NextResponse.json({ message: "Đơn hàng chưa đạt giá trị tối thiểu để dùng mã giảm giá." }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ message: "Không thể tạo đơn hàng." }, { status: 500 });
  }
}
