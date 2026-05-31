import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function calculateShippingFee(provinceId: number, subtotal: number, client: Prisma.TransactionClient | typeof prisma = prisma) {
  const rate = await client.shippingRate.findFirst({
    where: {
      isActive: true,
      OR: [
        { provinceId },
        { isDefault: true },
      ],
    },
    orderBy: [
      { provinceId: "desc" },
      { isDefault: "desc" },
    ],
  });

  if (!rate) {
    return 0;
  }

  if (rate.freeFrom !== null && subtotal >= rate.freeFrom.toNumber()) {
    return 0;
  }

  return rate.fee.toNumber();
}
