import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, Mic2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const artists = [
  {
    id: 1,
    name: "Maria Silva",
    genre: "MPB",
    city: "São Paulo",
    rating: 4.8,
    events: 24,
  },
  {
    id: 2,
    name: "João Santos",
    genre: "Rock",
    city: "Rio de Janeiro",
    rating: 4.5,
    events: 18,
  },
  {
    id: 3,
    name: "Ana Costa",
    genre: "Jazz",
    city: "Belo Horizonte",
    rating: 4.9,
    events: 32,
  },
  {
    id: 4,
    name: "Pedro Alves",
    genre: "Samba",
    city: "Salvador",
    rating: 4.7,
    events: 21,
  },
  {
    id: 5,
    name: "Juliana Lima",
    genre: "Pop",
    city: "Curitiba",
    rating: 4.6,
    events: 15,
  },
  {
    id: 6,
    name: "Rafael Souza",
    genre: "Blues",
    city: "Porto Alegre",
    rating: 4.8,
    events: 27,
  },
];

export function Artists() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Artistas</h1>
          <p className="text-gray-500">Gerencie todos os artistas cadastrados</p>
        </div>
        <Button>
          <Mic2 className="w-4 h-4 mr-2" />
          Novo Artista
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar artistas..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-600 text-white text-lg">
                        {artist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {artist.name}
                      </h3>
                      <p className="text-sm text-gray-500">{artist.genre}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Cidade:</span>
                      <span className="font-medium text-gray-900">
                        {artist.city}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Avaliação:</span>
                      <span className="font-medium text-gray-900">
                        ⭐ {artist.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Eventos:</span>
                      <span className="font-medium text-gray-900">
                        {artist.events}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Perfil
                    </Button>
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
