import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";

const SHOP_SHELL_REVALIDATE_SECONDS = 300;

export const getShopShellData = unstable_cache(
  async () => Promise.all([
    prisma.category.findMany({
      take: 6,
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      take: 10,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, brand: { not: null } },
      distinct: ["brand"],
      take: 8,
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
  ]),
  ["shop-shell-data"],
  { revalidate: SHOP_SHELL_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
);
