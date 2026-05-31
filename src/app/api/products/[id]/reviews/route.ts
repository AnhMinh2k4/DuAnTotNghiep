import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getProductReviewEligibility } from "@/lib/reviews";

type ProductReviewRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: ProductReviewRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Vui lòng đăng nhập để đánh giá." }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);
  const body = await request.json();
  const rating = Number(body.rating);
  const comment = String(body.comment ?? "").trim();

  if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Dữ liệu đánh giá không hợp lệ." }, { status: 400 });
  }

  const eligibility = await getProductReviewEligibility(productId, user);

  if (!eligibility.canReview) {
    return NextResponse.json({ message: eligibility.message }, { status: 403 });
  }

  const review = await prisma.review.upsert({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
    update: {
      rating,
      comment: comment || null,
      isVisible: true,
    },
    create: {
      userId: user.id,
      productId,
      rating,
      comment: comment || null,
    },
  });

  revalidateTag(CATALOG_CACHE_TAG);
  return NextResponse.json({ review });
}
