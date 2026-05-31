"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Role, SupportRequestStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";
import { hashPassword, requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_NEWSLETTER_IMAGE_URL, SITE_SETTING_KEYS } from "@/lib/site-settings";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value.length > 0 ? value : null;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(text(formData, key).replace(/[^\d.-]/g, ""));
  return Number.isFinite(value) ? value : fallback;
}

function boundedText(formData: FormData, key: string, maxLength: number) {
  const value = text(formData, key);
  if (!value) {
    throw new Error("REQUIRED_FIELD");
  }
  if (value.length > maxLength) {
    throw new Error("FIELD_TOO_LONG");
  }
  return value;
}

function boundedNumber(formData: FormData, key: string, min: number, max: number, fallback = 0) {
  const value = Math.trunc(numberValue(formData, key, fallback));
  return Math.min(max, Math.max(min, value));
}

function optionalDate(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(value) : null;
}

function idValue(formData: FormData, key = "id") {
  const id = Number(text(formData, key));
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("INVALID_ID");
  }
  return id;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function slugFromForm(formData: FormData, fallbackKey = "name") {
  return text(formData, "slug") || slugify(text(formData, fallbackKey));
}

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseAttributes(raw: string) {
  return lines(raw).map((line, index) => {
    const [name, ...rest] = line.split("=");
    return {
      name: name.trim(),
      value: rest.join("=").trim(),
      sortOrder: index,
    };
  }).filter((item) => item.name && item.value);
}

function parseImages(raw: string, alt: string) {
  return lines(raw).map((url, index) => ({
    url,
    alt,
    sortOrder: index,
  }));
}

function parseVariantOptions(raw: string) {
  return raw.split("|").reduce<Record<string, string>>((options, chunk) => {
    const [name, ...rest] = chunk.split("=");
    const key = name?.trim();
    const value = rest.join("=").trim();
    if (key && value) {
      options[key] = value;
    }
    return options;
  }, {});
}

function parseVariants(raw: string) {
  return lines(raw)
    .map((line, index) => {
      const [name, sku, priceDelta = "0", stock = "0", options = ""] = line.split(";");
      return {
        name: name?.trim(),
        sku: sku?.trim(),
        priceDelta: Number(priceDelta.trim()) || 0,
        stock: Math.max(0, Math.floor(Number(stock.trim()) || 0)),
        options: parseVariantOptions(options),
        sortOrder: index,
        isActive: true,
      };
    })
    .filter((variant) => variant.name && variant.sku);
}

function formFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);
}

async function uploadImageFiles(files: File[], folder: "products" | "categories" | "settings") {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error("INVALID_IMAGE_TYPE");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("IMAGE_TOO_LARGE");
    }

    const extension = extname(file.name).toLowerCase() || ".jpg";
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    const uploadPath = join(uploadDir, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());

    await mkdir(uploadDir, { recursive: true });
    await writeFile(uploadPath, bytes);
    uploadedUrls.push(`/uploads/${folder}/${fileName}`);
  }

  return uploadedUrls;
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidateTag(CATALOG_CACHE_TAG);
}

export async function createCategory(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);
  const [uploadedImageUrl] = await uploadImageFiles(formFiles(formData, "imageFile"), "categories");

  await prisma.category.create({
    data: {
      name: text(formData, "name"),
      slug: slugFromForm(formData),
      description: nullableText(formData, "description"),
      imageUrl: uploadedImageUrl ?? nullableText(formData, "imageUrl"),
    },
  });

  revalidatePath("/admin/categories");
  revalidateCatalog();
}

export async function updateCategory(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);
  const [uploadedImageUrl] = await uploadImageFiles(formFiles(formData, "imageFile"), "categories");

  await prisma.category.update({
    where: { id: idValue(formData) },
    data: {
      name: text(formData, "name"),
      slug: slugFromForm(formData),
      description: nullableText(formData, "description"),
      imageUrl: uploadedImageUrl ?? nullableText(formData, "imageUrl"),
    },
  });

  revalidatePath("/admin/categories");
  revalidateCatalog();
}

