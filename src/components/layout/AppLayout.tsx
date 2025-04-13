"use client"

import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <Sidebar />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}