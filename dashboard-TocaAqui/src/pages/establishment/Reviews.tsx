import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";

const reviews = [
  {
    id: 1,
    artist: "Maria Silva",
    rating: 5,
    date: "2025-11-20",
    comment: "Excelente estabelecimento! Estrutura impecável e equipe muito profissional. Adorei tocar aqui!",
    helpful: 12,
  },
  {
    id: 2,
    artist: "Carlos Santos",
    rating: 4,
    date: "2025-11-15",
    comment: "Ótimo lugar, som de qualidade e público receptivo. Voltarei com certeza!",
    helpful: 8,
  },
  {
    id: 3,
    artist: "Ana Costa",
    rating: 5,
    date: "2025-11-10",
    comment: "Ambiente acolhedor e bem organizado. A equipe técnica é muito atenciosa. Recomendo!",
    helpful: 15,
  },
  {
    id: 4,
    artist: "João Oliveira",
    rating: 4,
    date: "2025-11-05",
    comment: "Boa experiência no geral. O palco tem um som excelente e a iluminação é de primeira.",
    helpful: 6,
  },
  {
    id: 5,
    artist: "Paula Mendes",
    rating: 5,
    date: "2025-10-28",
    comment: "Perfeito! Desde o primeiro contato até o fim do evento, tudo correu muito bem. Parabéns!",
    helpful: 20,
  },
];

const averageRating = 4.6;
const totalReviews = 47;

export function Reviews() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-gray-900">Avaliações Recebidas</h1>
        <p className="text-gray-600 mt-1">Veja o que os artistas dizem sobre seu estabelecimento</p>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Avaliação Média</CardTitle>
            <Star className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-gray-900">{averageRating}</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Avaliações</CardTitle>
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{totalReviews} avaliações</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Recomendações</CardTitle>
            <ThumbsUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">94% positivas</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.artist}`} />
                  <AvatarFallback>{review.artist.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-gray-900">{review.artist}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Útil ({review.helpful})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Responder
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