export async function deleteCategory(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.category.delete({
    where: { id: idValue(formData) },
  });

  revalidatePath("/admin/categories");
  revalidateCatalog();
}

export async function createProduct(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  const name = text(formData, "name");
  const uploadedImageRows = (await uploadImageFiles(formFiles(formData, "imageFiles"), "products")).map((url, index) => ({
    url,
    alt: name,
    sortOrder: index,
  }));
  const imageRows = [...uploadedImageRows, ...parseImages(text(formData, "images"), name).map((image, index) => ({
    ...image,
    sortOrder: uploadedImageRows.length + index,
  }))];
  const attributeRows = parseAttributes(text(formData, "attributes"));
  const variantRows = parseVariants(text(formData, "variants"));

  await prisma.product.create({
    data: {
      categoryId: numberValue(formData, "categoryId"),
      supplierId: numberValue(formData, "supplierId") || null,
      name,
      slug: slugFromForm(formData),
      sku: text(formData, "sku"),
      brand: nullableText(formData, "brand"),
      description: nullableText(formData, "description"),
      price: numberValue(formData, "price"),
      salePrice: text(formData, "salePrice") ? numberValue(formData, "salePrice") : null,
      stock: numberValue(formData, "stock"),
      warranty: nullableText(formData, "warranty"),
      isFeatured: formData.get("isFeatured") === "on",
      isActive: formData.get("isActive") === "on",
      images: imageRows.length ? { create: imageRows } : undefined,
      attributes: attributeRows.length ? { create: attributeRows } : undefined,
      variants: variantRows.length ? { create: variantRows } : undefined,
    },
  });

  revalidatePath("/admin/products");
  revalidateCatalog();
}

export async function updateProduct(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  const id = idValue(formData);
  const name = text(formData, "name");
  const uploadedImageRows = (await uploadImageFiles(formFiles(formData, "imageFiles"), "products")).map((url, index) => ({
    url,
    alt: name,
    sortOrder: index,
  }));
  const imageRows = [...uploadedImageRows, ...parseImages(text(formData, "images"), name).map((image, index) => ({
    ...image,
    sortOrder: uploadedImageRows.length + index,
  }))];
  const attributeRows = parseAttributes(text(formData, "attributes"));
  const variantRows = parseVariants(text(formData, "variants"));

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        categoryId: numberValue(formData, "categoryId"),
        supplierId: numberValue(formData, "supplierId") || null,
        name,
        slug: slugFromForm(formData),
        sku: text(formData, "sku"),
        brand: nullableText(formData, "brand"),
        description: nullableText(formData, "description"),
        price: numberValue(formData, "price"),
        salePrice: text(formData, "salePrice") ? numberValue(formData, "salePrice") : null,
        stock: numberValue(formData, "stock"),
        warranty: nullableText(formData, "warranty"),
        isFeatured: formData.get("isFeatured") === "on",
        isActive: formData.get("isActive") === "on",
      },
    });
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productAttribute.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({ where: { productId: id } });
    if (imageRows.length) {
      await tx.productImage.createMany({ data: imageRows.map((image) => ({ ...image, productId: id })) });
    }
    if (attributeRows.length) {
      await tx.productAttribute.createMany({ data: attributeRows.map((attribute) => ({ ...attribute, productId: id })) });
    }
    if (variantRows.length) {
      await tx.productVariant.createMany({ data: variantRows.map((variant) => ({ ...variant, productId: id })) });
    }
  });

  revalidatePath("/admin/products");
  revalidateCatalog();
}

export async function deleteProduct(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.product.delete({
    where: { id: idValue(formData) },
  });

  revalidatePath("/admin/products");
  revalidateCatalog();
}

export async function createSupplier(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.supplier.create({
    data: {
      name: text(formData, "name"),
      phone: nullableText(formData, "phone"),
      email: nullableText(formData, "email"),
      address: nullableText(formData, "address"),
      description: nullableText(formData, "description"),
    },
  });

  revalidatePath("/admin/shipping");
}

