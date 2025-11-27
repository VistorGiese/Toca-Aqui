import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Users,
  Mic2,
  Building2,
  Music,
  Calendar,
  ClipboardList,
  Star,
  MessageSquare,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data para gráficos
const userGrowthData = [
  { week: "Sem 1", users: 120 },
  { week: "Sem 2", users: 145 },
  { week: "Sem 3", users: 165 },
  { week: "Sem 4", users: 189 },
  { week: "Sem 5", users: 210 },
  { week: "Sem 6", users: 245 },
  { week: "Sem 7", users: 278 },
  { week: "Sem 8", users: 312 },
];

const eventsData = [
  { month: "Jan", events: 12 },
  { month: "Fev", events: 15 },
  { month: "Mar", events: 22 },
  { month: "Abr", events: 18 },
  { month: "Mai", events: 25 },
  { month: "Jun", events: 30 },
];

// Mock data para eventos pendentes
const pendingEvents = [
  {
    id: 1,
    name: "Noite de Jazz",
    establishment: "Blue Note Bar",
    date: "2024-12-15",
    status: "pending" as const,
  },
  {
    id: 2,
    name: "Rock Night",
    establishment: "The Cavern",
    date: "2024-12-18",
    status: "pending" as const,
  },
  {
    id: 3,
    name: "Samba de Raiz",
    establishment: "Boteco do Samba",
    date: "2024-12-20",
    status: "pending" as const,
  },
];

// Mock data para últimos artistas
const recentArtists = [
  {
    id: 1,
    name: "Maria Silva",
    genre: "MPB",
    city: "São Paulo",
    date: "2024-11-22",
  },
  {
    id: 2,
    name: "João Santos",
    genre: "Rock",
    city: "Rio de Janeiro",
    date: "2024-11-21",
  },
  {
    id: 3,
    name: "Ana Costa",
    genre: "Jazz",
    city: "Belo Horizonte",
    date: "2024-11-20",
  },
];

// Mock data para interações sociais
const recentInteractions = [
  {
    id: 1,
    type: "comment",
    user: "Carlos Mendes",
    content: "Que show incrível! Voltarei com certeza.",
    entity: "Blue Note Bar",
    time: "2 horas atrás",
  },
  {
    id: 2,
    type: "review",
    user: "Paula Oliveira",
    content: "Excelente apresentação! 5 estrelas.",
    entity: "Maria Silva",
    time: "5 horas atrás",
  },
  {
    id: 3,
    type: "comment",
    user: "Ricardo Lima",
    content: "Ambiente perfeito para música ao vivo!",
    entity: "The Cavern",
    time: "1 dia atrás",
  },
];

export function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">
          Visão geral do sistema Toca Aqui
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Usuários"
          value="1,284"
          icon={Users}
          trend={{ value: "12%", isPositive: true }}
          iconColor="bg-blue-500"
        />
        <MetricCard
          title="Total de Artistas"
          value="342"
          icon={Mic2}
          trend={{ value: "8%", isPositive: true }}
          iconColor="bg-purple-500"
        />
        <MetricCard
          title="Estabelecimentos"
          value="156"
          icon={Building2}
          trend={{ value: "5%", isPositive: true }}
          iconColor="bg-indigo-500"
        />
        <MetricCard
          title="Bandas"
          value="89"
          icon={Music}
          trend={{ value: "3%", isPositive: true }}
          iconColor="bg-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Eventos Ativos"
          value="47"
          icon={Calendar}
          iconColor="bg-green-500"
        />
        <MetricCard
          title="Candidaturas Pendentes"
          value="23"
          icon={ClipboardList}
          iconColor="bg-orange-500"
        />
        <MetricCard
          title="Avaliações Recentes"
          value="156"
          icon={Star}
          iconColor="bg-yellow-500"
        />
        <MetricCard
          title="Comentários Recentes"
          value="89"
          icon={MessageSquare}
          iconColor="bg-pink-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Events Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Criados por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="events" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Eventos Pendentes</CardTitle>
            <Button variant="ghost" size="sm">
              Ver todos <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.name}</p>
                    <p className="text-sm text-gray-500">
                      {event.establishment}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{event.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={event.status} />
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Artists */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimos Artistas Cadastrados</CardTitle>
            <Button variant="ghost" size="sm">
              Ver todos <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                      <Mic2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{artist.name}</p>
                      <p className="text-sm text-gray-500">
                        {artist.genre} • {artist.city}
                      </p>
                      <p className="text-xs text-gray-400">{artist.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Interactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Interações Sociais Recentes</CardTitle>
          <Button variant="ghost" size="sm">
            Ver todas <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    interaction.type === "comment"
                      ? "bg-blue-100"
                      : "bg-yellow-100"
                  }`}
                >
                  {interaction.type === "comment" ? (
                    <MessageSquare
                      className={`w-5 h-5 ${
                        interaction.type === "comment"
                          ? "text-blue-600"
                          : "text-yellow-600"
                      }`}
                    />
                  ) : (
                    <Star className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">
                      {interaction.user}
                    </p>
                    <p className="text-xs text-gray-400">{interaction.time}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {interaction.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    Em: {interaction.entity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
