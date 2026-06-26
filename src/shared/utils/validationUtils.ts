// Helper to check if value is "Máquina genérica"
export const isGenericPackingMachine = (value?: string | null): boolean => {
  if (!value) return false;

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  return (
    normalized === "maquina generica" ||
    normalized === "generico" ||
    normalized === "generic"
  );
};
