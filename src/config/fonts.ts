export interface FontFileConfig {
  url: string;
  weight: number;
  style: "normal" | "italic";
  format: "truetype";
}

export interface FontConfig {
  id: "inter" | "montserrat" | "pt_serif" | "bitter" | "caveat";
  family: string;
  files: FontFileConfig[];
  supportsCyrillic: true;
}

function file(
  base: string,
  path: string,
  weight: number,
  style: "normal" | "italic" = "normal"
): FontFileConfig {
  return {
    url: `${base}/fonts/${path}`,
    weight,
    style,
    format: "truetype"
  };
}

export function fontConfig(baseUrl: string): FontConfig[] {
  const base = baseUrl.replace(/\/$/, "");

  return [
    {
      id: "inter",
      family: "Inter",
      supportsCyrillic: true,
      files: [
        file(base, "inter/Inter-400.ttf", 400),
        file(base, "inter/Inter-700.ttf", 700),
        file(base, "inter/Inter-Italic-400.ttf", 400, "italic"),
        file(base, "inter/Inter-Italic-700.ttf", 700, "italic")
      ]
    },
    {
      id: "montserrat",
      family: "Montserrat",
      supportsCyrillic: true,
      files: [
        file(base, "montserrat/Montserrat-400.ttf", 400),
        file(base, "montserrat/Montserrat-700.ttf", 700),
        file(base, "montserrat/Montserrat-Italic-400.ttf", 400, "italic"),
        file(base, "montserrat/Montserrat-Italic-700.ttf", 700, "italic")
      ]
    },
    {
      id: "pt_serif",
      family: "PT Serif",
      supportsCyrillic: true,
      files: [
        file(base, "pt_serif/PT_Serif-Web-Regular.ttf", 400),
        file(base, "pt_serif/PT_Serif-Web-Bold.ttf", 700),
        file(base, "pt_serif/PT_Serif-Web-Italic.ttf", 400, "italic"),
        file(base, "pt_serif/PT_Serif-Web-BoldItalic.ttf", 700, "italic")
      ]
    },
    {
      id: "bitter",
      family: "Bitter",
      supportsCyrillic: true,
      files: [
        file(base, "bitter/Bitter-400.ttf", 400),
        file(base, "bitter/Bitter-700.ttf", 700),
        file(base, "bitter/Bitter-Italic-400.ttf", 400, "italic"),
        file(base, "bitter/Bitter-Italic-700.ttf", 700, "italic")
      ]
    },
    {
      id: "caveat",
      family: "Caveat",
      supportsCyrillic: true,
      files: [
        file(base, "caveat/Caveat-400.ttf", 400),
        file(base, "caveat/Caveat-700.ttf", 700)
      ]
    }
  ];
}
