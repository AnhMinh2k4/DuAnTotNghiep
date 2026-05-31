import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ReviewEligibility =
  | {
      status: "guest";
      canReview: false;
      message: string;
    }
  | {
      status: "not-purchased";
      canReview: false;
      message: string;
    }
  | {
      status: "eligible";
      canReview: true;
      message: string;
    };

type ReviewUser = {
  id: number;
  email: string;
} | null;

export async function getProductReviewEligibility(productId: number, user: ReviewUser): Promise<ReviewEligibility> {
  if (!user) {
    return {
      status: "guest",
      canReview: false,
      message: "Đăng nhập bằng tài khoản đã đặt hàng để đánh giá sản phẩm.",
    };
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        status: OrderStatus.COMPLETED,
        OR: [
          { userId: user.id },
          { customerEmail: user.email },
        ],
      },
    },
    select: {
      id: true,
    },
  });

  if (!purchased) {
    return {
      status: "not-purchased",
      canReview: false,
      message: "Bạn cần có đơn hàng đã hoàn thành chứa sản phẩm này mới được đánh giá.",
    };
  }

  return {
    status: "eligible",
    canReview: true,
    message: "Bạn có thể gửi hoặc cập nhật đánh giá cho sản phẩm này.",
  };
}
