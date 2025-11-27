import { useState } from "react";
import { Outlet } from "react-router";
import { EstablishmentSidebar } from "../../components/establishment/EstablishmentSidebar";
import { EstablishmentHeader } from "../../components/establishment/EstablishmentHeader";

export function EstablishmentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <EstablishmentSidebar />
      </div>

      {/* Sidebar - Mobile */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden">
            <EstablishmentSidebar onClose={() => setIsSidebarOpen(false)} isMobile />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <EstablishmentHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
