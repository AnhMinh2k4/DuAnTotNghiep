import { Role, type Prisma } from "@prisma/client";
import { createAdminUser, deleteAdminUser, updateAdminUser, updateUserStatus } from "../actions";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PasswordField } from "@/components/common/password-field";
import { CheckCircle2, Edit, Save, ShieldAlert, ShieldCheck, ShoppingBag, Trash2, UserPlus, Users, XCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const roleConfig: Record<Role, { label: string; color: string; bg: string }> = {
  CUSTOMER: { label: "Khách hàng", color: "text-taupe", bg: "bg-taupe/10" },
  STAFF: { label: "Nhân viên", color: "text-sage", bg: "bg-sage/10" },
  ADMIN: { label: "Quản trị viên", color: "text-copper", bg: "bg-copper/10" },
  SUPER_ADMIN: { label: "Quản trị cao cấp", color: "text-ink", bg: "bg-ink/5" },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string; edit?: string; q?: string; role?: string; status?: string }>;
}) {
  const currentUser = await requireAdminRole([Role.SUPER_ADMIN]);
  const params = await searchParams;
  const isAdding = params.add === "true";
  const q = String(params.q ?? "").trim();
  const role = Object.values(Role).includes(params.role as Role) ? params.role as Role : "";
  const status = params.status === "active" || params.status === "locked" ? params.status : "";
  const where: Prisma.UserWhereInput = {
    role: role || undefined,
    isActive: status === "active" ? true : status === "locked" ? false : undefined,
    OR: q ? [
      { name: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
    ] : undefined,
  };

  const [users, allUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ role: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: {
            orders: true,
            questions: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      select: {
        role: true,
        isActive: true,
      },
    }),
  ]);
  const editingUser = params.edit ? users.find((user) => user.id === Number(params.edit)) : null;

  return (
    <main className="space-y-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="hm-page-title tracking-tight">Quản lý người dùng</h1>
          <p className="mt-3 text-ink/40 dark:text-ivory/60">Quản lý phân quyền, tài khoản nhân sự và danh sách khách hàng của hệ thống.</p>
        </div>
        <Link 
          href={isAdding ? "/admin/users" : "/admin/users?add=true"} 
          className={`hm-btn-primary hm-hover-glow w-full gap-3 px-8 sm:w-auto ${isAdding ? "bg-red-500 hover:bg-red-600" : ""}`}
        >
          {isAdding ? <XCircle size={20} /> : <UserPlus size={20} />}
          {isAdding ? "Hủy bỏ" : "Tạo tài khoản"}
        </Link>
      </div>

      {/* Create Form Section */}
      {isAdding && (
        <section className="hm-surface overflow-hidden animate-slide-up border-copper/20 ring-1 ring-copper/10">
          <div className="flex flex-col justify-between gap-3 border-b border-ink/5 bg-porcelain/50 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:flex-row sm:items-center sm:px-8 sm:py-6">
            <div className="flex items-center gap-3">
              <UserPlus className="text-copper" size={24} />
              <h2 className="font-serif text-2xl">Tạo người dùng mới</h2>
            </div>
            <Link href="/admin/users" className="text-xs font-bold uppercase tracking-widest text-ink/40 hover:text-ink dark:text-ivory/60 dark:hover:text-ivory">Đóng</Link>
          </div>
          <div className="p-5 sm:p-8 lg:p-12">
            <form action={createAdminUser} className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-copper">Thông tin định danh</p>
                <div className="grid gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Họ và tên *</label>
                     <input name="name" required placeholder="Nhập tên nhân sự..." className="hm-field w-full" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Địa chỉ Email *</label>
                     <input name="email" required type="email" placeholder="email@tmdtshop.vn" className="hm-field w-full" />
                   </div>
                   <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Mật khẩu *</label>
                        <PasswordField name="password" required minLength={6} placeholder="••••••••" inputClassName="hm-field w-full" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Vai trò hệ thống</label>
                        <select name="role" defaultValue={Role.STAFF} className="hm-field w-full appearance-none bg-white dark:bg-white/10 dark:[color-scheme:dark]">
                          <option value={Role.CUSTOMER}>Khách hàng (Customer)</option>
                          <option value={Role.STAFF}>Nhân viên (Staff)</option>
                          <option value={Role.ADMIN}>Quản trị viên (Admin)</option>
                        </select>
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-copper">Thông tin liên lạc</p>
                <div className="grid gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Số điện thoại</label>
                     <input name="phone" placeholder="0xxx xxx xxx" className="hm-field w-full" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Địa chỉ liên hệ</label>
                     <textarea name="address" placeholder="Nhập địa chỉ cư trú..." className="hm-field w-full min-h-[110px] py-4" />
                   </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-ink/5 pt-6 dark:border-white/10 lg:col-span-2">
                 <button className="hm-btn-primary hm-hover-glow h-16 w-full px-12 sm:w-auto">Xác nhận tạo tài khoản</button>
              </div>
            </form>
          </div>
        </section>
      )}

      {editingUser && (
        <section className="hm-surface overflow-hidden border-sage/20 ring-1 ring-sage/10">
          <div className="flex flex-col justify-between gap-3 border-b border-ink/5 bg-porcelain/50 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:flex-row sm:items-center sm:px-8 sm:py-6">
            <div className="flex items-center gap-3">
              <Edit className="text-sage" size={24} />
              <h2 className="font-serif text-2xl">Chỉnh sửa: {editingUser.name}</h2>
            </div>
            <Link href="/admin/users" className="text-xs font-bold uppercase tracking-widest text-ink/40 hover:text-ink dark:text-ivory/60 dark:hover:text-ivory">Đóng</Link>
          </div>
          <form action={updateAdminUser} className="grid gap-6 p-5 sm:p-8 lg:grid-cols-2 lg:p-12">
            <input type="hidden" name="id" value={editingUser.id} />
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Họ và tên *</label>
              <input name="name" required defaultValue={editingUser.name} className="hm-field w-full" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Email *</label>
              <input name="email" required type="email" defaultValue={editingUser.email} className="hm-field w-full" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Số điện thoại</label>
              <input name="phone" defaultValue={editingUser.phone ?? ""} className="hm-field w-full" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Vai trò</label>
              <select name="role" defaultValue={editingUser.role} disabled={editingUser.id === currentUser.id} className="hm-field w-full appearance-none bg-white dark:bg-white/10 dark:[color-scheme:dark] disabled:opacity-60">
                <option value={Role.CUSTOMER}>Khách hàng</option>
                <option value={Role.STAFF}>Nhân viên</option>
                <option value={Role.ADMIN}>Quản trị viên</option>
                <option value={Role.SUPER_ADMIN}>Quản trị cao cấp</option>
              </select>
              {editingUser.id === currentUser.id ? <input type="hidden" name="role" value={editingUser.role} /> : null}
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Địa chỉ</label>
              <textarea name="address" defaultValue={editingUser.address ?? ""} className="hm-field min-h-[110px] w-full py-4" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Mật khẩu mới</label>
              <PasswordField name="password" minLength={6} placeholder="Để trống nếu không đổi" inputClassName="hm-field w-full" />
            </div>
            <label className="flex items-center gap-3 self-end rounded-2xl border border-ink/5 bg-porcelain/50 p-4 dark:border-white/10 dark:bg-white/[0.06]">
              <input name="isActive" type="checkbox" defaultChecked={editingUser.isActive} disabled={editingUser.id === currentUser.id} className="size-4 accent-copper disabled:opacity-50" />
              <span className="text-sm font-bold text-ink/70 dark:text-ivory/75">Tài khoản đang hoạt động</span>
              {editingUser.id === currentUser.id ? <input type="hidden" name="isActive" value="on" /> : null}
            </label>
            <div className="flex justify-end border-t border-ink/5 pt-6 dark:border-white/10 lg:col-span-2">
              <button className="hm-btn-primary h-14 w-full gap-3 sm:w-auto">
                <Save size={18} />
                Lưu thay đổi
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Tổng người dùng", value: allUsers.length, icon: Users, color: "text-ink" },
          { label: "Nhân sự", value: allUsers.filter(u => u.role !== "CUSTOMER").length, icon: ShieldCheck, color: "text-copper" },
          { label: "Khách hàng", value: allUsers.filter(u => u.role === "CUSTOMER").length, icon: UserPlus, color: "text-sage" },
          { label: "Bị khóa", value: allUsers.filter(u => !u.isActive).length, icon: ShieldAlert, color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="hm-surface flex items-center gap-4 p-6">
            <div className={`grid size-12 shrink-0 place-items-center rounded-xl bg-porcelain dark:bg-white/10 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-ivory/55">{stat.label}</p>
              <p className="mt-1 font-serif text-2xl">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <form className="hm-surface grid gap-4 p-5 md:grid-cols-[1fr_220px_220px_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Tìm người dùng</span>
          <input name="q" defaultValue={q} placeholder="Tên, email hoặc số điện thoại..." className="hm-field h-11 w-full" />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Vai trò</span>
          <select name="role" defaultValue={role} className="hm-field h-11 bg-white dark:bg-white/10 dark:[color-scheme:dark]">
            <option value="">Tất cả</option>
            {Object.entries(roleConfig).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Trạng thái</span>
          <select name="status" defaultValue={status} className="hm-field h-11 bg-white dark:bg-white/10 dark:[color-scheme:dark]">
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Bị khóa</option>
          </select>
        </label>
        <button className="hm-btn-primary h-11 w-full md:w-auto">Lọc</button>
      </form>

      {/* User Table */}
      <section className="hm-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="hm-table min-w-[900px]">
            <thead>
              <tr className="bg-porcelain/50 dark:bg-white/[0.06]">
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th className="text-center">Đơn hàng</th>
                <th>Ngày gia nhập</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink/45 dark:text-ivory/55">
                    Không tìm thấy người dùng phù hợp. <Link href="/admin/users" className="font-bold text-copper">Xóa bộ lọc</Link>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="group hover:bg-porcelain/30 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-4">
                      <div className={`grid size-10 place-items-center rounded-full font-bold text-white shadow-inner ${user.role === "SUPER_ADMIN" ? "bg-ink" : user.role === "ADMIN" ? "bg-copper" : user.role === "STAFF" ? "bg-sage" : "bg-taupe"}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-ink dark:text-ivory">{user.name}</p>
                        <p className="text-xs text-ink/40 dark:text-ivory/55">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`hm-pill ${roleConfig[user.role].bg} ${roleConfig[user.role].color}`}>
                      {roleConfig[user.role].label}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-ink/60">
                       <ShoppingBag size={14} />
                       {user._count.orders}
                    </div>
                  </td>
                  <td className="text-xs font-medium text-ink/40">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${user.isActive ? "text-sage" : "text-red-500"}`}>
                       {user.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                       {user.isActive ? "Hoạt động" : "Bị khóa"}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                    <form action={updateUserStatus} className="flex items-center justify-end gap-3">
                      <input type="hidden" name="id" value={user.id} />
                      <label className="relative inline-flex cursor-pointer items-center group">
                        <input 
                          type="checkbox" 
                          name="isActive" 
                          defaultChecked={user.isActive} 
                          disabled={user.id === currentUser.id} 
                          className="peer sr-only"
                        />
                        <div className="h-6 w-11 rounded-full bg-porcelain transition-all peer-checked:bg-sage disabled:opacity-30 border border-ink/5" />
                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all peer-checked:translate-x-5 shadow-sm" />
                        <span className="sr-only">Toggle Status</span>
                      </label>
                      <button 
                        disabled={user.id === currentUser.id} 
                        className="rounded-lg border border-ink/5 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-ink transition-all hover:border-copper hover:text-copper disabled:opacity-20 dark:border-white/10 dark:bg-white/10 dark:text-ivory"
                      >
                        Lưu
                      </button>
                    </form>
                    <Link
                      href={`/admin/users?edit=${user.id}`}
                      className="grid size-9 place-items-center rounded-lg border border-ink/5 bg-white text-ink/45 transition-all hover:border-copper hover:text-copper dark:border-white/10 dark:bg-white/10 dark:text-ivory/60"
                      title="Chỉnh sửa"
                    >
                      <Edit size={15} />
                    </Link>
                    <form action={deleteAdminUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <button
                        disabled={user.id === currentUser.id || user._count.orders > 0 || user._count.questions > 0 || user._count.reviews > 0}
                        className="grid size-9 place-items-center rounded-lg border border-ink/5 bg-white text-ink/45 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-20 dark:border-white/10 dark:bg-white/10 dark:text-ivory/60 dark:hover:bg-red-500/10"
                        title={user.id === currentUser.id ? "Không thể xóa chính mình" : user._count.orders > 0 || user._count.questions > 0 || user._count.reviews > 0 ? "Không thể xóa người dùng đã có dữ liệu liên kết" : "Xóa người dùng"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Policy Note */}
      <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-xs text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200 sm:p-6">
         <ShieldAlert size={20} />
         <div>
            <p className="font-bold uppercase tracking-widest mb-1">Quy định bảo mật hệ thống</p>
            <p className="opacity-70">Bạn không thể tự khóa tài khoản của chính mình. Chỉ Super Admin mới có quyền quản lý vai trò của các quản trị viên khác.</p>
         </div>
      </div>
    </main>
  );
}
