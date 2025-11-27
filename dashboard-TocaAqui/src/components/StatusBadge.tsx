import { Badge } from "./ui/badge";

export type Status = "pending" | "approved" | "rejected" | "active" | "inactive";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  approved: {
    label: "Aprovado",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  rejected: {
    label: "Rejeitado",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  active: {
    label: "Ativo",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  inactive: {
    label: "Inativo",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
