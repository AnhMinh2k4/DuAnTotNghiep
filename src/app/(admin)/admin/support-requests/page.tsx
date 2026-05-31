import { Role } from "@prisma/client";
import { updateSupportRequest } from "@/app/(admin)/admin/actions";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  WARRANTY: "Bảo hành",
  RETURN: "Đổi trả",
};

const statusLabels: Record<string, string> = {
  OPEN: "Mới",
  PROCESSING: "Đang xử lý",
  RESOLVED: "Đã xử lý",
};

export default async function AdminSupportRequestsPage() {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);

  const requests = await prisma.supportRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: { id: true, status: true },
      },
    },
  });

  return (
    <main className="space-y-8">
      <div className="hm-surface flex flex-col justify-between gap-4 p-6 md:flex-row md:items-end">
        <div>
          <p className="hm-kicker">Hỗ trợ sau bán</p>
          <h1 className="hm-page-title mt-2">Bảo hành / đổi trả</h1>
          <p className="mt-2 text-sm text-ink/55 dark:text-ivory/65">Theo dõi yêu cầu khách gửi từ chi tiết đơn hàng.</p>
        </div>
        <p className="font-serif text-3xl text-copper">{requests.length}</p>
      </div>

      {requests.length === 0 ? (
        <div className="hm-surface flex flex-col items-center justify-center py-24 text-center text-ink/40 dark:text-ivory/50">
          <p className="font-serif text-3xl">Chưa có yêu cầu hỗ trợ.</p>
          <p className="mt-2 text-sm">Khi khách gửi bảo hành hoặc đổi trả, yêu cầu sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <section className="grid gap-5">
          {requests.map((request) => (
            <article key={request.id} className="hm-surface grid gap-5 p-6 xl:grid-cols-[1fr_360px]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-copper/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-copper">
                    {typeLabels[request.type]}
                  </span>
                  <span className="rounded-full bg-sage/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sage">
                    {statusLabels[request.status]}
                  </span>
                  <span className="text-xs text-ink/45 dark:text-ivory/55">{new Date(request.createdAt).toLocaleString("vi-VN")}</span>
                </div>
                <h2 className="mt-4 font-serif text-2xl">{request.subject}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/70 dark:text-ivory/75">{request.message}</p>
                <div className="mt-5 grid gap-2 text-sm text-ink/60 dark:text-ivory/65">
                  <p><span className="font-semibold text-ink dark:text-ivory">Khách:</span> {request.customerName}</p>
                  <p className="break-all"><span className="font-semibold text-ink dark:text-ivory">Email:</span> {request.customerEmail}</p>
                  <p><span className="font-semibold text-ink dark:text-ivory">SĐT:</span> {request.customerPhone || "Chưa có"}</p>
                  <p><span className="font-semibold text-ink dark:text-ivory">Đơn hàng:</span> {request.order ? `HM-${String(request.order.id).padStart(5, "0")} (${request.order.status})` : "Không gắn đơn"}</p>
                </div>
              </div>
              <form action={updateSupportRequest} className="rounded-2xl border border-ink/10 bg-porcelain p-4 dark:border-white/10 dark:bg-white/5">
                <input type="hidden" name="id" value={request.id} />
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Trạng thái</span>
                  <select name="status" defaultValue={request.status} className="hm-field h-11 bg-white dark:bg-white/10 dark:[color-scheme:dark]">
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="mt-4 block space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Ghi chú admin</span>
                  <textarea name="adminNote" defaultValue={request.adminNote ?? ""} rows={5} className="hm-field w-full p-3" placeholder="Hướng xử lý, hẹn lịch, kết quả kiểm tra..." />
                </label>
                <button className="hm-btn-primary mt-4 h-11 w-full">Lưu xử lý</button>
              </form>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
