import { parseDateOnly } from "@/utils/datetime";

export function formatShowDate(date: string): { dia: string; mes: string } {
  try {
    const dt = parseDateOnly(date);
    return {
      dia: String(dt.getDate()).padStart(2, "0"),
      mes: dt.toLocaleString("pt-BR", { month: "short" }).toUpperCase(),
    };
  } catch {
    return { dia: "--", mes: "---" };
  }
}
