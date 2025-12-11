import { getColorPalette, type Theme } from "./colors.js";

export function getColor(
  theme: Theme,
  path: string
): string | undefined {
  const palette = getColorPalette(theme);
  const keys = path.split(".");

  let value: any = palette;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key as keyof typeof value];
    } else {
      return undefined;
    }
  }

  return typeof value === "string" ? value : undefined;
}

export function getColorVariable(path: string): string {
  const kebabPath = path
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/\./g, "-");
  return `--color-${kebabPath}`;
}

export function getColorsFlat(theme: Theme): Record<string, string> {
  const palette = getColorPalette(theme);
  const flat: Record<string, string> = {};

  function flatten(obj: any, prefix = ""): void {
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "string") {
        flat[newKey] = value;
      } else if (typeof value === "object" && value !== null) {
        flatten(value, newKey);
      }
    }
  }

  flatten(palette);
  return flat;
}

