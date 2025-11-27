import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { StatusBadge } from "../components/StatusBadge";
import { Search, Filter, Building2, MapPin, MoreHorizontal } from "lucide-react";

const establishments = [
  {
    id: 1,
    name: "Blue Note Bar",
    address: "Rua Augusta, 123 - São Paulo",
    capacity: 150,
    status: "active" as const,
  },
  {
    id: 2,
    name: "The Cavern",
    address: "Av. Paulista, 456 - São Paulo",
    capacity: 200,
    status: "active" as const,
  },
  {
    id: 3,
    name: "Boteco do Samba",
    address: "Rua da Lapa, 789 - Rio de Janeiro",
    capacity: 100,
    status: "inactive" as const,
  },
];

export function Establishments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Estabelecimentos</h1>
          <p className="text-gray-500">Gerencie todos os estabelecimentos cadastrados</p>
        </div>
        <Button>
          <Building2 className="w-4 h-4 mr-2" />
          Novo Estabelecimento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar estabelecimentos..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {establishments.map((establishment) => (
              <Card key={establishment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <StatusBadge status={establishment.status} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {establishment.name}
                  </h3>
                  <div className="flex items-start gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{establishment.address}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      Capacidade: {establishment.capacity}
                    </span>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
