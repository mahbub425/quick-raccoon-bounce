import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home as HomeIcon, LayoutDashboard, FileText, CheckCircle, DollarSign, ClipboardList, BarChart } from "lucide-react";

interface SidebarProps {
  onLinkClick?: () => void;
}

const sidebarNavItems = [
  {
    title: "Home",
    href: "/home",
    icon: HomeIcon,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Voucher Entry",
    href: "/voucher-entry",
    icon: FileText,
  },
  {
    title: "Mentor Approval",
    href: "/mentor-approval",
    icon: CheckCircle,
  },
  {
    title: "Payment",
    href: "/payment",
    icon: DollarSign,
  },
  {
    title: "Final Check & Approval",
    href: "/final-check-approval",
    icon: ClipboardList,
  },
  {
    title: "Report",
    href: "/report",
    icon: BarChart,
  },
];

const Sidebar = ({ onLinkClick }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className="flex h-full max-h-screen flex-col overflow-y-auto bg-sidebar p-4 text-sidebar-foreground">
      <div className="mb-6 text-2xl font-bold text-sidebar-primary">মেনু</div>
      <nav className="flex flex-col space-y-2">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onLinkClick}
              className={({ isActive: navIsActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  navIsActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;