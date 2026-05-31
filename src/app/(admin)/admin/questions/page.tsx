import { Role } from "@prisma/client";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuestionSearchPanel } from "@/components/admin/question-search-panel";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);

  const questions = await prisma.customerQuestion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="space-y-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="hm-page-title tracking-tight">Hỗ trợ khách hàng</h1>
          <p className="mt-3 text-ink/40 dark:text-ivory/60">Quản lý và phản hồi các thắc mắc, ý kiến từ khách hàng.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="hm-surface border-emerald-900/15 bg-emerald-900/10 px-6 py-3 dark:border-sage/20 dark:bg-sage/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/70 dark:text-sage">Chờ xử lý</p>
              <p className="mt-1 font-serif text-xl text-emerald-950 dark:text-sage">{questions.filter(q => !q.isResolved).length} yêu cầu</p>
           </div>
        </div>
      </div>

      <QuestionSearchPanel
        questions={questions.map((question) => ({
          id: question.id,
          customerName: question.customerName,
          customerEmail: question.customerEmail,
          customerPhone: question.customerPhone,
          subject: question.subject,
          message: question.message,
          isResolved: question.isResolved,
          createdAt: question.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
