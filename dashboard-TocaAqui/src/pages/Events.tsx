import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { StatusBadge } from "../components/StatusBadge";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  MoreHorizontal,
} from "lucide-react";

const events = [
  {
    id: 1,
    name: "Noite de Jazz",
    establishment: "Blue Note Bar",
    artist: "Ana Costa",
    date: "2024-12-15",
    time: "20:00",
    status: "pending" as const,
  },
  {
    id: 2,
    name: "Rock Night",
    establishment: "The Cavern",
    artist: "The Rockers",
    date: "2024-12-18",
    time: "21:00",
    status: "approved" as const,
  },
  {
    id: 3,
    name: "Samba de Raiz",
    establishment: "Boteco do Samba",
    artist: "Samba de Classe",
    date: "2024-12-20",
    time: "19:30",
    status: "active" as const,
  },
  {
    id: 4,
    name: "MPB ao Vivo",
    establishment: "Blue Note Bar",
    artist: "Maria Silva",
    date: "2024-12-22",
    time: "20:30",
    status: "approved" as const,
  },
];

export function Events() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Eventos</h1>
          <p className="text-gray-500">Gerencie todos os eventos do sistema</p>
        </div>
        <Button>
          <Calendar className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar eventos..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center text-white">
                      <span className="text-2xl font-bold">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="text-xs uppercase">
                        {new Date(event.date).toLocaleDateString("pt-BR", {
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {event.name}
                        </h3>
                        <StatusBadge status={event.status} />
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.establishment}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Artista: {event.artist}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                        {event.status === "pending" && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Aprovar
                            </Button>
                            <Button size="sm" variant="destructive">
                              Rejeitar
                            </Button>
                          </>
                        )}
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
