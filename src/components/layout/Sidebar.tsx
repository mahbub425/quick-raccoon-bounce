import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home as HomeIcon, LayoutDashboard, FileText, CheckCircle, DollarSign, ClipboardList, BarChart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserProfile } from "@/types";

interface SidebarProps {
  onLinkClick?: () => void;
}

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserProfile['role'][]; // Roles that can see this menu item
}

const allSidebarNavItems: SidebarNavItem[] = [
  {
    title: "Home",
    href: "/home",
    icon: HomeIcon,
    roles: ["user", "mentor", "payment", "audit"],
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["user", "mentor", "payment", "audit"],
  },
  {
    title: "Voucher Entry",
    href: "/voucher-entry",
    icon: FileText,
    roles: ["user", "mentor", "payment", "audit"],
  },
  {
    title: "Approval", // Renamed from Mentor Approval
    href: "/mentor-approval",
    icon: CheckCircle,
    roles: ["mentor"], // Only for mentor
  },
  {
    title: "Payment",
    href: "/payment",
    icon: DollarSign,
    roles: ["payment"], // Only for payment
  },
  {
    title: "Final Check & Approval",
    href: "/final-check-approval",
    icon: ClipboardList,
    roles: ["audit"], // Only for audit
  },
  {
    title: "Report",
    href: "/report",
    icon: BarChart,
    roles: ["user", "mentor", "payment", "audit"], // Added for all roles
  },
];

const Sidebar = ({ onLinkClick }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavItems = React.useMemo(() => {
    if (!user) return [];
    return allSidebarNavItems.filter(item => item.roles.includes(user.role));
  }, [user]);

  // Adjust hrefs for role-specific paths
  const getAdjustedHref = (href: string) => {
    if (!user) return href;
    // Routes that should NOT be prefixed, as they are already role-specific top-level routes
    const roleSpecificTopLevelRoutes = ["/mentor-approval", "/payment", "/final-check-approval"];

    if (roleSpecificTopLevelRoutes.includes(href)) {
      return href; // Do not prefix these
    }

    // Apply role prefix to common user pages if the user is not a 'user' role
    // This list should include all routes that are shared across roles but need a prefix
    const commonUserPages = ["/home", "/dashboard", "/voucher-entry", "/selected-vouchers", "/cart", "/report"];
    
    if (user.role !== 'user' && commonUserPages.includes(href)) {
      if (user.role === 'mentor') return `/mentor${href}`;
      if (user.role === 'payment') return `/payment${href}`;
      if (user.role === 'audit') return `/audit${href}`;
    }
    return href;
  };

  return (
    <div className="flex h-full max-h-screen flex-col overflow-y-auto bg-sidebar p-4 text-sidebar-foreground">
      <div className="mb-6 text-2xl font-bold text-sidebar-primary">মেনু</div>
      <nav className="flex flex-col space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const adjustedHref = getAdjustedHref(item.href);
          return (
            <NavLink
              key={item.href}
              to={adjustedHref}
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