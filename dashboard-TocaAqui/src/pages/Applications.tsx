import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { StatusBadge } from "../components/StatusBadge";
import { Search, Filter, Calendar, User, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const applications = [
  {
    id: 1,
    artist: "João Santos",
    event: "Rock Night",
    establishment: "The Cavern",
    date: "2024-12-18",
    appliedDate: "2024-11-20",
    status: "pending" as const,
  },
  {
    id: 2,
    artist: "Pedro Alves",
    event: "Samba de Raiz",
    establishment: "Boteco do Samba",
    date: "2024-12-20",
    appliedDate: "2024-11-21",
    status: "pending" as const,
  },
  {
    id: 3,
    artist: "Maria Silva",
    event: "MPB ao Vivo",
    establishment: "Blue Note Bar",
    date: "2024-12-22",
    appliedDate: "2024-11-19",
    status: "approved" as const,
  },
  {
    id: 4,
    artist: "Rafael Souza",
    event: "Blues Session",
    establishment: "Blue Note Bar",
    date: "2024-12-25",
    appliedDate: "2024-11-18",
    status: "rejected" as const,
  },
];

export function Applications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Candidaturas</h1>
          <p className="text-gray-500">
            Gerencie todas as candidaturas de artistas para eventos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar candidaturas..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((application) => (
              <Card
                key={application.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-600 text-white">
                        {application.artist
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {application.artist}
                          </h3>
                          <p className="text-sm text-gray-500">
                            candidatou-se para{" "}
                            <span className="font-medium text-gray-700">
                              {application.event}
                            </span>
                          </p>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Evento: {application.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{application.establishment}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        Candidatura enviada em {application.appliedDate}
                      </p>
                      {application.status === "pending" && (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Aprovar
                          </Button>
                          <Button size="sm" variant="destructive">
                            Rejeitar
                          </Button>
                          <Button size="sm" variant="outline">
                            Ver Perfil
                          </Button>
                        </div>
                      )}
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
