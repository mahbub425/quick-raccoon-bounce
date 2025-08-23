import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const location = useLocation();

  // Close sheet when navigating
  React.useEffect(() => {
    setIsSheetOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header>
        {/* Mobile Sidebar Trigger in Header */}
        {isMobile && user && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar onLinkClick={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
      </Header>

      {user ? ( // Only show sidebar and main content if logged in
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <aside className="w-64 bg-sidebar border-r border-sidebar-border shadow-md">
              <Sidebar />
            </aside>
          )}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      ) : ( // If not logged in, just show the outlet (login page)
        <main className="flex-1">
          <Outlet />
        </main>
      )}
    </div>
  );
};

export default Layout;