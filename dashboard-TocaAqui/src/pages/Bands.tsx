import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, Music, Users, MoreHorizontal } from "lucide-react";

const bands = [
  {
    id: 1,
    name: "The Rockers",
    genre: "Rock",
    members: 4,
    city: "São Paulo",
    events: 15,
  },
  {
    id: 2,
    name: "Jazz Ensemble",
    genre: "Jazz",
    members: 5,
    city: "Rio de Janeiro",
    events: 22,
  },
  {
    id: 3,
    name: "Samba de Classe",
    genre: "Samba",
    members: 6,
    city: "Salvador",
    events: 18,
  },
];

export function Bands() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Bandas</h1>
          <p className="text-gray-500">Gerencie todas as bandas cadastradas</p>
        </div>
        <Button>
          <Music className="w-4 h-4 mr-2" />
          Nova Banda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar bandas..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bands.map((band) => (
              <Card key={band.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Music className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {band.name}
                      </h3>
                      <p className="text-sm text-gray-500">{band.genre}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-900 font-semibold">
                          <Users className="w-4 h-4" />
                          {band.members}
                        </div>
                        <p className="text-xs text-gray-500">Membros</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-900 font-semibold">
                          {band.events}
                        </p>
                        <p className="text-xs text-gray-500">Eventos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-900 font-semibold">
                          {band.city}
                        </p>
                        <p className="text-xs text-gray-500">Cidade</p>
                      </div>
                    </div>
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
