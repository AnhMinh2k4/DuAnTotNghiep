import { Prisma, Role } from "@prisma/client";
import { requireAdminRole } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { createProduct, deleteProduct, updateProduct } from "../actions";
import { Plus, Edit, Trash2, ExternalLink, Package, CheckCircle2, XCircle, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { AdminListSearch } from "@/components/admin/admin-list-search";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    supplier: true;
    images: true;
    attributes: true;
    variants: true;
    _count: { select: { orderItems: true } };
  };
}>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; add?: string }>;
}) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);
  const params = await searchParams;

  const [products, categories, suppliers] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: true,
        supplier: true,
        images: { orderBy: { sortOrder: "asc" } },
        attributes: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  const editingProduct = params.edit ? products.find(p => p.id === Number(params.edit)) : null;
  const isAdding = params.add === "true";
  const productSearchItems = products.map((product) => ({
    id: product.id.toString(),
    title: product.name,
    subtitle: `${product.sku}${product.brand ? ` - ${product.brand}` : ""}`,
    meta: `${product.category.name} - ${formatCurrency(product.salePrice ?? product.price)}`,
    badge: product.isActive ? "Đang bán" : "Tạm ẩn",
    keywords: `${product.name} ${product.sku} ${product.brand ?? ""} ${product.category.name} ${product.slug}`,
  }));

  return (
    <main className="space-y-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="hm-page-title tracking-tight">Quản lý Sản phẩm</h1>
          <p className="mt-3 text-ink/40 dark:text-ivory/60">Danh sách toàn bộ thiết bị và linh kiện trong hệ thống TMDT Shop.</p>
        </div>
        <Link 
          href={isAdding ? "/admin/products" : "/admin/products?add=true"} 
          className="hm-btn-primary hm-hover-glow w-full gap-3 px-8 sm:w-auto"
        >
          <Plus size={20} />
          {isAdding ? "Hủy bỏ" : "Thêm sản phẩm mới"}
        </Link>
      </div>

      {/* Form Section (Conditional) */}
      {(isAdding || editingProduct) && (
        <section className="hm-surface overflow-hidden animate-slide-up border-copper/20 ring-1 ring-copper/10">
          <div className="flex flex-col justify-between gap-3 border-b border-ink/5 bg-porcelain/50 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:flex-row sm:items-center sm:px-8 sm:py-6">
            <h2 className="font-serif text-2xl">
              {isAdding ? "Tạo sản phẩm mới" : `Chỉnh sửa: ${editingProduct?.name}`}
            </h2>
            <Link href="/admin/products" className="text-xs font-bold uppercase tracking-widest text-ink/40 hover:text-ink dark:text-ivory/60 dark:hover:text-ivory">Đóng</Link>
          </div>
          <div className="p-5 sm:p-8 lg:p-12">
            <ProductForm 
              action={isAdding ? createProduct : updateProduct} 
              product={editingProduct}
              categories={categories} 
              suppliers={suppliers} 
            />
          </div>
        </section>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4">
        {[
          { label: "Tổng sản phẩm", value: products.length, icon: Package, color: "text-ink" },
          { label: "Đang kinh doanh", value: products.filter(p => p.isActive).length, icon: CheckCircle2, color: "text-sage" },
          { label: "Hết hàng", value: products.filter(p => (p.variants.length ? p.variants.reduce((sum, variant) => sum + variant.stock, 0) : p.stock) === 0).length, icon: XCircle, color: "text-red-500" },
          { label: "Tồn kho thấp", value: products.filter(p => {
            const totalStock = p.variants.length ? p.variants.reduce((sum, variant) => sum + variant.stock, 0) : p.stock;
            return totalStock > 0 && totalStock <= 5;
          }).length, icon: AlertTriangle, color: "text-copper" },
        ].map((stat, i) => (
          <div key={i} className="hm-surface flex items-center gap-4 p-5 sm:p-6">
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

      <div className="hm-surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-copper">Tìm kiếm sản phẩm</p>
          <p className="mt-1 text-xs text-ink/40 dark:text-ivory/60">Nhập để xem card gợi ý theo tên sản phẩm, SKU, thương hiệu hoặc danh mục.</p>
        </div>
        <AdminListSearch items={productSearchItems} placeholder="Tìm sản phẩm, SKU, danh mục..." />
      </div>

      {/* Table Section */}
      <section className="hm-surface overflow-hidden">
        <div className="max-h-[560px] overflow-auto">
          <table className="hm-table min-w-[920px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-porcelain/50 dark:bg-white/[0.06]">
                <th className="w-20">Ảnh</th>
                <th>Sản phẩm / SKU</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Kho</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {products.length > 0 ? products.map((product) => (
                <tr key={product.id} className="group transition-colors hover:bg-porcelain/30">
                  <td className="py-4">
                    <div className="relative size-14 overflow-hidden rounded-xl border border-ink/5 bg-porcelain">
                      {product.images[0] ? (
                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                      ) : (
                        <ImageIcon size={20} className="absolute inset-0 m-auto text-ink/10" />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="max-w-xs">
                      <p className="font-bold text-ink line-clamp-1">{product.name}</p>
                      <p className="mt-1 text-[10px] font-bold tracking-widest text-ink/30 uppercase">{product.sku}</p>
                    </div>
                  </td>
                  <td>
                    <span className="hm-pill lowercase tracking-normal bg-porcelain/50">{product.category.name}</span>
                  </td>
                  <td>
                    <div className="font-medium text-ink">
                      {formatCurrency(product.salePrice ?? product.price)}
                      {product.salePrice && (
                        <p className="text-[10px] text-red-500 line-through opacity-50">-{Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)}%</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${(product.variants.length ? product.variants.reduce((sum, variant) => sum + variant.stock, 0) : product.stock) > 5 ? "bg-sage" : (product.variants.length ? product.variants.reduce((sum, variant) => sum + variant.stock, 0) : product.stock) > 0 ? "bg-copper" : "bg-red-500"}`} />
                      <span className="font-medium">{product.variants.length ? product.variants.reduce((sum, variant) => sum + variant.stock, 0) : product.stock}</span>
                      {product.variants.length ? <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">{product.variants.length} biến thể</span> : null}
                    </div>
                  </td>
                  <td>
                    {product.isActive ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-sage">Đang bán</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/20">Tạm ẩn</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/products?edit=${product.id}`} 
                        className="grid size-9 place-items-center rounded-lg border border-ink/5 bg-white text-ink/40 hover:border-copper hover:text-copper transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </Link>
                      <form action={deleteProduct}>
                         <input type="hidden" name="id" value={product.id} />
                         <button 
                           className="grid size-9 place-items-center rounded-lg border border-ink/5 bg-white text-ink/40 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all disabled:opacity-20"
                           disabled={product._count.orderItems > 0}
                           title={product._count.orderItems > 0 ? "Không thể xóa sản phẩm đã có đơn hàng" : "Xóa"}
                         >
                           <Trash2 size={16} />
                         </button>
                      </form>
                      <Link 
                        href={`/products/${product.slug}`} 
                        target="_blank"
                        className="grid size-9 place-items-center rounded-lg border border-ink/5 bg-white text-ink/40 hover:text-ink transition-all"
                        title="Xem trên cửa hàng"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p className="font-serif text-2xl text-ink/60">Không tìm thấy sản phẩm</p>
                    <p className="mt-2 text-sm text-ink/35">Thử nhập tên sản phẩm, SKU hoặc danh mục khác.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

type ProductFormProps = {
  action: (formData: FormData) => Promise<void>;
  categories: Array<{ id: number; name: string }>;
  suppliers: Array<{ id: number; name: string }>;
  product?: ProductWithDetails | null;
};

function ProductForm({ action, categories, suppliers, product }: ProductFormProps) {
  return (
    <form action={action} className="grid gap-10">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Basic Info */}
        <div className="space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-copper">Thông tin cơ bản</p>
          <div className="grid gap-4">
            <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Tên sản phẩm *</label>
              <input name="name" required defaultValue={product?.name} placeholder="VD: Laptop Gaming MSI Katana..." className="hm-field w-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Mã SKU *</label>
                <input name="sku" required defaultValue={product?.sku} placeholder="HM-XXXX" className="hm-field w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Đường dẫn (Slug)</label>
                <input name="slug" defaultValue={product?.slug} placeholder="ten-san-pham" className="hm-field w-full" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Danh mục *</label>
                <select name="categoryId" required defaultValue={product?.categoryId} className="hm-field w-full appearance-none bg-white dark:bg-white/10 dark:[color-scheme:dark]">
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Nhà cung cấp</label>
                <select name="supplierId" defaultValue={product?.supplierId ?? ""} className="hm-field w-full appearance-none bg-white dark:bg-white/10 dark:[color-scheme:dark]">
                  <option value="">Chưa gán</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-copper">Giá & Kho hàng</p>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Giá niêm yết *</label>
                <input name="price" required type="number" min="0" defaultValue={product?.price.toString()} placeholder="0" className="hm-field w-full font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Giá khuyến mãi</label>
                <input name="salePrice" type="number" min="0" defaultValue={product?.salePrice?.toString() ?? ""} placeholder="Để trống nếu không có" className="hm-field w-full font-medium text-copper" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Tồn kho mặc định *</label>
                <input name="stock" required type="number" min="0" defaultValue={product?.stock ?? 0} placeholder="0" className="hm-field w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Thương hiệu / Bảo hành</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                   <input name="brand" defaultValue={product?.brand ?? ""} placeholder="Brand" className="hm-field w-full sm:w-1/2" />
                   <input name="warranty" defaultValue={product?.warranty ?? ""} placeholder="12 tháng" className="hm-field w-full sm:w-1/2" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:gap-8">
               <label className="flex items-center gap-3 cursor-pointer group">
                 <div className="grid size-6 place-items-center rounded-md border-2 border-ink/10 bg-white transition-all group-hover:border-copper peer-checked:bg-copper peer-checked:border-copper">
                    <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured ?? false} className="peer sr-only" />
                    <div className="size-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                 </div>
                 <span className="text-sm font-bold text-ink/70 dark:text-ivory/75">Sản phẩm nổi bật</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                 <div className="grid size-6 place-items-center rounded-md border-2 border-ink/10 bg-white transition-all group-hover:border-sage peer-checked:bg-sage peer-checked:border-sage">
                    <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} className="peer sr-only" />
                    <div className="size-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                 </div>
                 <span className="text-sm font-bold text-ink/70 dark:text-ivory/75">Đang kinh doanh</span>
               </label>
            </div>
          </div>
        </div>

        {/* Content & Assets */}
        <div className="lg:col-span-2 space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-copper">Nội dung & Hình ảnh</p>
          <div className="grid gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Mô tả sản phẩm</label>
              <textarea name="description" defaultValue={product?.description ?? ""} placeholder="Thông tin chi tiết về sản phẩm..." className="hm-field w-full min-h-[120px] py-4" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Tải ảnh sản phẩm</label>
                <input name="imageFiles" type="file" accept="image/*" multiple className="block w-full rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-sm text-ink/70 file:mr-4 file:rounded-lg file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-ivory dark:border-white/10 dark:bg-white/10 dark:text-ivory/70 dark:file:bg-ivory dark:file:text-ink" />
                <textarea name="images" defaultValue={product?.images.map((image) => image.url).join("\n") ?? ""} placeholder="URL ảnh cũ nếu cần giữ lại, mỗi dòng một URL..." className="hm-field mt-3 w-full min-h-[92px] py-4 font-mono text-[10px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Thông số kỹ thuật</label>
                <textarea name="attributes" defaultValue={product?.attributes.map((attribute) => `${attribute.name}=${attribute.value}`).join("\n") ?? ""} placeholder="CPU=Intel Core i5..." className="hm-field w-full min-h-[120px] py-4 font-mono text-[10px]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/60">Biến thể & tồn kho nâng cao</label>
              <textarea
                name="variants"
                defaultValue={product?.variants.map((variant) => {
                  const options = variant.options && typeof variant.options === "object" && !Array.isArray(variant.options)
                    ? Object.entries(variant.options as Record<string, string>).map(([name, value]) => `${name}=${value}`).join("|")
                    : "";
                  return `${variant.name};${variant.sku};${variant.priceDelta.toString()};${variant.stock};${options}`;
                }).join("\n") ?? ""}
                placeholder="Tên biến thể;SKU;Chênh lệch giá;Tồn kho;Màu=Đen|RAM=16GB"
                className="hm-field w-full min-h-[120px] py-4 font-mono text-[10px]"
              />
              <p className="text-xs text-ink/45 dark:text-ivory/55">Mỗi dòng là một biến thể. Nếu có biến thể, checkout sẽ trừ tồn kho theo SKU biến thể.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-ink/5 pt-6 dark:border-white/10">
        <button className="hm-btn-primary hm-hover-glow h-16 w-full px-12 sm:w-auto">
          {product ? "Cập nhật sản phẩm" : "Lưu & Xuất bản sản phẩm"}
        </button>
      </div>
    </form>
  );
}
