import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const CATALOG_CACHE_TAG = "catalog";
const CATALOG_REVALIDATE_SECONDS = 300;

export const getHomeCatalog = unstable_cache(
  async () => {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        take: 3,
        orderBy: { createdAt: "asc" },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        take: 3,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      }),
    ]);

    return { categories, products };
  },
  ["home-catalog"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
);

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  min?: number;
  max?: number;
  sort?: "featured" | "newest" | "price-asc" | "price-desc";
  page?: number;
  pageSize?: number;
};

export const getProductCatalog = unstable_cache(
  async (filters: ProductFilters) => {
    const page = Math.max(1, Math.floor(filters.page ?? 1));
    const pageSize = Math.min(24, Math.max(1, Math.floor(filters.pageSize ?? 9)));
    const where = {
      isActive: true,
      category: filters.category ? { slug: filters.category } : undefined,
      brand: filters.brand,
      price: {
        gte: Number.isFinite(filters.min) ? filters.min : undefined,
        lte: Number.isFinite(filters.max) ? filters.max : undefined,
      },
      OR: filters.q ? [
        { name: { contains: filters.q } },
        { sku: { contains: filters.q } },
        { brand: { contains: filters.q } },
      ] : undefined,
    };
    const orderBy = filters.sort === "price-asc"
      ? [{ price: "asc" as const }]
      : filters.sort === "price-desc"
        ? [{ price: "desc" as const }]
        : filters.sort === "newest"
          ? [{ createdAt: "desc" as const }]
          : [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }];

    const [categories, brands, total, products] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.product.findMany({
        where: { isActive: true, brand: { not: null } },
        distinct: ["brand"],
        select: { brand: true },
        orderBy: { brand: "asc" },
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
          supplier: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { categories, brands, products, total, page, pageSize };
  },
  ["product-catalog"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
);

export const getProductDetail = unstable_cache(
  async (slug: string) => prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      category: true,
      supplier: true,
      attributes: {
        orderBy: { sortOrder: "asc" },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  }),
  ["product-detail"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
);