export async function updateSupplier(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.supplier.update({
    where: { id: idValue(formData) },
    data: {
      name: text(formData, "name"),
      phone: nullableText(formData, "phone"),
      email: nullableText(formData, "email"),
      address: nullableText(formData, "address"),
      description: nullableText(formData, "description"),
    },
  });

  revalidatePath("/admin/shipping");
}

export async function deleteSupplier(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.supplier.delete({
    where: { id: idValue(formData) },
  });

  revalidatePath("/admin/shipping");
}

export async function createShipper(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.shipper.create({
    data: {
      name: text(formData, "name"),
      phone: nullableText(formData, "phone"),
    },
  });

  revalidatePath("/admin/shipping");
}

export async function updateShipper(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.shipper.update({
    where: { id: idValue(formData) },
    data: {
      name: text(formData, "name"),
      phone: nullableText(formData, "phone"),
    },
  });

  revalidatePath("/admin/shipping");
}

export async function deleteShipper(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.shipper.delete({
    where: { id: idValue(formData) },
  });

  revalidatePath("/admin/shipping");
}

export async function createProvince(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.province.create({
    data: {
      name: text(formData, "name"),
    },
  });

  revalidatePath("/admin/shipping");
}

export async function updateProvince(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.province.update({
    where: { id: idValue(formData) },
    data: {
      name: text(formData, "name"),
    },
  });

  revalidatePath("/admin/shipping");
}

export async function deleteProvince(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.province.delete({
    where: { id: idValue(formData) },
  });

  revalidatePath("/admin/shipping");
}

export async function createAdminUser(formData: FormData) {
  await requireAdminRole([Role.SUPER_ADMIN]);

  const role = text(formData, "role") as Role;
  if (role !== Role.CUSTOMER && role !== Role.STAFF && role !== Role.ADMIN) {
    throw new Error("INVALID_ROLE");
  }

  await prisma.user.create({
    data: {
      name: text(formData, "name"),
      email: text(formData, "email").toLowerCase(),
      passwordHash: await hashPassword(text(formData, "password")),
      phone: nullableText(formData, "phone"),
      address: nullableText(formData, "address"),
      role,
      isActive: true,
    },
  });

  revalidatePath("/admin/users");
}

export async function updateAdminUser(formData: FormData) {
  const currentUser = await requireAdminRole([Role.SUPER_ADMIN]);
  const userId = idValue(formData);
  const role = text(formData, "role") as Role;
  const password = text(formData, "password");

  if (role !== Role.CUSTOMER && role !== Role.STAFF && role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
    throw new Error("INVALID_ROLE");
  }

  if (userId === currentUser.id && role !== Role.SUPER_ADMIN) {
    throw new Error("CANNOT_DEMOTE_SELF");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: text(formData, "name"),
      email: text(formData, "email").toLowerCase(),
      phone: nullableText(formData, "phone"),
      address: nullableText(formData, "address"),
      role,
      isActive: userId === currentUser.id ? true : formData.get("isActive") === "on",
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    },
  });

  revalidatePath("/admin/users");
}

export async function updateUserStatus(formData: FormData) {
  const currentUser = await requireAdminRole([Role.SUPER_ADMIN]);
  const userId = idValue(formData);

  if (userId === currentUser.id) {
    throw new Error("CANNOT_DISABLE_SELF");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: formData.get("isActive") === "on",
    },
    select: {
      role: true,
    },
  });

  revalidatePath("/admin/users");
  if (updatedUser.role === Role.CUSTOMER) {
    revalidatePath("/account");
    revalidatePath("/account/orders");
  }
}

