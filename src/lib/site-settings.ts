import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const DEFAULT_NEWSLETTER_IMAGE_URL =
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85";

export const SITE_SETTING_KEYS = {
  newsletterImageUrl: "newsletterImageUrl",
} as const;

export const getSiteSettings = unstable_cache(async () => {
  const rows = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: Object.values(SITE_SETTING_KEYS),
      },
    },
  });

  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    newsletterImageUrl: settings[SITE_SETTING_KEYS.newsletterImageUrl] || DEFAULT_NEWSLETTER_IMAGE_URL,
  };
}, ["site-settings"], { revalidate: 300 });
