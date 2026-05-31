import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const user = await getAdminSession();

  if (user) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen bg-ink text-ivory lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden min-h-screen flex-col justify-between border-r border-ivory/10 bg-[linear-gradient(145deg,rgba(143,174,154,0.18),transparent_45%),#151515] p-10 lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-ivory font-serif text-lg text-ink">TS</span>
          <span className="font-serif text-3xl">TMDT Shop</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Admin workspace</p>
          <h1 className="mt-4 max-w-xl font-serif text-5xl leading-tight xl:text-6xl xl:leading-none">Quản trị rõ ràng, thao tác nhanh.</h1>
          <p className="mt-6 max-w-lg leading-7 text-ivory/65">Theo dõi đơn hàng, catalog, câu hỏi và người dùng trong một khu vực quản trị gọn gàng.</p>
        </div>
        <p className="text-sm text-ivory/45">Demo: admin@tmdtshop.local / admin123</p>
      </section>
      <section className="flex items-center px-5 py-12 md:px-8">
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </section>
    </main>
  );
}
