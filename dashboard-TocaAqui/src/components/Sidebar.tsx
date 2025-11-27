import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Building2,
  Mic2,
  Music,
  Calendar,
  ClipboardList,
  MessageSquare,
  Star,
  Heart,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/users", label: "Usuários", icon: Users },
  { path: "/admin/establishments", label: "Estabelecimentos", icon: Building2 },
  { path: "/admin/artists", label: "Artistas", icon: Mic2 },
  { path: "/admin/bands", label: "Bandas", icon: Music },
  { path: "/admin/events", label: "Eventos", icon: Calendar },
  { path: "/admin/applications", label: "Candidaturas", icon: ClipboardList },
];

const socialItems = [
  { path: "/admin/comments", label: "Comentários", icon: MessageSquare },
  { path: "/admin/reviews", label: "Avaliações", icon: Star },
  { path: "/admin/favorites", label: "Favoritos", icon: Heart },
];

const bottomItems = [
  { path: "/admin/reports", label: "Relatórios", icon: BarChart3 },
  { path: "/admin/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto lg:block hidden">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Toca Aqui</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Social Section */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <p className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase">
            Social
          </p>
          {socialItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}