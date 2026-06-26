// src/components/layout/LayoutContext.tsx

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"

export type LayoutHeaderState = {
  title: string
  subtitle?: string
  actions?: ReactNode
  tabs?: ReactNode
  toolbar?: ReactNode
  breadcrumbs?: { label: string; href?: string; path?: string }[]
  badges?: ReactNode
  progress?: {
    percentage: number
    label: string
  }
}

type DrawerState = {
  open: boolean
  title?: string
  subtitle?: string
  widthClassName?: string
  content?: ReactNode
}

type OpenDrawerArgs = {
  title?: string
  subtitle?: string
  widthClassName?: string
  content: ReactNode
  header?: LayoutHeaderState
}

type LayoutContextValue = {
  header: LayoutHeaderState
  setHeader: (next: LayoutHeaderState) => void
  resetHeader: () => void
  drawer: DrawerState
  openDrawer: (args: OpenDrawerArgs) => void
  closeDrawer: () => void
}

const DEFAULT_HEADER: LayoutHeaderState = {
  title: "Portal",
  subtitle: undefined,
  actions: undefined,
  tabs: undefined,
  toolbar: undefined,
  breadcrumbs: undefined,
  badges: undefined,
  progress: undefined,
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [baseHeader, setBaseHeader] =
    useState<LayoutHeaderState>(DEFAULT_HEADER)

  const [overlayHeader, setOverlayHeader] =
    useState<LayoutHeaderState | null>(null)

  const [drawer, setDrawer] = useState<DrawerState>({
    open: false,
    title: undefined,
    subtitle: undefined,
    widthClassName: "w-[420px]",
    content: null,
  })

  const header = overlayHeader ?? baseHeader

  const setHeader = useCallback((next: LayoutHeaderState) => {
    setBaseHeader({
      ...DEFAULT_HEADER,
      ...next,
    })
  }, [])

  const resetHeader = useCallback(() => {
    setBaseHeader(DEFAULT_HEADER)
  }, [])

  const openDrawer = useCallback((args: OpenDrawerArgs) => {
    setDrawer({
      open: true,
      title: args.title,
      subtitle: args.subtitle,
      widthClassName: args.widthClassName ?? "w-[420px]",
      content: args.content,
    })

    if (args.header) {
      setOverlayHeader({
        ...DEFAULT_HEADER,
        ...args.header,
      })
    }
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawer((currentDrawer) => ({
      ...currentDrawer,
      open: false,
      content: null,
    }))

    setOverlayHeader(null)
  }, [])

  const value = useMemo<LayoutContextValue>(
    () => ({
      header,
      setHeader,
      resetHeader,
      drawer,
      openDrawer,
      closeDrawer,
    }),
    [header, setHeader, resetHeader, drawer, openDrawer, closeDrawer],
  )

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayout = () => {
  const ctx = useContext(LayoutContext)

  if (!ctx) {
    throw new Error("useLayout debe usarse dentro de <LayoutProvider />")
  }

  return ctx
}