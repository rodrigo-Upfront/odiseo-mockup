// src/components/layout/Layout.tsx

import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import SubHeader from "./SubHeader"
import { LayoutProvider, useLayout } from "./LayoutContext"
import Drawer from "../ui/Drawer"

const LayoutShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { header, drawer, closeDrawer } = useLayout()

  const sidebarColWidth = sidebarOpen ? "w-72" : "w-20"

  return (
    <div className="h-dvh overflow-hidden bg-gray-50 isolate">
      <div className="grid h-full min-h-0 grid-cols-[auto_1fr] grid-rows-[64px_1fr]">
        {/* Header principal */}
        <div className="relative z-[100] col-span-2 row-start-1">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* Sidebar */}
        <div
          className={`row-start-2 col-start-1 z-20 min-h-0 ${sidebarColWidth}`}
        >
          <Sidebar isOpen={sidebarOpen} />
        </div>

        {/* Contenido principal */}
        <main className="relative z-0 col-start-2 row-start-2 min-h-0 min-w-0 overflow-y-auto">
          <SubHeader
            title={header.title}
            subtitle={header.subtitle}
            actions={header.actions}
            tabs={header.tabs}
            toolbar={header.toolbar}
            breadcrumbs={header.breadcrumbs}
            badges={header.badges}
            progress={header.progress}
          />

          <div className="px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Drawer
        open={drawer.open}
        title={drawer.title}
        subtitle={drawer.subtitle}
        widthClassName={drawer.widthClassName}
        onClose={closeDrawer}
      >
        {drawer.content}
      </Drawer>
    </div>
  )
}

export default function Layout() {
  return (
    <LayoutProvider>
      <LayoutShell />
    </LayoutProvider>
  )
}