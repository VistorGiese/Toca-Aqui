import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, MessageSquare, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const comments = [
  {
    id: 1,
    user: "Carlos Mendes",
    content: "Que show incrível! Voltarei com certeza.",
    entity: "Blue Note Bar",
    entityType: "Estabelecimento",
    date: "2024-11-23 18:30",
  },
  {
    id: 2,
    user: "Paula Oliveira",
    content: "Excelente apresentação! Muito talento.",
    entity: "Maria Silva",
    entityType: "Artista",
    date: "2024-11-23 15:20",
  },
  {
    id: 3,
    user: "Ricardo Lima",
    content: "Ambiente perfeito para música ao vivo!",
    entity: "The Cavern",
    entityType: "Estabelecimento",
    date: "2024-11-22 20:15",
  },
];

export function Comments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Comentários</h1>
          <p className="text-gray-500">
            Gerencie todos os comentários do sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar comentários..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {comment.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {comment.user}
                          </p>
                          <p className="text-xs text-gray-400">{comment.date}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {comment.entityType}
                        </span>
                        <span className="text-xs text-gray-500">
                          em <span className="font-medium">{comment.entity}</span>
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
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