export async function updateHomepageMedia(formData: FormData) {
  await requireAdminRole([Role.SUPER_ADMIN]);

  let newsletterImageUrl = text(formData, "newsletterImageUrl") || DEFAULT_NEWSLETTER_IMAGE_URL;
  const uploadedImage = formData.get("newsletterImageFile");

  if (uploadedImage instanceof File && uploadedImage.size > 0) {
    const [uploadedUrl] = await uploadImageFiles([uploadedImage], "settings");
    newsletterImageUrl = uploadedUrl;
  }

  await prisma.siteSetting.upsert({
    where: { key: SITE_SETTING_KEYS.newsletterImageUrl },
    update: { value: newsletterImageUrl },
    create: {
      key: SITE_SETTING_KEYS.newsletterImageUrl,
      value: newsletterImageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function deleteAdminUser(formData: FormData) {
  const currentUser = await requireAdminRole([Role.SUPER_ADMIN]);
  const userId = idValue(formData);

  if (userId === currentUser.id) {
    throw new Error("CANNOT_DELETE_SELF");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          orders: true,
          questions: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user._count.orders > 0 || user._count.questions > 0 || user._count.reviews > 0) {
    throw new Error("USER_HAS_LINKED_DATA");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
}

export async function createCoupon(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.coupon.create({
    data: {
      code: text(formData, "code").toUpperCase(),
      description: nullableText(formData, "description"),
      discountType: text(formData, "discountType") === "PERCENT" ? "PERCENT" : "FIXED",
      discountValue: numberValue(formData, "discountValue"),
      minOrderTotal: text(formData, "minOrderTotal") ? numberValue(formData, "minOrderTotal") : null,
      usageLimit: text(formData, "usageLimit") ? numberValue(formData, "usageLimit") : null,
      startsAt: optionalDate(formData, "startsAt"),
      expiresAt: optionalDate(formData, "expiresAt"),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidatePath("/admin/coupons");
}

export async function updateCoupon(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.coupon.update({
    where: { id: idValue(formData) },
    data: {
      code: text(formData, "code").toUpperCase(),
      description: nullableText(formData, "description"),
      discountType: text(formData, "discountType") === "PERCENT" ? "PERCENT" : "FIXED",
      discountValue: numberValue(formData, "discountValue"),
      minOrderTotal: text(formData, "minOrderTotal") ? numberValue(formData, "minOrderTotal") : null,
      usageLimit: text(formData, "usageLimit") ? numberValue(formData, "usageLimit") : null,
      startsAt: optionalDate(formData, "startsAt"),
      expiresAt: optionalDate(formData, "expiresAt"),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.coupon.delete({
    where: { id: idValue(formData) },
  });

  revalidatePath("/admin/coupons");
}

export async function updateReviewVisibility(formData: FormData) {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.review.update({
    where: { id: idValue(formData) },
    data: {
      isVisible: formData.get("isVisible") === "on",
    },
  });

  revalidatePath("/admin/reviews");
  revalidateCatalog();
}

export async function deleteReview(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.review.delete({
    where: { id: idValue(formData) },
  });

  revalidatePath("/admin/reviews");
  revalidateCatalog();
}

export async function createAiKnowledgeItem(formData: FormData) {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.aiKnowledgeItem.create({
    data: {
      title: boundedText(formData, "title", 120),
      keywords: boundedText(formData, "keywords", 2000),
      answer: boundedText(formData, "answer", 5000),
      priority: boundedNumber(formData, "priority", -1000, 1000),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidatePath("/admin/ai-training");
}

export async function updateAiKnowledgeItem(formData: FormData) {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.aiKnowledgeItem.update({
    where: { id: idValue(formData) },
    data: {
      title: boundedText(formData, "title", 120),
      keywords: boundedText(formData, "keywords", 2000),
      answer: boundedText(formData, "answer", 5000),
      priority: boundedNumber(formData, "priority", -1000, 1000),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidatePath("/admin/ai-training");
}

export async function deleteAiKnowledgeItem(formData: FormData) {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  await prisma.aiKnowledgeItem.delete({
    where: { id: idValue(formData) },
  });

  revalidatePath("/admin/ai-training");
}

export async function updateSupportRequest(formData: FormData) {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);

  const status = text(formData, "status");
  if (!Object.values(SupportRequestStatus).includes(status as SupportRequestStatus)) {
    throw new Error("INVALID_SUPPORT_STATUS");
  }

  await prisma.supportRequest.update({
    where: { id: idValue(formData) },
    data: {
      status: status as SupportRequestStatus,
      adminNote: nullableText(formData, "adminNote"),
    },
  });

  revalidatePath("/admin/support-requests");
}
