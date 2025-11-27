import { NavLink, useNavigate } from "react-router";
import { Home, Calendar, Users, FileText, Star, Settings, Music, X, LogOut } from "lucide-react";
import { Button } from "../ui/button";

interface EstablishmentSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const menuItems = [
  { icon: Home, label: "Home", path: "/estabelecimento" },
  { icon: Calendar, label: "Minhas Datas / Agenda", path: "/estabelecimento/agenda" },
  { icon: Users, label: "Artistas Disponíveis", path: "/estabelecimento/artistas" },
  { icon: FileText, label: "Minhas Contratações", path: "/estabelecimento/contratacoes" },
  { icon: Star, label: "Avaliações Recebidas", path: "/estabelecimento/avaliacoes" },
  { icon: Settings, label: "Configurações", path: "/estabelecimento/configuracoes" },
];

export function EstablishmentSidebar({ onClose, isMobile }: EstablishmentSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (isMobile && onClose) {
      onClose();
    }
    navigate("/");
  };

  return (
    <aside className="h-full bg-gradient-to-b from-blue-600 to-purple-700 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white">Toca Aqui</h1>
              <p className="text-xs text-blue-100">Estabelecimento</p>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/estabelecimento"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-white/20 text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`
            }
            onClick={isMobile ? onClose : undefined}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-200 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}