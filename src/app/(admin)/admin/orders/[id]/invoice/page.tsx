import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { InvoiceDocument } from "@/components/common/invoice-document";
import { PrintButton } from "@/components/common/print-button";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminInvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminInvoicePage({ params }: AdminInvoicePageProps) {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId < 1) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex flex-col justify-between gap-3 print:hidden sm:flex-row sm:items-center">
        <Link href="/admin/orders" className="hm-btn-secondary">Quay lại đơn hàng</Link>
        <PrintButton />
      </div>
      <InvoiceDocument order={order} />
    </main>
  );
}
