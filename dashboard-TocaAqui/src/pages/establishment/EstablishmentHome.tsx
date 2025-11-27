import { Calendar, Users, TrendingUp, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";

const nextEvent = {
  name: "Noite de Jazz",
  artist: "Quinteto Blue Note",
  date: "2025-11-30",
  time: "20:00",
  status: "confirmado",
};

const pendingArtists = [
  { id: 1, name: "Maria Silva", genre: "MPB", avatar: "MS" },
  { id: 2, name: "Carlos Santos", genre: "Rock", avatar: "CS" },
  { id: 3, name: "Ana Costa", genre: "Samba", avatar: "AC" },
];

const upcomingEvents = [
  {
    id: 1,
    name: "Noite de Jazz",
    artist: "Quinteto Blue Note",
    date: "2025-11-30",
    time: "20:00",
    status: "confirmado",
  },
  {
    id: 2,
    name: "Samba de Raiz",
    artist: "Grupo Saudade",
    date: "2025-12-02",
    time: "19:30",
    status: "pendente",
  },
  {
    id: 3,
    name: "Rock Cover Night",
    artist: "The Rockers",
    date: "2025-12-05",
    time: "21:00",
    status: "confirmado",
  },
  {
    id: 4,
    name: "MPB Ao Vivo",
    artist: "Duo Harmonia",
    date: "2025-12-07",
    time: "19:00",
    status: "confirmado",
  },
];

export function EstablishmentHome() {
  return (
    <div className="p-6 space-y-6">
      {/* Filtro de Data */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo de volta, Bar do João!</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" className="w-auto" defaultValue="2025-11-27" />
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Próximo Evento */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Próximo Evento Agendado</CardTitle>
            <Calendar className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-900">{nextEvent.name}</p>
              <p className="text-sm text-gray-600">{nextEvent.artist}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{nextEvent.date} às {nextEvent.time}</span>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {nextEvent.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Artistas Pendentes */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Artistas Pendentes</CardTitle>
            <Users className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-900">{pendingArtists.length} candidaturas</p>
              <p className="text-sm text-gray-600">Aguardando sua análise</p>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Ver Candidaturas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Total de Eventos */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Eventos</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-900">28 eventos</p>
              <p className="text-sm text-gray-600">Este mês</p>
              <p className="text-sm text-green-600 mt-2">↑ 12% vs. mês anterior</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Eventos da Semana */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900">Próximos Eventos da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{event.name}</p>
                    <p className="text-sm text-gray-600">{event.artist}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{event.date} às {event.time}</span>
                    </div>
                  </div>
                </div>
                <Badge
                  className={
                    event.status === "confirmado"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }
                >
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Artistas Pendentes para Análise */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900">Artistas Pendentes para Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingArtists.map((artist) => (
              <div
                key={artist.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${artist.name}`} />
                    <AvatarFallback>{artist.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-gray-900">{artist.name}</p>
                    <p className="text-sm text-gray-600">{artist.genre}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Ver Perfil
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Analisar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
