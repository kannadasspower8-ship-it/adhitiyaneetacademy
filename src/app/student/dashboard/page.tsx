"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  Download,
  LogOut,
  RefreshCw,
  User,
  MapPin,
  Phone,
  GraduationCap,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react"
import { toast } from "@/lib/toast"
import { LineChart } from "@/components/shared/SVGCharts"
import * as XLSX from "xlsx"

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

export default function StudentDashboardPage() {
  const router = useRouter()

  const [student, setStudent] = useState<any>(null)
  const [marks, setMarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeSubject, setActiveSubject] = useState<string | null>(null) // null (home), biology, chemistry, physics, grand

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

  // Subject configurations for dashboard home
  const subjectsConfig = useMemo(() => [
    {
      id: "biology",
      name: "Biology",
      icon: "🧬",
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-600",
      tests: biologyTests,
      max: 200,
    },
    {
      id: "chemistry",
      name: "Chemistry",
      icon: "🧪",
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 text-blue-600",
      tests: chemistryTests,
      max: 180,
    },
    {
      id: "physics",
      name: "Physics",
      icon: "⚛️",
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50 text-amber-600",
      tests: physicsTests,
      max: 180,
    },
    {
      id: "grand",
      name: "Grand Test",
      icon: "🏆",
      color: "from-purple-500 to-pink-600",
      bgLight: "bg-purple-50 text-purple-600",
      tests: grandTests,
      max: 720,
    }
  ], [biologyTests, chemistryTests, physicsTests, grandTests])

  // Selected subject details computations
  const currentSubjectData = useMemo(() => {
    if (!activeSubject) return null
    const config = subjectsConfig.find(s => s.id === activeSubject)!
    
    // Process coordinates for the LineChart
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

    // Calculate trend insight
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

    return {
      config,
      chartPoints,
      insight,
      historyList: [...config.tests].reverse() // show newest first in the list
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-400 gap-2">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2563EB]" />
        <span className="font-extrabold text-xs text-slate-500 uppercase tracking-widest">Loading academic portal...</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-sm">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-lg">Unauthorized Portal Access</h3>
          <p className="text-slate-500 text-xs">Could not resolve your student profile. Please sign in again.</p>
          <Button onClick={handleSignOut} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl h-11">
            Sign In Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm shadow-slate-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/10">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">ADHITYA NEET ACADEMY</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">Private Student Desk</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {marks.length > 0 && (
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="h-10 border-slate-200 hover:bg-[#F8FAFC] text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Download Report</span>
            </Button>
          )}
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="h-10 border-slate-200 hover:bg-red-50 hover:text-[#EF4444] hover:border-red-200 font-bold text-xs rounded-xl flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-5xl w-full mx-auto p-5 space-y-6">

        {/* ─── DASHBOARD HOME VIEW ─── */}
        {!activeSubject ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Student Header Info */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-850 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-slate-900/10">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
                <GraduationCap className="w-64 h-64" />
              </div>
              <div className="relative z-10 space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold uppercase tracking-widest">
                    Student Portal
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">{student.name}</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Student ID</span>
                    <code className="text-slate-200 font-bold text-sm">{student.student_id}</code>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Enrolled Batch</span>
                    <span className="text-slate-200 font-bold text-sm">{student.batch}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Registered Mobile</span>
                    <span className="text-slate-200 font-bold text-sm">{student.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Subject Performance Reviews</h3>
              <p className="text-slate-450 text-xs">Select any subject category below to review complete test history and progress trends.</p>
            </div>

            {/* 4 Subject Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectsConfig.map(sub => {
                const latest = getLatestRecord(sub.tests)
                const latestScore = latest ? `${latest.total} / ${latest.max_marks || sub.max}` : "No tests recorded"
                const latestPct = latest ? `(${latest.percentage}%)` : ""

                return (
                  <Card key={sub.id} className="border-slate-200 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all bg-white rounded-2xl overflow-hidden flex flex-col justify-between h-44 p-5">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                          <span className="text-xl">{sub.icon}</span>
                          {sub.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.tests.length} test{sub.tests.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Latest Marks</span>
                        <div className="text-lg font-black text-slate-850 mt-1 flex items-baseline gap-1.5">
                          {latestScore}
                          {latestPct && <span className="text-xs font-bold text-[#2563EB]">{latestPct}</span>}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setActiveSubject(sub.id)}
                      variant="outline"
                      className="w-full h-10 border-slate-200 hover:border-blue-300 hover:text-[#2563EB] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      View Details
                    </Button>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          /* ─── SUBJECT DETAIL VIEW ─── */
          <div className="space-y-6 animate-fadeIn">
            {/* Back Bar */}
            <div>
              <button
                onClick={() => setActiveSubject(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
            </div>

            {/* Subject Details Header */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                  <span className="text-2xl">{currentSubjectData?.config.icon}</span>
                  {currentSubjectData?.config.name} Performance details
                </h2>
                <p className="text-xs text-slate-550 mt-1">
                  Timeline review for <span className="font-bold">{student.name}</span> ({student.batch})
                </p>
              </div>
            </div>

            {/* 1. Dynamic Performance Graph */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Performance Progress Trend</h3>
              <div className="w-full">
                <LineChart 
                  data={currentSubjectData?.chartPoints || []} 
                  maxVal={currentSubjectData?.config.max} 
                  height={220} 
                />
              </div>
            </div>

            {/* 2. Performance Insight Card */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Current Performance Insight</CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                  currentSubjectData?.insight === "Improving"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : currentSubjectData?.insight === "Needs Improvement"
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    currentSubjectData?.insight === "Improving"
                      ? "bg-emerald-100 text-emerald-600"
                      : currentSubjectData?.insight === "Needs Improvement"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider block text-slate-450">Trend Rating</span>
                    <h4 className="text-sm font-black mt-0.5">
                      {currentSubjectData?.insight === "Improving" && "🎉 Continuous Performance Improvement"}
                      {currentSubjectData?.insight === "Needs Improvement" && "⚠️ Academic Shading: Target Revision Recommended"}
                      {currentSubjectData?.insight === "Stable" && "⚖️ Stable Performance Range"}
                    </h4>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Biology/Chemistry/Physics/Grand Test History Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">{currentSubjectData?.config.name} Exam History Register</h3>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Test Name</th>
                        <th className="py-3 px-4 text-center">Correct</th>
                        <th className="py-3 px-4 text-center">Wrong</th>
                        <th className="py-3 px-4 text-center">Blank</th>
                        <th className="py-3 px-4 text-center">Marks Obtained</th>
                        <th className="py-3 px-4 text-center">Percentage</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentSubjectData?.historyList.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-400 whitespace-nowrap">
                            {m.test_date ? formatDate(m.test_date) : "—"}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                            {m.test_name || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#10B981]">
                            {m.correct_answers}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#EF4444]">
                            {m.wrong_answers}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-400">
                            {m.unanswered_questions}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                            {m.total} <span className="text-[10px] font-medium text-slate-400">/ {m.max_marks || currentSubjectData.config.max}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#2563EB]">
                            {m.percentage}%
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              m.performance === "Excellent"
                                ? "bg-emerald-50 border-emerald-250 text-emerald-700"
                                : m.performance === "Good"
                                ? "bg-blue-50 border-blue-200 text-[#2563EB]"
                                : m.performance === "Average"
                                ? "bg-amber-50 border-amber-250 text-amber-700"
                                : "bg-red-50 border-red-250 text-[#EF4444]"
                            }`}>
                              {m.performance || "Average"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
