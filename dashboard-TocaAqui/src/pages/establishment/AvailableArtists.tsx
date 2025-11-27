import { Search, Star, Music, MapPin } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";

const artists = [
  {
    id: 1,
    name: "Maria Silva",
    genre: "MPB",
    rating: 4.8,
    shows: 45,
    location: "São Paulo, SP",
    price: "R$ 1.500 - R$ 2.500",
    available: true,
  },
  {
    id: 2,
    name: "Carlos Santos",
    genre: "Rock",
    rating: 4.5,
    shows: 32,
    location: "Rio de Janeiro, RJ",
    price: "R$ 1.200 - R$ 2.000",
    available: true,
  },
  {
    id: 3,
    name: "Ana Costa",
    genre: "Samba",
    rating: 4.9,
    shows: 67,
    location: "São Paulo, SP",
    price: "R$ 2.000 - R$ 3.500",
    available: false,
  },
  {
    id: 4,
    name: "João Oliveira",
    genre: "Jazz",
    rating: 4.7,
    shows: 51,
    location: "Belo Horizonte, MG",
    price: "R$ 1.800 - R$ 3.000",
    available: true,
  },
  {
    id: 5,
    name: "Paula Mendes",
    genre: "Forró",
    rating: 4.6,
    shows: 28,
    location: "Recife, PE",
    price: "R$ 1.000 - R$ 1.800",
    available: true,
  },
  {
    id: 6,
    name: "Ricardo Lima",
    genre: "Blues",
    rating: 4.8,
    shows: 39,
    location: "Porto Alegre, RS",
    price: "R$ 1.500 - R$ 2.200",
    available: true,
  },
];

export function AvailableArtists() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-gray-900">Artistas Disponíveis</h1>
        <p className="text-gray-600 mt-1">Encontre e contrate artistas para seus eventos</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar artistas por nome ou gênero..."
            className="pl-10 bg-white"
          />
        </div>
        <Button variant="outline">
          Filtros
        </Button>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <Card key={artist.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.name}`} />
                  <AvatarFallback>{artist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 mb-1">{artist.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{artist.genre}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-900">{artist.rating}</span>
                    <span className="text-gray-500">({artist.shows} shows)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{artist.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Music className="w-4 h-4" />
                  <span>{artist.price}</span>
                </div>
              </div>

              {artist.available ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-3">
                  Disponível
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 mb-3">
                  Indisponível
                </Badge>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Perfil
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!artist.available}
                >
                  Contratar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
