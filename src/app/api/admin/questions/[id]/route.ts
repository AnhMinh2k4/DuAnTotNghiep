import { NextResponse } from "next/server";
import { canManageOperations, getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminQuestionRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: AdminQuestionRouteProps) {
  const user = await getAdminSession();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!canManageOperations(user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const questionId = Number(id);
  const body = await request.json();

  if (!Number.isInteger(questionId) || questionId < 1) {
    return NextResponse.json({ message: "Mã câu hỏi không hợp lệ." }, { status: 400 });
  }

  const question = await prisma.customerQuestion.update({
    where: { id: questionId },
    data: {
      isResolved: Boolean(body.isResolved),
    },
  });

  return NextResponse.json({ question });
}
