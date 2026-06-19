"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Image as ImageIcon,
  Trophy,
  RefreshCw,
  PlusCircle,
  FileText,
  PhoneCall,
  Settings,
  Sparkles
} from "lucide-react"

interface DashboardStats {
  totalCourses: number
  totalGallery: number
  totalAchievements: number
}

interface RecentActivity {
  type: "course" | "gallery" | "achievement" | "contact" | "homepage"
  title: string
  subtitle: string
  time: string
}

export default function AdminDashboardOverviewPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalGallery: 0,
    totalAchievements: 0,
  })
  const [activities, setActivities] = useState<RecentActivity[]>([])

  const fetchCMSData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Total Courses
      const { count: courseCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })

      // 2. Total Gallery
      const { count: galleryCount } = await supabase
        .from("gallery")
        .select("*", { count: "exact", head: true })

      // 3. Total Achievements
      const { count: achievementCount } = await supabase
        .from("achievements")
        .select("*", { count: "exact", head: true })

      setStats({
        totalCourses: courseCount || 0,
        totalGallery: galleryCount || 0,
        totalAchievements: achievementCount || 0,
      })

      // Construct Mock/Recent Updates timeline based on database content logs
      const updates: RecentActivity[] = []

      const { data: latestCourse } = await supabase
        .from("courses")
        .select("title, created_at")
        .order("created_at", { ascending: false })
        .limit(1)

      if (latestCourse && latestCourse.length > 0) {
        updates.push({
          type: "course",
          title: "New Course Batch Added",
          subtitle: `Batch "${latestCourse[0].title}" was successfully created`,
          time: new Date(latestCourse[0].created_at).toLocaleDateString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      }

      const { data: latestGallery } = await supabase
        .from("gallery")
        .select("caption, created_at")
        .order("created_at", { ascending: false })
        .limit(1)

      if (latestGallery && latestGallery.length > 0) {
        updates.push({
          type: "gallery",
          title: "New Photo Uploaded",
          subtitle: latestGallery[0].caption || "A new media asset was added to the public gallery",
          time: new Date(latestGallery[0].created_at).toLocaleDateString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      }

      const { data: latestAchievement } = await supabase
        .from("achievements")
        .select("name, rank, created_at")
        .order("created_at", { ascending: false })
        .limit(1)

      if (latestAchievement && latestAchievement.length > 0) {
        updates.push({
          type: "achievement",
          title: "Topper Achievement Published",
          subtitle: `${latestAchievement[0].name} - ${latestAchievement[0].rank} was logged`,
          time: new Date(latestAchievement[0].created_at).toLocaleDateString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      }

      setActivities(updates)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCMSData()
  }, [fetchCMSData])

  return (
    <div className="space-y-8 animate-fadeIn text-sm">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2.5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            CMS Control Desk
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </h1>
          <p className="text-slate-500 text-sm">Welcome to Adhitya NEET Academy website control panel. Easily update content without editing code.</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchCMSData}
          disabled={loading}
          className="border-slate-250 text-slate-600 flex items-center gap-2 rounded-xl h-12 px-5 shrink-0 relative z-10 font-bold text-sm w-full md:w-auto justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Courses */}
        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Courses</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary border border-blue-100">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-extrabold text-slate-900">
              {loading ? "..." : stats.totalCourses}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase">Active Batches</p>
          </CardContent>
        </Card>

        {/* Total Gallery */}
        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gallery Media</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <ImageIcon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-extrabold text-slate-900">
              {loading ? "..." : stats.totalGallery}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase">Assets Uploaded</p>
          </CardContent>
        </Card>

        {/* Total Achievements */}
        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Achievements</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <Trophy className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-extrabold text-slate-900">
              {loading ? "..." : stats.totalAchievements}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase">Toppers Published</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800 text-sm font-bold">Quick Page Actions</CardTitle>
            <CardDescription className="text-xs">Quick shortcuts to manage key sections of the website.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              asChild
              className="h-14 bg-slate-900 hover:bg-slate-850 text-white flex items-center justify-start gap-4 px-6 rounded-xl text-left"
            >
              <Link href="/admin/dashboard/home">
                <FileText className="w-5 h-5 shrink-0 text-accent" />
                <div>
                  <div className="font-semibold text-xs text-white">Homepage Hero</div>
                  <div className="text-[10px] text-slate-400 font-medium">Edit title, description, sliders</div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              className="h-14 bg-primary hover:bg-primary/95 text-white flex items-center justify-start gap-4 px-6 rounded-xl text-left"
            >
              <Link href="/admin/dashboard/courses">
                <PlusCircle className="w-5 h-5 shrink-0 text-white" />
                <div>
                  <div className="font-semibold text-xs text-white">Publish Course</div>
                  <div className="text-[10px] text-white/70 font-medium">Add repeaters or crash batches</div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              className="h-14 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 flex items-center justify-start gap-4 px-6 rounded-xl text-left"
            >
              <Link href="/admin/dashboard/contact">
                <PhoneCall className="w-5 h-5 shrink-0 text-primary" />
                <div>
                  <div className="font-semibold text-xs text-slate-800">Contact CMS</div>
                  <div className="text-[10px] text-slate-400 font-medium font-semibold">Change phone numbers & maps</div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              className="h-14 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 flex items-center justify-start gap-4 px-6 rounded-xl text-left"
            >
              <Link href="/admin/dashboard/gallery">
                <ImageIcon className="w-5 h-5 shrink-0 text-indigo-500" />
                <div>
                  <div className="font-semibold text-xs text-slate-800">Gallery CMS</div>
                  <div className="text-[10px] text-slate-400 font-medium font-semibold">Manage campus photographs</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Updates Panel */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800 text-sm font-bold">Recent Updates</CardTitle>
            <CardDescription className="text-xs">Timeline of content published on the site.</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                No recent updates logged.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act, idx) => (
                  <div key={idx} className="flex gap-4 items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                        act.type === "course"
                          ? "bg-blue-50 border-blue-100 text-primary"
                          : act.type === "gallery"
                          ? "bg-indigo-50 border-indigo-100 text-indigo-650"
                          : "bg-amber-50 border-amber-100 text-amber-600"
                      }`}
                    >
                      {act.type === "course" ? (
                        <BookOpen className="w-4 h-4" />
                      ) : act.type === "gallery" ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <Trophy className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{act.title}</h4>
                      <p className="text-[11px] text-slate-450 mt-0.5 leading-tight line-clamp-1">{act.subtitle}</p>
                      <span className="text-[9px] font-semibold text-slate-400 mt-1 block">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
