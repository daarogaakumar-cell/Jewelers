import { APP_NAME, APP_DESCRIPTION } from "@/constants";

export const DEFAULT_SEO = {
  title: {
    default: `${APP_NAME} — Premium Gold & Diamond Jewelry`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "jewelry",
    "gold jewelry",
    "diamond jewelry",
    "abhishek jewelers",
    "gold rings",
    "gold necklaces",
    "diamond rings",
    "wedding jewelry",
    "bridal jewelry",
    "hallmark gold",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: APP_NAME,
  },
};
