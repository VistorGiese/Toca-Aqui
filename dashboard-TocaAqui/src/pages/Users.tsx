import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, UserPlus, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const users = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@example.com",
    role: "Artista",
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@example.com",
    role: "Estabelecimento",
    status: "active",
    joinDate: "2024-02-20",
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    email: "carlos.oliveira@example.com",
    role: "Artista",
    status: "active",
    joinDate: "2024-03-10",
  },
];

export function Users() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Usuários</h1>
          <p className="text-gray-500">Gerencie todos os usuários do sistema</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar usuários..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Usuário
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Tipo
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">
                    Data de Cadastro
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-600">{user.role}</td>
                    <td className="p-4 text-gray-600">{user.joinDate}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
