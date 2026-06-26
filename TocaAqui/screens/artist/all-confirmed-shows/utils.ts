export function formatShowDate(date: string) {
  try {
    const dt = new Date(date);
    return {
      dia: String(dt.getDate()).padStart(2, "0"),
      mes: dt.toLocaleString("pt-BR", { month: "short" }).toUpperCase(),
    };
  } catch {
    return { dia: "--", mes: "---" };
  }
}
