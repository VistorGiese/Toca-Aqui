import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, Star, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const reviews = [
  {
    id: 1,
    user: "Paula Oliveira",
    rating: 5,
    content: "Excelente apresentação! 5 estrelas.",
    entity: "Maria Silva",
    entityType: "Artista",
    date: "2024-11-23 15:20",
  },
  {
    id: 2,
    user: "Fernando Costa",
    rating: 4,
    content: "Ótimo ambiente, som de qualidade!",
    entity: "Blue Note Bar",
    entityType: "Estabelecimento",
    date: "2024-11-22 22:10",
  },
  {
    id: 3,
    user: "Juliana Rocha",
    rating: 5,
    content: "Banda espetacular! Energia incrível!",
    entity: "The Rockers",
    entityType: "Banda",
    date: "2024-11-21 21:45",
  },
];

export function Reviews() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Avaliações</h1>
          <p className="text-gray-500">
            Gerencie todas as avaliações do sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar avaliações..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-yellow-100 text-yellow-600">
                        {review.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.user}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-1">
                              {review.rating}.0
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                      <p className="text-gray-700 mb-2">{review.content}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {review.entityType}
                        </span>
                        <span className="text-xs text-gray-500">
                          em <span className="font-medium">{review.entity}</span>
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
