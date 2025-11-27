import { Calendar, Clock, MapPin, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

const events = [
  {
    id: 1,
    name: "Noite de Jazz",
    artist: "Quinteto Blue Note",
    date: "2025-11-30",
    time: "20:00",
    status: "confirmado",
    location: "Sala Principal",
  },
  {
    id: 2,
    name: "Samba de Raiz",
    artist: "Grupo Saudade",
    date: "2025-12-02",
    time: "19:30",
    status: "pendente",
    location: "Área Externa",
  },
  {
    id: 3,
    name: "Rock Cover Night",
    artist: "The Rockers",
    date: "2025-12-05",
    time: "21:00",
    status: "confirmado",
    location: "Palco Principal",
  },
  {
    id: 4,
    name: "MPB Ao Vivo",
    artist: "Duo Harmonia",
    date: "2025-12-07",
    time: "19:00",
    status: "confirmado",
    location: "Sala Principal",
  },
  {
    id: 5,
    name: "Forró Pé de Serra",
    artist: "Trio Nordestino",
    date: "2025-12-10",
    time: "20:30",
    status: "cancelado",
    location: "Área Externa",
  },
];

export function Agenda() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-gray-900">Minhas Datas / Agenda</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os seus eventos agendados</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Calendar className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0">
                    <span className="text-xs">{new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                    <span className="text-2xl">{new Date(event.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-1">{event.name}</h3>
                    <p className="text-gray-600 mb-2">{event.artist}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                  <Badge
                    className={
                      event.status === "confirmado"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : event.status === "pendente"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {event.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
