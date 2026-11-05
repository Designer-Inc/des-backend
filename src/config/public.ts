import { fontConfig } from "./fonts";

export function publicConfig(assetsBaseUrl: string) {
  return {
    currency: "UAH",
    locales: ["uk", "en"],
    defaultLocale: "uk",
    fonts: fontConfig(assetsBaseUrl),
    textColors: [
      "#111111",
      "#ffffff",
      "#f2b705",
      "#2255aa",
      "#d64545",
      "#2e7d32",
      "#8a8a8a",
      "#d9c7a3"
    ],
    limits: {
      maxArtworkBytes: 20 * 1024 * 1024,
      maxVectorBytes: 50 * 1024 * 1024,
      maxPrintFileBytes: 200 * 1024 * 1024,
      maxPersonalizationBytes: 5 * 1024 * 1024,
      maxNames: 500,
      maxTextLength: 100,
      minDpi: 72,
      warningDpi: 150
    },
    designDisclaimerVersion: "2026-11-01",
    termsVersion: "2026-11-01",
    privacyVersion: "2026-11-01",
    paymentMethods: ["card", "bank_transfer"],
    deliveryProviders: ["nova_poshta"],
    fileRules: [
      {
        kind: "artwork",
        mimeTypes: ["image/png", "image/jpeg", "image/svg+xml"],
        maxBytes: 20 * 1024 * 1024
      },
      {
        kind: "vector",
        mimeTypes: ["application/postscript", "application/illustrator"],
        maxBytes: 50 * 1024 * 1024
      },
      {
        kind: "brand_asset",
        mimeTypes: [
          "image/png",
          "image/jpeg",
          "image/svg+xml",
          "application/pdf",
          "application/postscript"
        ],
        maxBytes: 50 * 1024 * 1024
      },
      {
        kind: "personalization_list",
        mimeTypes: [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ],
        maxBytes: 5 * 1024 * 1024
      },
      {
        kind: "print_file",
        mimeTypes: ["image/png", "application/pdf"],
        maxBytes: 200 * 1024 * 1024
      },
      {
        kind: "product_image",
        mimeTypes: ["image/png", "image/jpeg", "image/webp"],
        maxBytes: 10 * 1024 * 1024
      },
      {
        kind: "preview",
        mimeTypes: ["image/png", "image/jpeg", "image/webp"],
        maxBytes: 10 * 1024 * 1024
      }
    ]
  };
}
