import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, Heart } from "lucide-react";

const favorites = [
  {
    id: 1,
    user: "Carlos Mendes",
    entity: "Blue Note Bar",
    entityType: "Estabelecimento",
    date: "2024-11-20",
  },
  {
    id: 2,
    user: "Paula Oliveira",
    entity: "Maria Silva",
    entityType: "Artista",
    date: "2024-11-21",
  },
  {
    id: 3,
    user: "Ricardo Lima",
    entity: "The Rockers",
    entityType: "Banda",
    date: "2024-11-22",
  },
  {
    id: 4,
    user: "Juliana Rocha",
    entity: "The Cavern",
    entityType: "Estabelecimento",
    date: "2024-11-23",
  },
];

export function Favorites() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Favoritos</h1>
          <p className="text-gray-500">
            Visualize todos os favoritos dos usuários
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar favoritos..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Usuário
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Entidade Favoritada
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Tipo
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((favorite) => (
                  <tr
                    key={favorite.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-600 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {favorite.user}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-900">{favorite.entity}</td>
                    <td className="p-4">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {favorite.entityType}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{favorite.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
