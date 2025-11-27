import { Search, Menu, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";

interface EstablishmentHeaderProps {
  onMenuClick?: () => void;
}

export function EstablishmentHeader({ onMenuClick }: EstablishmentHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar artistas, eventos..."
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Quick Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/estabelecimento/configuracoes")}
            className="text-gray-600 hover:text-gray-900"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Bar do João</p>
              <p className="text-xs text-gray-500">Estabelecimento</p>
            </div>
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=Bar do João" />
              <AvatarFallback>BJ</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
