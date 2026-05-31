import { Role } from "@prisma/client";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Truck, Warehouse, MapPin, Plus, Save, Trash2, ShieldAlert } from "lucide-react";
import {
  createShipper,
  createSupplier,
  deleteShipper,
  deleteSupplier,
  updateShipper,
  updateSupplier,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  const [suppliers, shippers, provinces] = await Promise.all([
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.shipper.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { orders: true } } },
    }),
    prisma.province.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { orders: true } } },
    }),
  ]);

  return (
    <main className="space-y-12">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="hm-page-title tracking-tight">Vận chuyển & Đối tác</h1>
          <p className="mt-3 text-ink/55 dark:text-ivory/65">Quản lý nhà cung cấp, đơn vị vận chuyển và khu vực hoạt động của hệ thống.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-ink/5 bg-white px-6 py-3 shadow-soft dark:border-white/10 dark:bg-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Tổng cộng</p>
            <p className="mt-1 font-serif text-xl text-ink dark:text-ivory">{suppliers.length + shippers.length + provinces.length} đối tác</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        {/* Suppliers Section */}
        <div className="hm-surface overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink/5 bg-porcelain/70 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:px-8 sm:py-6">
            <div className="flex items-center gap-3">
              <Warehouse className="text-copper" size={24} />
              <h2 className="font-serif text-xl text-ink dark:text-ivory sm:text-2xl">Nhà cung cấp</h2>
            </div>
            <span className="rounded-full bg-ink/5 px-3 py-1 text-[10px] font-bold text-ink/55 dark:bg-white/10 dark:text-ivory/70">{suppliers.length}</span>
          </div>
          
          <div className="p-5 sm:p-8">
             <details className="group mb-8">
               <summary className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-widest text-copper transition-colors hover:text-ink dark:hover:text-ivory list-none">
                 <Plus size={16} />
                 Thêm nhà cung cấp mới
               </summary>
               <form action={createSupplier} className="mt-6 grid gap-4 rounded-2xl border border-ink/5 bg-porcelain/50 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
                 <div className="grid gap-4 md:grid-cols-2">
                    <input name="name" required placeholder="Tên nhà cung cấp *" className="hm-field" />
                    <input name="phone" placeholder="Số điện thoại" className="hm-field" />
                    <input name="email" type="email" placeholder="Địa chỉ Email" className="hm-field md:col-span-2" />
                    <input name="address" placeholder="Địa chỉ trụ sở" className="hm-field md:col-span-2" />
                    <textarea name="description" placeholder="Ghi chú thêm về nhà cung cấp..." className="hm-field h-32 py-4 md:col-span-2" />
                 </div>
                 <button className="hm-btn-primary h-14 w-full">Lưu nhà cung cấp</button>
               </form>
             </details>

             <div className="space-y-6">
               {suppliers.map((item) => (
                 <div key={item.id} className="group rounded-2xl border border-ink/5 bg-white p-6 shadow-sm transition-all hover:border-copper/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-copper/40">
                   <form action={updateSupplier} className="grid gap-4">
                     <input type="hidden" name="id" value={item.id} />
                     <div className="flex items-start justify-between gap-3">
                       <input name="name" required defaultValue={item.name} className="flex-1 bg-transparent font-serif text-xl text-ink outline-none focus:text-copper dark:text-ivory dark:placeholder:text-ivory/50" />
                       <div className="flex items-center gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                         <button type="submit" className="grid size-10 place-items-center rounded-xl bg-sage/10 text-sage hover:bg-sage hover:text-white transition-all" title="Lưu thay đổi">
                           <Save size={18} />
                         </button>
                       </div>
                     </div>
                     <div className="grid gap-3 md:grid-cols-2">
                       <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-ivory/65">
                         <MapPin size={14} />
                         <input name="address" defaultValue={item.address ?? ""} placeholder="Địa chỉ" className="flex-1 bg-transparent outline-none placeholder:text-ink/40 focus:text-ink dark:text-ivory/70 dark:placeholder:text-ivory/45 dark:focus:text-ivory" />
                       </div>
                       <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-ivory/65">
                         <Warehouse size={14} />
                         <span>{item._count.products} sản phẩm</span>
                       </div>
                     </div>
                   </form>
                   <div className="mt-6 flex items-center justify-between border-t border-ink/5 pt-4 dark:border-white/10">
                     <form action={deleteSupplier}>
                       <input type="hidden" name="id" value={item.id} />
                       <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 disabled:opacity-30" disabled={item._count.products > 0}>
                         <Trash2 size={14} />
                         {item._count.products > 0 ? "Không thể xóa (Đang có SP)" : "Xóa nhà cung cấp"}
                       </button>
                     </form>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Shippers Section */}
        <div className="hm-surface overflow-hidden self-start">
          <div className="flex items-center justify-between gap-3 border-b border-ink/5 bg-porcelain/70 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:px-8 sm:py-6">
            <div className="flex items-center gap-3">
              <Truck className="text-sage" size={24} />
              <h2 className="font-serif text-xl text-ink dark:text-ivory sm:text-2xl">Đơn vị vận chuyển</h2>
            </div>
            <span className="rounded-full bg-ink/5 px-3 py-1 text-[10px] font-bold text-ink/55 dark:bg-white/10 dark:text-ivory/70">{shippers.length}</span>
          </div>
          
          <div className="p-5 sm:p-8">
            <form action={createShipper} className="mb-10 flex flex-col gap-3 sm:flex-row">
              <input name="name" required placeholder="Tên đơn vị vận chuyển *" className="hm-field flex-1" />
              <button className="hm-btn-primary h-12 shrink-0 px-5 sm:size-12 sm:p-0" aria-label="Thêm đơn vị vận chuyển">
                <Plus size={20} />
              </button>
            </form>

            <div className="grid gap-4 sm:grid-cols-2">
              {shippers.map((item) => (
                <div key={item.id} className="group rounded-2xl border border-ink/5 bg-white p-5 transition-all hover:bg-porcelain/30 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/10">
                  <form action={updateShipper} className="space-y-3">
                    <input type="hidden" name="id" value={item.id} />
                    <input name="name" required defaultValue={item.name} className="w-full bg-transparent font-bold text-ink outline-none focus:text-sage dark:text-ivory" />
                    <input name="phone" defaultValue={item.phone ?? ""} placeholder="Hotline" className="w-full bg-transparent text-xs text-ink/60 outline-none placeholder:text-ink/40 dark:text-ivory/65 dark:placeholder:text-ivory/45" />
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[10px] font-medium text-ink/45 dark:text-ivory/55">{item._count.orders} đơn hàng</span>
                       <button type="submit" className="text-xs font-bold text-sage opacity-100 transition-opacity hover:underline sm:opacity-0 sm:group-hover:opacity-100">Lưu</button>
                    </div>
                  </form>
                  <form action={deleteShipper} className="mt-4 border-t border-ink/5 pt-3 dark:border-white/10">
                    <input type="hidden" name="id" value={item.id} />
                    <button className="text-[9px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 disabled:opacity-20" disabled={item._count.orders > 0}>
                      Xóa đơn vị
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Provinces Section */}
        <div className="hm-surface overflow-hidden self-start xl:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-ink/5 bg-porcelain/70 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:px-8 sm:py-6">
            <div className="flex items-center gap-3">
              <MapPin className="text-taupe" size={24} />
              <h2 className="font-serif text-xl text-ink dark:text-ivory sm:text-2xl">Khu vực / Tỉnh thành</h2>
            </div>
            <span className="rounded-full bg-ink/5 px-3 py-1 text-[10px] font-bold text-ink/55 dark:bg-white/10 dark:text-ivory/70">{provinces.length}/63</span>
          </div>
          
          <div className="p-5 sm:p-8">
            <div className="mb-8 rounded-xl bg-copper/5 p-4 text-xs leading-6 text-copper dark:bg-copper/10">
              Danh sách tỉnh/thành là dữ liệu chuẩn 63 tỉnh thành Việt Nam. Khách chọn khu vực này khi checkout, admin chỉ dùng để kiểm tra và điều phối shipper.
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {provinces.map((item) => (
                <div key={item.id} className="group relative rounded-xl border border-ink/5 bg-porcelain/40 p-4 transition-all hover:border-copper/20 hover:bg-white hover:shadow-soft dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-copper/40 dark:hover:bg-white/10">
                  <p className="text-center text-sm font-medium text-ink dark:text-ivory">{item.name}</p>
                  <p className="mt-2 text-center text-[10px] font-medium text-ink/45 dark:text-ivory/55">{item._count.orders} đơn</p>
                </div>
              ))}
            </div>
            
            {provinces.length > 0 && (
              <div className="mt-8 flex items-center gap-2 rounded-xl bg-copper/5 p-4 text-xs text-copper dark:bg-copper/10">
                <ShieldAlert size={16} />
                Tỉnh/thành được khóa như dữ liệu nền để tránh sai khu vực giao hàng trong đơn.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
