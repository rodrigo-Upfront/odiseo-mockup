import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  BriefcaseBusiness,
  Building2,
  Users,
  LifeBuoy,
  Settings2,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCurrentUser, type UserRole } from "../../shared/data/userStorage";

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

interface SidebarProps {
  isOpen: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { path: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { path: "/clients", label: "Clientes", icon: Building2 },
  { path: "/portfolio", label: "Portafolio", icon: FolderKanban },
  { path: "/products", label: "Productos", icon: BriefcaseBusiness },
  { path: "/users", label: "Usuarios", icon: Users },
  { path: "/catalogs", label: "Catálogos", icon: BookOpen },
];

const BOTTOM_ITEMS: MenuItem[] = [
  { path: "/soporte", label: "Soporte TI", icon: LifeBuoy },
  { path: "/configuracion", label: "Configuración", icon: Settings2 },
];

const SidebarItem = ({
  item,
  isOpen,
  isActive,
}: {
  item: MenuItem;
  isOpen: boolean;
  isActive: boolean;
}) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      title={!isOpen ? item.label : undefined}
      className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
        isActive
          ? "bg-[#00324d] text-white font-semibold"
          : "text-slate-300 hover:bg-[#00324d] hover:text-white"
      }`}
    >
      <Icon size={22} className="shrink-0" />

      {isOpen && (
        <span className="truncate">
          {item.label}
        </span>
      )}
    </Link>
  );
};

export default function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const currentUser = getCurrentUser();

  const isRouteActive = (path: string) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const visibleMenuItems = MENU_ITEMS.filter(
    (item) => !item.roles || (currentUser && item.roles.includes(currentUser.role))
  );

  const visibleBottomItems = BOTTOM_ITEMS.filter(
    (item) => !item.roles || (currentUser && item.roles.includes(currentUser.role))
  );

  return (
    <aside
      className={`h-full bg-brand-primary transition-all duration-300 ${
        isOpen ? "w-72" : "w-20"
      }`}
    >
      <nav className="flex h-full flex-col justify-between py-6">
        <div className="space-y-1">
          {visibleMenuItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              isOpen={isOpen}
              isActive={isRouteActive(item.path)}
            />
          ))}
        </div>

        <div className="space-y-1">
          {visibleBottomItems.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              isOpen={isOpen}
              isActive={isRouteActive(item.path)}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}