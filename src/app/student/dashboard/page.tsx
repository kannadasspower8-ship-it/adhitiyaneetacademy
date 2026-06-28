"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Download,
  LogOut,
  RefreshCw,
  GraduationCap,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  Target,
  Zap,
  ChevronRight,
  Minus
} from "lucide-react"
import { toast } from "@/lib/toast"
import { LineChart } from "@/components/shared/SVGCharts"
import * as XLSX from "xlsx"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  return "Good Evening"
}

const motivationalQuotes: Record<string, string> = {
  "Improving": "Keep pushing! Your consistency is paying off. 🔥",
  "Needs Improvement": "Every expert was once a beginner. Focus on weak areas and keep practicing! 💪",
  "Stable": "Solid consistency! Now aim a little higher each test. 🎯"
}

// Mini sparkline SVG for subject cards
function MiniSparkline({ values, color }: { values: number[], color: string }) {
  if (values.length < 2) return null
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const w = 80
  const h = 28
  const pad = 2

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return { x, y }
  })

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-60">
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2.5} fill={color} />
    </svg>
  )
}

// Circular progress ring for latest score
function ProgressRing({ percentage, size = 52, strokeWidth = 5, color }: { percentage: number, size?: number, strokeWidth?: number, color: string }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedPct = Math.max(0, Math.min(100, percentage))
  const offset = circumference - (clampedPct / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">
        {Math.round(clampedPct)}%
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function StudentDashboardPage() {
  const router = useRouter()

  const [student, setStudent] = useState<any>(null)
  const [marks, setMarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeSubject, setActiveSubject] = useState<string | null>(null)
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null)

  useEffect(() => {
    setExpandedTestId(null)
  }, [activeSubject])

  // Load cache immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedStudent = localStorage.getItem("student-portal-profile")
      const cachedMarks = localStorage.getItem("student-portal-marks")
      if (cachedStudent) {
        setStudent(JSON.parse(cachedStudent))
      }
      if (cachedMarks) {
        setMarks(JSON.parse(cachedMarks))
        setLoading(false)
      }
    }
  }, [])

  const fetchStudentData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    else setIsSyncing(true)

    try {
      const res = await fetch("/api/student/dashboard-data")
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login")
          return
        }
        throw new Error("Failed to fetch dashboard data")
      }

      const data = await res.json()
      setStudent(data.student)
      setMarks(data.marks)

      if (typeof window !== "undefined") {
        localStorage.setItem("student-portal-profile", JSON.stringify(data.student))
        localStorage.setItem("student-portal-marks", JSON.stringify(data.marks))
      }
    } catch (err: any) {
      console.error("Error loading student data:", err)
      toast.error(`Error loading data: ${err.message}`)
    } finally {
      setLoading(false)
      setIsSyncing(false)
    }
  }, [router])

  useEffect(() => {
    const hasCache = typeof window !== "undefined" && localStorage.getItem("student-portal-marks")
    fetchStudentData(!!hasCache)
  }, [fetchStudentData])

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/student/logout", { method: "POST" })
      if (res.ok) {
        localStorage.removeItem("student-portal-profile")
        localStorage.removeItem("student-portal-marks")
        router.push("/login")
        router.refresh()
      } else {
        throw new Error("Logout request failed")
      }
    } catch (err: any) {
      toast.error(`Logout failed: ${err.message}`)
    }
  }

  // Sort marks chronologically for trend processing
  const sortedMarks = useMemo(() => {
    return [...marks].sort((a, b) => new Date(a.test_date || 0).getTime() - new Date(b.test_date || 0).getTime())
  }, [marks])

  // Group marks by category
  const biologyTests = useMemo(() => sortedMarks.filter(m => m.test_type === "weekly_biology"), [sortedMarks])
  const chemistryTests = useMemo(() => sortedMarks.filter(m => m.test_type === "weekly_chemistry"), [sortedMarks])
  const physicsTests = useMemo(() => sortedMarks.filter(m => m.test_type === "weekly_physics"), [sortedMarks])
  const grandTests = useMemo(() => sortedMarks.filter(m => m.test_type === "grand"), [sortedMarks])

  // Get latest record helper
  const getLatestRecord = (tests: any[]) => {
    if (tests.length === 0) return null
    return tests[tests.length - 1]
  }

  // Compute trend for a test array
  const getTrend = (tests: any[]) => {
    const pcts = tests.map(t => t.percentage || 0)
    const len = pcts.length
    if (len < 2) return "stable"
    const recent = pcts[len - 1]
    const prev = pcts[len - 2]
    const diff = recent - prev
    if (diff > 3) return "up"
    if (diff < -3) return "down"
    return "stable"
  }

  // Subject configurations
  const subjectsConfig = useMemo(() => [
    {
      id: "biology",
      name: "Biology",
      icon: "🧬",
      gradient: "from-emerald-500 to-teal-600",
      gradientLight: "from-emerald-50 to-teal-50",
      accentColor: "#10B981",
      borderColor: "border-emerald-200",
      bgAccent: "bg-emerald-500",
      tests: biologyTests,
      max: 200,
    },
    {
      id: "chemistry",
      name: "Chemistry",
      icon: "🧪",
      gradient: "from-blue-500 to-indigo-600",
      gradientLight: "from-blue-50 to-indigo-50",
      accentColor: "#3B82F6",
      borderColor: "border-blue-200",
      bgAccent: "bg-blue-500",
      tests: chemistryTests,
      max: 180,
    },
    {
      id: "physics",
      name: "Physics",
      icon: "⚛️",
      gradient: "from-amber-500 to-orange-600",
      gradientLight: "from-amber-50 to-orange-50",
      accentColor: "#F59E0B",
      borderColor: "border-amber-200",
      bgAccent: "bg-amber-500",
      tests: physicsTests,
      max: 180,
    },
    {
      id: "grand",
      name: "Grand Test",
      icon: "🏆",
      gradient: "from-violet-500 to-purple-600",
      gradientLight: "from-violet-50 to-purple-50",
      accentColor: "#8B5CF6",
      borderColor: "border-violet-200",
      bgAccent: "bg-violet-500",
      tests: grandTests,
      max: 720,
    }
  ], [biologyTests, chemistryTests, physicsTests, grandTests])

  // Quick stats
  const quickStats = useMemo(() => {
    const totalTests = marks.length
    const avgPct = totalTests > 0 ? Math.round(marks.reduce((a, m) => a + (m.percentage || 0), 0) / totalTests) : 0
    const highestScore = totalTests > 0 ? Math.max(...marks.map(m => m.percentage || 0)) : 0

    // Find best subject by average percentage
    const subjectAvgs = subjectsConfig
      .filter(s => s.tests.length > 0)
      .map(s => ({
        name: s.name,
        icon: s.icon,
        avg: Math.round(s.tests.reduce((a, t) => a + (t.percentage || 0), 0) / s.tests.length)
      }))
      .sort((a, b) => b.avg - a.avg)

    const bestSubject = subjectAvgs[0] || null

    return { totalTests, avgPct, highestScore, bestSubject }
  }, [marks, subjectsConfig])

  // Selected subject details computations
  const currentSubjectData = useMemo(() => {
    if (!activeSubject) return null
    const config = subjectsConfig.find(s => s.id === activeSubject)!

    const chartPoints = config.tests.map((m, idx) => {
      const score = m.total || 0
      const max = m.max_marks || config.max
      const pct = m.percentage || (max > 0 ? Math.round((score / max) * 100) : 0)
      return {
        label: m.test_name || `${config.name} Test ${idx + 1}`,
        value: score,
        score,
        maxMarks: max,
        percentage: Math.round(pct),
        date: m.test_date ? new Date(m.test_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"
      }
    })

    let insight = "Stable"
    const pcts = config.tests.map(t => t.percentage || 0)
    const len = pcts.length
    if (len >= 3) {
      const recent = (pcts[len - 1] + pcts[len - 2]) / 2
      const older = pcts.slice(0, len - 2).reduce((a, b) => a + b, 0) / (len - 2)
      const diff = recent - older
      if (diff > 4) insight = "Improving"
      else if (diff < -4) insight = "Needs Improvement"
    } else if (len === 2) {
      const diff = pcts[1] - pcts[0]
      if (diff > 4) insight = "Improving"
      else if (diff < -4) insight = "Needs Improvement"
    }

    const avgScore = len > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / len) : 0
    const bestScore = len > 0 ? Math.max(...config.tests.map(t => t.total || 0)) : 0

    return {
      config,
      chartPoints,
      insight,
      avgScore,
      bestScore,
      historyList: [...config.tests].reverse()
    }
  }, [activeSubject, subjectsConfig])

  // Export Excel
  const handleExportExcel = () => {
    if (marks.length === 0 || !student) {
      toast.error("No marks records available to export.")
      return
    }

    const data = sortedMarks.map(m => {
      const typeLabel = subjectsConfig.find(s => s.id === m.test_type?.replace("weekly_", ""))?.name || m.test_type
      return {
        "Student Name": student.name,
        "Test Name": m.test_name || "N/A",
        "Subject/Type": typeLabel,
        "Test Date": m.test_date ? formatDate(m.test_date) : "N/A",
        "Correct Answers": m.correct_answers || 0,
        "Wrong Answers": m.wrong_answers || 0,
        "Unanswered Questions": m.unanswered_questions || 0,
        "Score Obtained": m.total || 0,
        "Maximum Marks": m.max_marks || 0,
        "Percentage": m.percentage ? `${m.percentage}%` : "0%",
        "Grade": m.performance || "N/A"
      }
    })

    const ws = XLSX.utils.json_to_sheet(data)
    ws["!cols"] = [{ wch: 20 }, { wch: 24 }, { wch: 15 }, { wch: 15 }, { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "NEET Performance Report")
    XLSX.writeFile(wb, `${student.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_neet_report.xlsx`)
    toast.success("Excel report downloaded successfully!")
  }

  // ─── Loading State ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/20 animate-float">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div className="text-center space-y-1">
          <span className="font-extrabold text-sm text-slate-700 block">Loading Academic Portal</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Preparing your dashboard...</span>
        </div>
        <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-shimmer" style={{ width: "70%" }} />
        </div>
      </div>
    )
  }

  // ─── Unauthorized State ──────────────────────────────────────────────────

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-xl shadow-slate-200/50 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-lg">Session Expired</h3>
          <p className="text-slate-500 text-xs leading-relaxed">Your student session could not be resolved. Please sign in again to access your academic portal.</p>
          <Button onClick={handleSignOut} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-500/15 transition-all">
            Sign In Again
          </Button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 text-slate-900 font-sans flex flex-col">

      {/* ─── HEADER ─── */}
      <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/15">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-[13px] tracking-tight text-slate-900 leading-none">ADHITYA NEET ACADEMY</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Student Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSyncing && (
            <span className="text-[9px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold animate-pulse border border-emerald-100">
              Syncing...
            </span>
          )}
          {marks.length > 0 && (
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="h-9 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-600 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="h-9 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-grow max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DASHBOARD HOME VIEW                                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {!activeSubject ? (
          <div className="space-y-6 animate-fadeIn">

            {/* ─── 1. Welcome Header ─── */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-slate-900/8">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 animate-gradientShift" />
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
              <div className="absolute -right-8 -bottom-8 opacity-[0.06]">
                <GraduationCap className="w-56 h-56 text-white" />
              </div>

              <div className="relative z-10 p-6 sm:p-8 space-y-5">
                <div className="space-y-1.5">
                  <span className="text-[10px] px-3 py-1 rounded-full bg-white/10 border border-white/10 text-blue-300 font-bold uppercase tracking-widest inline-block">
                    Student Dashboard
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                    {getGreeting()}, {student.name?.split(" ")[0]} 👋
                  </h2>
                  <p className="text-slate-400 text-xs font-medium">Track your NEET preparation progress and exam performance</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  <span className="text-[10px] px-3 py-1.5 rounded-lg bg-white/8 border border-white/8 text-slate-300 font-bold">
                    🆔 {student.student_id}
                  </span>
                  <span className="text-[10px] px-3 py-1.5 rounded-lg bg-white/8 border border-white/8 text-slate-300 font-bold">
                    📚 {student.batch}
                  </span>
                  <span className="text-[10px] px-3 py-1.5 rounded-lg bg-white/8 border border-white/8 text-slate-300 font-bold">
                    📱 {student.phone}
                  </span>
                  {student.place && (
                    <span className="text-[10px] px-3 py-1.5 rounded-lg bg-white/8 border border-white/8 text-slate-300 font-bold">
                      📍 {student.place}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ─── 2. Quick Stats Row ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass rounded-2xl border border-slate-200/80 p-4 space-y-1 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-2">Total Tests</span>
                <span className="text-2xl font-black text-slate-800">{quickStats.totalTests}</span>
              </div>

              <div className="glass rounded-2xl border border-slate-200/80 p-4 space-y-1 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-2">Average</span>
                <span className="text-2xl font-black text-slate-800">{quickStats.avgPct}<span className="text-sm text-slate-400 font-bold">%</span></span>
              </div>

              <div className="glass rounded-2xl border border-slate-200/80 p-4 space-y-1 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-2">Highest</span>
                <span className="text-2xl font-black text-slate-800">{quickStats.highestScore}<span className="text-sm text-slate-400 font-bold">%</span></span>
              </div>

              <div className="glass rounded-2xl border border-slate-200/80 p-4 space-y-1 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Award className="w-4 h-4 text-violet-600" />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-2">Best Subject</span>
                <span className="text-lg font-black text-slate-800">
                  {quickStats.bestSubject ? `${quickStats.bestSubject.icon} ${quickStats.bestSubject.name}` : "—"}
                </span>
              </div>
            </div>

            {/* ─── 3. Section Title ─── */}
            <div className="pt-1">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Subject Performance</h3>
              <p className="text-slate-400 text-xs mt-0.5">Tap a subject to view detailed analytics and test history</p>
            </div>

            {/* ─── 4. Subject Cards Grid ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectsConfig.map((sub, cardIdx) => {
                const latest = getLatestRecord(sub.tests)
                const latestPct = latest?.percentage || 0
                const trend = getTrend(sub.tests)
                const sparklineValues = sub.tests.slice(-6).map(t => t.total || 0)

                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubject(sub.id)}
                    className="group text-left bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:scale-[1.015] hover:border-slate-300 transition-all duration-300 overflow-hidden"
                    style={{ animationDelay: `${cardIdx * 80}ms` }}
                  >
                    {/* Gradient accent bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${sub.gradient}`} />

                    <div className="p-5 space-y-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{sub.icon}</span>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-slate-950 transition-colors">{sub.name}</h4>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {sub.tests.length} test{sub.tests.length !== 1 ? "s" : ""} recorded
                            </span>
                          </div>
                        </div>
                        {latest && <ProgressRing percentage={latestPct} color={sub.accentColor} />}
                      </div>

                      {/* Score + Sparkline row */}
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Latest Score</span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xl font-black text-slate-800">
                              {latest ? latest.total : "—"}
                            </span>
                            {latest && (
                              <span className="text-xs font-semibold text-slate-400">/ {latest.max_marks || sub.max}</span>
                            )}
                            {/* Trend indicator */}
                            {sub.tests.length >= 2 && (
                              <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                trend === "up" ? "text-emerald-600 bg-emerald-50" :
                                trend === "down" ? "text-red-500 bg-red-50" :
                                "text-slate-500 bg-slate-100"
                              }`}>
                                {trend === "up" && <TrendingUp className="w-3 h-3" />}
                                {trend === "down" && <TrendingDown className="w-3 h-3" />}
                                {trend === "stable" && <Minus className="w-3 h-3" />}
                              </span>
                            )}
                          </div>
                        </div>
                        <MiniSparkline values={sparklineValues} color={sub.accentColor} />
                      </div>

                      {/* View Details CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                          View Performance Details
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (

          /* ═══════════════════════════════════════════════════════════════════ */
          /* SUBJECT DETAIL VIEW                                               */
          /* ═══════════════════════════════════════════════════════════════════ */
          <div className="space-y-6 animate-fadeIn">

            {/* ─── Back / Breadcrumb ─── */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <button
                onClick={() => setActiveSubject(null)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-700 flex items-center gap-1.5">
                <span className="text-base">{currentSubjectData?.config.icon}</span>
                {currentSubjectData?.config.name}
              </span>
            </div>

            {/* ─── Subject Header Banner ─── */}
            <div className={`rounded-2xl overflow-hidden shadow-lg`}>
              <div className={`bg-gradient-to-r ${currentSubjectData?.config.gradient} p-6 sm:p-7`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                      <span className="text-2xl sm:text-3xl">{currentSubjectData?.config.icon}</span>
                      {currentSubjectData?.config.name} Performance
                    </h2>
                    <p className="text-white/70 text-xs mt-1.5 font-medium">
                      Detailed analytics for <span className="text-white font-bold">{student.name}</span> · {student.batch}
                    </p>
                  </div>
                </div>

                {/* Stat Pills */}
                <div className="flex flex-wrap gap-2 mt-5">
                  <span className="text-[10px] px-3 py-1.5 rounded-lg bg-white/15 border border-white/10 text-white font-bold backdrop-blur-sm">
                    📝 {currentSubjectData?.config.tests.length || 0} Tests
                  </span>
                  <span className="text-[10px] px-3 py-1.5 rounded-lg bg-white/15 border border-white/10 text-white font-bold backdrop-blur-sm">
                    📊 Avg: {currentSubjectData?.avgScore || 0}%
                  </span>
                  <span className="text-[10px] px-3 py-1.5 rounded-lg bg-white/15 border border-white/10 text-white font-bold backdrop-blur-sm">
                    🏅 Best: {currentSubjectData?.bestScore || 0} / {currentSubjectData?.config.max}
                  </span>
                </div>
              </div>
            </div>

            {/* ─── 1. Performance Chart ─── */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Score Trend</h3>
              <LineChart 
                data={currentSubjectData?.chartPoints || []} 
                maxVal={currentSubjectData?.config.max} 
                height={220}
                strokeColor={currentSubjectData?.config.accentColor}
              />
            </div>

            {/* ─── 2. Performance Insight Card ─── */}
            <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Performance Insight</CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                  currentSubjectData?.insight === "Improving"
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800"
                    : currentSubjectData?.insight === "Needs Improvement"
                    ? "bg-gradient-to-r from-rose-50 to-red-50 border-rose-200 text-rose-800"
                    : "bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 text-slate-800"
                }`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    currentSubjectData?.insight === "Improving"
                      ? "bg-emerald-100 text-emerald-600 animate-pulseGlow"
                      : currentSubjectData?.insight === "Needs Improvement"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black">
                      {currentSubjectData?.insight === "Improving" && "🎉 Performance Improving!"}
                      {currentSubjectData?.insight === "Needs Improvement" && "⚠️ Needs More Practice"}
                      {currentSubjectData?.insight === "Stable" && "⚖️ Stable Performance"}
                    </h4>
                    <p className="text-[11px] font-medium opacity-75">
                      {motivationalQuotes[currentSubjectData?.insight || "Stable"]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── 3. History Table ─── */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{currentSubjectData?.config.name} Exam History</h3>
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 to-slate-100/80 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Test Name</th>
                        <th className="py-3.5 px-4 text-center">Correct</th>
                        <th className="py-3.5 px-4 text-center">Wrong</th>
                        <th className="py-3.5 px-4 text-center">Blank</th>
                        <th className="py-3.5 px-4 text-center">Marks</th>
                        <th className="py-3.5 px-4 text-center">%</th>
                        <th className="py-3.5 px-4 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {(!currentSubjectData?.historyList || currentSubjectData.historyList.length === 0) ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center">
                            <div className="space-y-2">
                              <span className="text-3xl block">📭</span>
                              <span className="text-slate-400 font-bold text-sm block">No tests recorded yet</span>
                              <span className="text-slate-350 font-medium text-[11px] block">Your test results will appear here after your first exam</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentSubjectData.historyList.map((m, idx) => {
                          const isExpanded = expandedTestId === m.id
                          const isGrandTest = activeSubject === "grand"
                          const pct = m.percentage || 0

                          // Reconstruct subject-wise wrong answers
                          const bioC = m.biology_correct || 0
                          const chemC = m.chemistry_correct || 0
                          const physC = m.physics_correct || 0
                          const bioW = isGrandTest ? Math.max(0, (bioC * 4) - (m.biology || 0)) : 0
                          const chemW = isGrandTest ? Math.max(0, (chemC * 4) - (m.chemistry || 0)) : 0
                          const physW = isGrandTest ? Math.max(0, (physC * 4) - (m.physics || 0)) : 0

                          return (
                            <React.Fragment key={m.id}>
                              <tr
                                className={`transition-colors ${
                                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                } ${isGrandTest ? "cursor-pointer hover:bg-blue-50/30" : "hover:bg-slate-50/80"} ${
                                  isGrandTest ? "border-l-[3px] border-l-violet-400" : ""
                                }`}
                                onClick={() => {
                                  if (isGrandTest) {
                                    setExpandedTestId(isExpanded ? null : m.id)
                                  }
                                }}
                              >
                                <td className="py-3 px-4 font-semibold text-slate-400 whitespace-nowrap">
                                  {m.test_date ? formatDate(m.test_date) : "—"}
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span>{m.test_name || "N/A"}</span>
                                    {isGrandTest && (
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider shrink-0 transition-colors ${
                                        isExpanded
                                          ? "bg-violet-100 text-violet-700 border border-violet-200"
                                          : "bg-blue-50 text-blue-600 border border-blue-100"
                                      }`}>
                                        {isExpanded ? "▲ Hide" : "▼ Details"}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center font-bold text-emerald-600">{m.correct_answers}</td>
                                <td className="py-3 px-4 text-center font-bold text-red-500">{m.wrong_answers}</td>
                                <td className="py-3 px-4 text-center font-semibold text-slate-400">{m.unanswered_questions}</td>
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  <span className="font-black text-slate-800">{m.total}</span>
                                  <span className="text-[10px] font-medium text-slate-400 ml-0.5">/ {m.max_marks || currentSubjectData.config.max}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="font-bold text-blue-600">{pct}%</span>
                                    {/* Inline progress bar */}
                                    <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
                                        }`}
                                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                    m.performance === "Excellent"
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                      : m.performance === "Good"
                                      ? "bg-blue-50 border-blue-200 text-blue-700"
                                      : m.performance === "Average"
                                      ? "bg-amber-50 border-amber-200 text-amber-700"
                                      : "bg-red-50 border-red-200 text-red-600"
                                  }`}>
                                    {m.performance === "Excellent" && "⭐ "}
                                    {m.performance || "Average"}
                                  </span>
                                </td>
                              </tr>

                              {/* Grand Test Expandable Details */}
                              {isGrandTest && isExpanded && (
                                <tr>
                                  <td colSpan={8} className="p-0">
                                    <div className="animate-slideDown bg-gradient-to-r from-violet-50/50 via-white to-violet-50/50 border-y border-violet-100 p-4">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
                                        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">🧬</span>
                                            <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Biology</span>
                                          </div>
                                          <div className="flex justify-between text-xs text-slate-600">
                                            <span>Correct: <strong className="text-emerald-600">{bioC}</strong></span>
                                            <span>Wrong: <strong className="text-red-500">{bioW}</strong></span>
                                          </div>
                                          <div className="text-[11px] font-bold text-slate-700 pt-2 border-t border-emerald-50 flex justify-between">
                                            <span>Score:</span>
                                            <span className="text-emerald-700">{bioC * 4 - bioW} / 360</span>
                                          </div>
                                        </div>
                                        
                                        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">⚛️</span>
                                            <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Physics</span>
                                          </div>
                                          <div className="flex justify-between text-xs text-slate-600">
                                            <span>Correct: <strong className="text-emerald-600">{physC}</strong></span>
                                            <span>Wrong: <strong className="text-red-500">{physW}</strong></span>
                                          </div>
                                          <div className="text-[11px] font-bold text-slate-700 pt-2 border-t border-amber-50 flex justify-between">
                                            <span>Score:</span>
                                            <span className="text-amber-700">{physC * 4 - physW} / 180</span>
                                          </div>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">🧪</span>
                                            <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">Chemistry</span>
                                          </div>
                                          <div className="flex justify-between text-xs text-slate-600">
                                            <span>Correct: <strong className="text-emerald-600">{chemC}</strong></span>
                                            <span>Wrong: <strong className="text-red-500">{chemW}</strong></span>
                                          </div>
                                          <div className="text-[11px] font-bold text-slate-700 pt-2 border-t border-blue-50 flex justify-between">
                                            <span>Score:</span>
                                            <span className="text-blue-700">{chemC * 4 - chemW} / 180</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="py-4 text-center border-t border-slate-100 mt-auto">
        <p className="text-[10px] text-slate-400 font-medium">© {new Date().getFullYear()} Adhitya NEET Academy, Erode · Student Portal</p>
      </footer>
    </div>
  )
}
