export function parseRgbaInt(val: number): [number, number, number] {
  return [(val >> 16) & 0xff, (val >> 8) & 0xff, val & 0xff];
}

export function toHexString(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

// ExportFlavour/ExportSyndicates colour format: "0x00RRGGBB"
export function peColourToRgb(
  colour: { value: string }
): [number, number, number] {
  const hex = colour.value.substring(4);
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
  ];
}

export function peColourToHex(colour: { value: string }): string {
  const [r, g, b] = peColourToRgb(colour);
  return toHexString(r, g, b);
}

export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatHours(sec: number): string {
  return (sec / 3600).toFixed(1) + " h";
}

// 从账号 ObjectId 的前 4 字节提取注册时间
export function oidToDate(oid: string): Date {
  const ts = parseInt(oid.substring(0, 8), 16);
  return new Date(ts * 1000);
}

// 处理跨平台用户名（名字末位在 PUA 区）
export function sanitiseName(name: string): string {
  const last = name.charCodeAt(name.length - 1);
  return last >= 0xe000 ? name.substring(0, name.length - 1) : name;
}

/**
 * 从 Export JSON（ExportWarframes / ExportWeapons / ExportSentinels）
 * 和语言字典中查找物品的显示名称。
 * 找不到时返回路径最后一段作为兜底，不做任何硬编码。
 */
export function resolveItemName(
  itemType: string,
  dict: Record<string, string>,
  exportWarframes: Record<string, { name: string }>,
  exportWeapons: Record<string, { name: string }>,
  exportSentinels: Record<string, { name: string }>
): string {
  const nameKey =
    exportWarframes[itemType]?.name ??
    exportWeapons[itemType]?.name ??
    exportSentinels[itemType]?.name;
  if (nameKey) {
    const translated = dict[nameKey];
    if (translated) return translated;
  }
  // 兜底：取路径最后一段并做简单格式化
  const last = itemType.split("/").pop() ?? itemType;
  return last.replace(/([A-Z])/g, " $1").trim();
}
