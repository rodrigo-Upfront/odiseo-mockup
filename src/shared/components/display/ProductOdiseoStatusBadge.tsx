import { type ProductStatus } from "../../data/projectWorkflow";

interface ProductOdiseoStatusBadgeProps {
  status: ProductStatus;
}

export default function ProductOdiseoStatusBadge({ status }: ProductOdiseoStatusBadgeProps) {
  const styles: Record<ProductStatus, string> = {
    "Registrado": "bg-blue-100 text-blue-700",
    "En Preparación": "bg-amber-100 text-amber-700",
    "Completado": "bg-green-100 text-green-700",
    "Dado de alta": "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
