import { formatCurrency } from "@/lib/format";

type CurrencyInput = Parameters<typeof formatCurrency>[0];

type InvoiceOrder = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  note: string | null;
  status: string;
  paymentStatus: string;
  subtotal: CurrencyInput;
  shippingFee: CurrencyInput;
  discountTotal: CurrencyInput;
  total: CurrencyInput;
  couponCode: string | null;
  createdAt: Date;
  items: Array<{
    id: number;
    name: string;
    sku: string;
    price: CurrencyInput;
    quantity: number;
    total: CurrencyInput;
  }>;
};

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export function InvoiceDocument({ order }: { order: InvoiceOrder }) {
  const isPaid = order.paymentStatus === "PAID";

  return (
    <section className="hm-print-root bg-white p-6 text-ink print:p-0">
      <div className="flex flex-col justify-between gap-6 border-b border-ink/15 pb-6 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-ink font-serif text-lg text-ivory">TS</span>
            <div>
              <p className="font-serif text-3xl">TMDT Shop</p>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Hóa đơn bán hàng</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-ink/60">Đường Hùng Vương, TP. Huế, Thừa Thiên Huế<br />Hotline: 1800 6601</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-ink/55">Mã hóa đơn</p>
          <p className="font-serif text-3xl">TS-{String(order.id).padStart(5, "0")}</p>
          <p className="mt-2 text-sm text-ink/55">{order.createdAt.toLocaleString("vi-VN")}</p>
        </div>
      </div>

      <div className="grid gap-6 border-b border-ink/15 py-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Khách hàng</p>
          <p className="mt-3 font-semibold">{order.customerName}</p>
          <p className="mt-1 text-sm text-ink/60">{order.customerPhone} • {order.customerEmail}</p>
          <p className="mt-2 text-sm leading-6 text-ink/60">{order.shippingAddress}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Thanh toán</p>
          <p className="mt-3 text-sm"><span className="font-semibold">Trạng thái đơn:</span> {statusLabels[order.status] ?? order.status}</p>
          <p className="mt-2 text-sm"><span className="font-semibold">Thanh toán:</span> {isPaid ? "Đã thanh toán điện tử/demo" : "COD - thanh toán khi nhận hàng"}</p>
          {order.couponCode ? <p className="mt-2 text-sm"><span className="font-semibold">Mã giảm giá:</span> {order.couponCode}</p> : null}
        </div>
      </div>

      <div className="py-6">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15">
              <th className="py-3 pr-3 font-semibold">Sản phẩm</th>
              <th className="py-3 px-3 text-center font-semibold">SL</th>
              <th className="py-3 px-3 text-right font-semibold">Đơn giá</th>
              <th className="py-3 pl-3 text-right font-semibold">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-4 pr-3">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs text-ink/45">{item.sku}</p>
                </td>
                <td className="py-4 px-3 text-center">{item.quantity}</td>
                <td className="py-4 px-3 text-right">{formatCurrency(item.price)}</td>
                <td className="py-4 pl-3 text-right font-semibold">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto max-w-sm space-y-2 border-t border-ink/15 pt-5 text-sm">
        <p className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(order.subtotal)}</span></p>
        <p className="flex justify-between"><span>Phí vận chuyển</span><span>{formatCurrency(order.shippingFee)}</span></p>
        <p className="flex justify-between"><span>Giảm giá</span><span>-{formatCurrency(order.discountTotal)}</span></p>
        <p className="flex justify-between border-t border-ink/15 pt-3 text-lg font-bold"><span>Tổng cộng</span><span>{formatCurrency(order.total)}</span></p>
      </div>

      <div className="mt-12 grid gap-8 text-center text-sm text-ink/60 sm:grid-cols-2">
        <div>
          <p className="font-semibold text-ink">Khách hàng</p>
          <p className="mt-16 border-t border-ink/20 pt-2">Ký và ghi rõ họ tên</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Cửa hàng</p>
          <p className="mt-16 border-t border-ink/20 pt-2">TMDT Shop</p>
        </div>
      </div>
    </section>
  );
}
