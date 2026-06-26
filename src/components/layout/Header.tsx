import { Menu, Bell, Search, User, ChevronDown, Settings, LogOut } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLayout } from "./LayoutContext"
import ProfileDrawerContent from "./drawers/ProfileDrawerContent"
import SettingsDrawerContent from "./drawers/SettingsDrawerContent"
import NotificationDetailContent from "./drawers/NotificationDetailContent"
import { getCurrentUser, logoutUser, ROLE_LABELS } from "../../shared/data/userStorage"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

interface Notif {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const navigate = useNavigate()
  const { openDrawer, closeDrawer } = useLayout()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  const userRef = useRef<HTMLDivElement | null>(null)
  const notifRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Actualizar usuario cada segundo para detectar cambios de login
    const interval = setInterval(() => {
      setCurrentUser(getCurrentUser())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const [notifications, setNotifications] = useState<Notif[]>([
    { id: "n1", title: "Nuevo proyecto asignado", message: "Se te asignó \u201cImplementación SAP\u201d.", time: "Hace 5 min", read: false },
    { id: "n2", title: "Aprobación pendiente", message: "Tienes 2 solicitudes por revisar.", time: "Hace 1 hora", read: false },
    { id: "n3", title: "Recordatorio", message: "Reunión de seguimiento 3:00 PM.", time: "Hace 2 horas", read: true },
  ])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (userRef.current && !userRef.current.contains(t)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleOpenProfile = () => {
    setUserMenuOpen(false)
    openDrawer({
      title: "Mi perfil",
      subtitle: "Editar información del usuario",
      widthClassName: "w-[460px]",
      header: { title: "Perfil", subtitle: "Información del usuario" },
      content: <ProfileDrawerContent onClose={closeDrawer} />,
    })
  }

  const handleOpenSettings = () => {
    setUserMenuOpen(false)
    openDrawer({
      title: "Configuración",
      subtitle: "Preferencias del sistema",
      widthClassName: "w-[520px]",
      header: { title: "Configuración", subtitle: "Preferencias del usuario" },
      content: <SettingsDrawerContent onClose={closeDrawer} />,
    })
  }
  const handleOpenNotifDetail = (n: Notif) => {
    markAsRead(n.id)
    setNotifOpen(false)
    openDrawer({
      title: "Detalle de notificación",
      subtitle: n.title,
      widthClassName: "w-[520px]",
      header: { title: "Notificaciones", subtitle: "Detalle" },
      content: (
        <NotificationDetailContent
          notification={n}
          onMarkAsRead={markAsRead}
          onClose={closeDrawer}
        />
      ),
    })
  }
const handleLogout = () => {
  setUserMenuOpen(false)
  setNotifOpen(false)
  closeDrawer()

  logoutUser()
  setCurrentUser(null)

  window.location.replace("/login")
}
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm relative z-[120]">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <div className="h-8 w-px bg-gray-300 hidden sm:block" />
        <div className="h-8 md:h-11 flex items-center">
          <span className="text-lg font-bold text-brand-primary tracking-tight">AMCOR</span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-xl mx-6">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Buscar\u2026 (Ctrl + K)"
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Notificaciones"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-[130] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
                <button
                  onClick={() => setNotifications((p) => p.map((n) => ({ ...n, read: true })))}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Marcar todas como leídas
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gray-50"
                      onClick={() => handleOpenNotifDetail(n)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1.5 w-2 h-2 rounded-full ${n.read ? "bg-gray-300" : "bg-blue-600"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                        </div>
                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markAsRead(n.id) }}
                            className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-white text-gray-600"
                          >
                            Leída
                          </button>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Usuario */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Men\u00fa de usuario"
          >
            <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currentUser ? (currentUser.fullName.split(" ")[0]?.charAt(0) || "U") + (currentUser.fullName.split(" ")[1]?.charAt(0) || "") : "U"}
              </span>
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser ? currentUser.fullName : "Invitado"}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser ? ROLE_LABELS[currentUser.role] : "Sin rol"}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-[130] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser ? currentUser.fullName : "Invitado"}
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser ? currentUser.email : "Sin email"}
                </p>
              </div>
              <div className="py-2">
                <button onClick={handleOpenProfile} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User size={16} className="text-gray-500" />
                  Ver perfil
                </button>
                <button onClick={handleOpenSettings} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings size={16} className="text-gray-500" />
                  Configuración
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
