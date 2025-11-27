import { FileText, Calendar, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

const contracts = [
  {
    id: 1,
    artist: "Maria Silva",
    event: "Noite de MPB",
    date: "2025-11-30",
    value: "R$ 2.000,00",
    status: "ativo",
    signed: true,
  },
  {
    id: 2,
    artist: "Carlos Santos",
    event: "Rock Cover Night",
    date: "2025-12-05",
    value: "R$ 1.500,00",
    status: "pendente",
    signed: false,
  },
  {
    id: 3,
    artist: "Ana Costa",
    event: "Samba de Raiz",
    date: "2025-12-02",
    value: "R$ 2.500,00",
    status: "ativo",
    signed: true,
  },
  {
    id: 4,
    artist: "João Oliveira",
    event: "Noite de Jazz",
    date: "2025-12-07",
    value: "R$ 2.200,00",
    status: "ativo",
    signed: true,
  },
  {
    id: 5,
    artist: "Paula Mendes",
    event: "Forró Pé de Serra",
    date: "2025-12-10",
    value: "R$ 1.300,00",
    status: "concluído",
    signed: true,
  },
];

export function Contracts() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-gray-900">Minhas Contratações</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os contratos e contratações</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <FileText className="w-4 h-4 mr-2" />
          Nova Contratação
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Contratos Ativos</CardTitle>
            <FileText className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">3 contratos</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Aguardando Assinatura</CardTitle>
            <Clock className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">1 contrato</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Valor Total</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">R$ 9.500,00</p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contract.artist}`} />
                    <AvatarFallback>{contract.artist.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-gray-900">{contract.event}</h3>
                        <p className="text-sm text-gray-600">{contract.artist}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(contract.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{contract.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                  <div className="space-y-2">
                    <Badge
                      className={
                        contract.status === "ativo"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : contract.status === "pendente"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {contract.status}
                    </Badge>
                    {contract.signed && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 block">
                        Assinado
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    {!contract.signed && (
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Assinar
                      </Button>
                    )}
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
