"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Landmark,
  BookOpen,
  Image as ImageIcon,
  Trophy,
  PhoneCall,
  LogOut,
  Menu,
  X,
  UserCheck
} from "lucide-react"

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<any>
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Home Page", href: "/admin/dashboard/home", icon: FileText },
  { name: "Courses", href: "/admin/dashboard/courses", icon: BookOpen },
  { name: "Gallery", href: "/admin/dashboard/gallery", icon: ImageIcon },
  { name: "Achievements", href: "/admin/dashboard/achievements", icon: Trophy },
  { name: "Contact Information", href: "/admin/dashboard/contact", icon: PhoneCall },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [adminName, setAdminName] = useState("Academy Admin")

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAdminName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin")
      }
    }
    fetchUser()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800 shadow-xl">
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none text-white">ADHITYA NEET</h1>
            <span className="text-[10px] font-semibold text-primary uppercase tracking-widest mt-1 block">ADMIN CMS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-450 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-450 group-hover:text-white"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer profile & logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between gap-3 px-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-primary font-bold text-xs border border-slate-700">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{adminName}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-red-950/20 hover:text-red-400 border border-slate-700 text-slate-350 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/60 backdrop-blur-sm">
          <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl relative animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-755 text-white border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white leading-none">ADHITYA NEET</h1>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1 block">ADMIN CMS</span>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-slate-450 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between gap-3 px-2 mb-3">
                <span className="text-xs font-semibold text-slate-200 truncate">{adminName}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20 font-bold uppercase tracking-wider">CMS</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-red-950/20 hover:text-red-400 border border-slate-700 text-slate-350 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)}></div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 lg:px-8 relative z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {sidebarItems.find((item) => pathname === item.href)?.name || "CMS Control Panel"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-700 leading-none">{adminName}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">CMS Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner text-sm">
              {adminName[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Views */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
