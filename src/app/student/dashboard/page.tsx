"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Award,
  Calendar,
  Download,
  LogOut,
  RefreshCw,
  TrendingUp,
  User,
  MapPin,
  Phone,
  Zap,
  Activity,
  GraduationCap,
  Sparkles,
  BookOpen
} from "lucide-react"
import { toast } from "@/lib/toast"
import { LineChart, BarChart, AreaChart, DonutChart } from "@/components/shared/SVGCharts"
import * as XLSX from "xlsx"

export default function StudentDashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [studentId, setStudentId] = useState<string | null>(null)
  const [student, setStudent] = useState<any>(null)
  const [marks, setMarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // 1. Retrieve student_id from document.cookie on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(";").shift()
        return null
      }
      const sId = getCookie("student_id")
      if (sId) {
        setStudentId(sId)
      } else {
        router.push("/login")
      }
    }
  }, [router])

  // Load from local storage cache immediately if available
  useEffect(() => {
    if (typeof window !== "undefined" && studentId) {
      const cachedStudent = localStorage.getItem(`student-portal-profile-${studentId}`)
      const cachedMarks = localStorage.getItem(`student-portal-marks-${studentId}`)
      if (cachedStudent) {
        setStudent(JSON.parse(cachedStudent))
      }
      if (cachedMarks) {
        setMarks(JSON.parse(cachedMarks))
        setLoading(false)
      }
    }
  }, [studentId])

  const fetchStudentData = useCallback(async (isSilent = false) => {
    if (!studentId) return
    if (!isSilent) setLoading(true)
    else setIsSyncing(true)

    try {
      // 1. Fetch Student Profile
      const { data: studentData, error: studentErr } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single()

      if (studentErr) throw studentErr
      if (studentData) {
        setStudent(studentData)
        if (typeof window !== "undefined") {
          localStorage.setItem(`student-portal-profile-${studentId}`, JSON.stringify(studentData))
        }
      }

      // 2. Fetch Marks history
      const { data: marksData, error: marksErr } = await supabase
        .from("student_marks")
        .select(`
          id,
          physics,
          chemistry,
          biology,
          total,
          percentage,
          performance,
          correct_answers,
          wrong_answers,
          unanswered_questions,
          max_marks,
          biology_correct,
          chemistry_correct,
          physics_correct,
          total_wrong,
          created_at,
          tests (
            id,
            name,
            date,
            type
          )
        `)
        .eq("student_id", studentId)
        .order("created_at", { ascending: true }) // chronological for graphs

      if (marksErr) throw marksErr
      if (marksData) {
        setMarks(marksData)
        if (typeof window !== "undefined") {
          localStorage.setItem(`student-portal-marks-${studentId}`, JSON.stringify(marksData))
        }
      }
    } catch (err: any) {
      console.error("Error loading student data:", err)
      toast.error(`Error loading data: ${err.message}`)
    } finally {
      setLoading(false)
      setIsSyncing(false)
    }
  }, [studentId, supabase])

  useEffect(() => {
    if (studentId) {
      const hasCache = typeof window !== "undefined" && localStorage.getItem(`student-portal-marks-${studentId}`)
      fetchStudentData(hasCache ? true : false)
    }
  }, [studentId, fetchStudentData])

  const handleSignOut = () => {
    // Delete student cookie and redirect
    document.cookie = "student_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;"
    router.push("/login")
    router.refresh()
  }

  // Computations
  const stats = useMemo(() => {
    if (marks.length === 0) return null

    let totalScore = 0
    let totalPercentage = 0
    let highestScore = -999
    let lowestScore = 999
    
    let totalCorrect = 0
    let totalWrong = 0
    let totalUnanswered = 0

    // Subject Accumulators
    let bioScore = 0, bioMax = 0
    let chemScore = 0, chemMax = 0
    let physScore = 0, physMax = 0

    const monthlyPct: { [key: string]: { sum: number; count: number } } = {}

    marks.forEach(m => {
      const score = Number(m.total || 0)
      const pct = Number(m.percentage || 0)
      const max = Number(m.max_marks || 720)
      
      totalScore += score
      totalPercentage += pct
      if (score > highestScore) highestScore = score
      if (score < lowestScore) lowestScore = score

      totalCorrect += Number(m.correct_answers || 0)
      totalWrong += Number(m.wrong_answers || 0)
      totalUnanswered += Number(m.unanswered_questions || 0)

      // Subject tracking
      const type = m.tests?.type || ""
      if (type === "weekly_biology") {
        bioScore += score
        bioMax += max
      } else if (type === "weekly_chemistry") {
        chemScore += score
        chemMax += max
      } else if (type === "weekly_physics") {
        physScore += score
        physMax += max
      } else if (type === "grand") {
        bioScore += Number(m.biology_correct || 0) * 4
        bioMax += 90 * 4

        chemScore += Number(m.chemistry_correct || 0) * 4
        chemMax += 45 * 4

        physScore += Number(m.physics_correct || 0) * 4
        physMax += 45 * 4
      }

      // Group by month
      if (m.tests?.date) {
        const dateObj = new Date(m.tests.date)
        const monthKey = dateObj.toLocaleString("default", { month: "short", year: "2-digit" })
        if (!monthlyPct[monthKey]) {
          monthlyPct[monthKey] = { sum: 0, count: 0 }
        }
        monthlyPct[monthKey].sum += pct
        monthlyPct[monthKey].count++
      }
    })

    const avgScore = totalScore / marks.length
    const avgPercentage = totalPercentage / marks.length

    // Subject Percentages
    const bioPct = bioMax > 0 ? (bioScore / bioMax) * 100 : 0
    const chemPct = chemMax > 0 ? (chemScore / chemMax) * 100 : 0
    const physPct = physMax > 0 ? (physScore / physMax) * 100 : 0

    const subList = [
      { name: "Biology", pct: bioPct },
      { name: "Chemistry", pct: chemPct },
      { name: "Physics", pct: physPct }
    ]
    subList.sort((a, b) => b.pct - a.pct)
    const strongest = subList[0].pct > 0 ? `${subList[0].name} (${subList[0].pct.toFixed(0)}%)` : "N/A"
    const weakest = subList[2].pct > 0 ? `${subList[2].name} (${subList[2].pct.toFixed(0)}%)` : "N/A"

    const monthlyTrendData = Object.entries(monthlyPct).map(([month, data]) => ({
      label: month,
      value: Math.round(data.sum / data.count)
    }))

    const weeklyTrendData = marks
      .filter(m => m.tests?.type !== "grand")
      .map(m => ({
        label: m.tests?.date ? m.tests.date.substring(5, 10) : "Test",
        value: Number(m.total)
      }))

    const grandTestData = marks
      .filter(m => m.tests?.type === "grand")
      .map(m => ({
        label: m.tests?.date ? m.tests.date.substring(5, 10) : "Grand",
        value: Number(m.total)
      }))

    let improvement = 0
    if (marks.length > 1) {
      const firstPct = Number(marks[0].percentage || 0)
      const lastPct = Number(marks[marks.length - 1].percentage || 0)
      improvement = lastPct - firstPct
    }

    return {
      avgScore: Math.round(avgScore),
      avgPercentage: Math.round(avgPercentage),
      highestScore,
      lowestScore,
      totalCorrect,
      totalWrong,
      totalUnanswered,
      bioPct,
      chemPct,
      physPct,
      strongest,
      weakest,
      monthlyTrendData,
      weeklyTrendData,
      grandTestData,
      improvement
    }
  }, [marks])

  const handleExportExcel = () => {
    if (marks.length === 0 || !student) {
      alert("No marks records available to export.")
      return
    }

    const data = marks.map(m => ({
      "Student ID": student.student_id,
      "Student Name": student.name,
      "Batch": student.batch,
      "Test Name": m.tests?.name || "N/A",
      "Test Type": m.tests?.type || "N/A",
      "Test Date": m.tests?.date || "N/A",
      "Correct Answers": m.correct_answers || 0,
      "Wrong Answers": m.wrong_answers || 0,
      "Unanswered Questions": m.unanswered_questions || 0,
      "Marks Obtained": m.total || 0,
      "Maximum Marks": m.max_marks || 0,
      "Percentage (%)": m.percentage || 0,
      "Performance Grade": m.performance || "N/A"
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "My Performance Report")
    XLSX.writeFile(wb, `${student.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_report.xlsx`)
  }

  const adviceText = useMemo(() => {
    if (!stats) return ""
    const avg = stats.avgPercentage
    if (avg >= 80) {
      return "Outstanding work! Your performance is top-tier. Maintain this consistency, practice simulated NEET full mock tests, and keep revising micro-concepts to secure a high medical rank!"
    } else if (avg >= 60) {
      return "Good solid effort! You have a strong baseline. To cross the 600+ threshold, carefully review the wrong answers in your weekly Physics & Chemistry tests, and build speed on MCQ solving."
    } else {
      return "Consistency is key. Focus deeply on NCERT text foundations, resolve doubts with faculty promptly, and attempt more topic-wise tests to strengthen your core scores."
    }
  }, [stats])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="font-bold text-sm">Compiling student report card...</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-sm">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-lg">Unauthorized Portal Access</h3>
          <p className="text-slate-500 text-xs">Could not resolve your student profile. Please sign in again.</p>
          <Button onClick={handleSignOut} className="w-full bg-primary text-white rounded-xl h-11">
            Sign In Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Student Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-slate-900">ADHITYA NEET ACADEMY</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">Student Performance Desk</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-700 leading-none">{student.name}</span>
            <span className="text-[9px] text-primary font-bold uppercase tracking-wider mt-1">{student.batch}</span>
          </div>
          
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="h-10 border-slate-250 text-slate-655 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-bold text-xs rounded-xl flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-sm">
        {/* Welcome Motivational Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2.5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative z-10 space-y-2 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {student.name}!
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              {stats ? adviceText : "Your test records are being prepared by the academy administration. Check back shortly for visual analytics graphs."}
            </p>
          </div>
          
          {stats && (
            <Button
              onClick={handleExportExcel}
              className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold text-sm rounded-xl px-5 h-11 w-full md:w-auto shrink-0 justify-center shadow-md shadow-primary/10 relative z-10"
            >
              <Download className="w-4 h-4" />
              Download My Report
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Student Register ID</span>
              <code className="text-slate-800 font-bold text-[13px]">{student.student_id}</code>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
              <Phone className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Mobile / Password</span>
              <code className="text-slate-800 font-bold text-[13px]">{student.phone}</code>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-650 shrink-0">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Location Place</span>
              <span className="text-slate-800 font-bold text-sm">{student.place || "N/A"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Month of Joining</span>
              <span className="text-slate-800 font-bold text-sm">{student.month_of_joining || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Analytics Display */}
        {marks.length === 0 ? (
          <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 font-bold">
            No test scores recorded yet. The academy administration has not entered test marks for you.
          </div>
        ) : stats ? (
          <>
            {/* Stats KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4 flex items-center gap-4 justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Average Score</span>
                    <h3 className="text-2xl font-extrabold text-slate-800 leading-none">{stats.avgScore}</h3>
                    <span className="text-[10px] font-bold text-primary">{stats.avgPercentage}% Avg Rate</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary border border-blue-100 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4 flex items-center gap-4 justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Peak Score</span>
                    <h3 className="text-xl font-extrabold text-slate-800 leading-none">{stats.highestScore} <span className="text-slate-350 text-xs">/ {stats.lowestScore}</span></h3>
                    <span className="text-[10px] font-semibold text-slate-450 block mt-1 font-semibold">Highest vs lowest score</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4 flex items-center gap-4 justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Improvement Rate</span>
                    <h3 className={`text-2xl font-extrabold leading-none ${stats.improvement >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {stats.improvement >= 0 ? `+${stats.improvement.toFixed(1)}%` : `${stats.improvement.toFixed(1)}%`}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-450 block mt-1 font-semibold">Performance index growth</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4 flex items-center gap-4 justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Subject Analytics</span>
                    <span className="text-xs font-bold text-emerald-650 block mt-0.5">Strongest: {stats.strongest}</span>
                    <span className="text-xs font-bold text-rose-500 block">Weakest: {stats.weakest}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Test Scores */}
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-800">Weekly Test score progression</CardTitle>
                  <CardDescription className="text-[11px]">History tracking showing points scored in weekly quizzes.</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.weeklyTrendData.length > 0 ? (
                    <LineChart data={stats.weeklyTrendData} maxVal={200} height={200} />
                  ) : (
                    <div className="h-44 flex items-center justify-center text-slate-400 font-bold">No weekly tests recorded</div>
                  )}
                </CardContent>
              </Card>

              {/* Subject Breakdown percentages */}
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-800">Subject-wise Mastery Rate</CardTitle>
                  <CardDescription className="text-[11px]">Accumulated percentage score computed per individual subject.</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={[
                      { label: "Biology", value: Math.round(stats.bioPct), color: "#10B981" },
                      { label: "Chemistry", value: Math.round(stats.chemPct), color: "#F59E0B" },
                      { label: "Physics", value: Math.round(stats.physPct), color: "#3B82F6" }
                    ]}
                    maxVal={100}
                    height={200}
                  />
                </CardContent>
              </Card>

              {/* Monthly Trend Area */}
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-800">Monthly Avg Percentage</CardTitle>
                  <CardDescription className="text-[11px]">Average percentage score grouped and plotted monthly.</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.monthlyTrendData.length > 0 ? (
                    <AreaChart data={stats.monthlyTrendData} maxVal={100} height={200} />
                  ) : (
                    <div className="h-44 flex items-center justify-center text-slate-400 font-bold">Monthly averages will compile automatically</div>
                  )}
                </CardContent>
              </Card>

              {/* Correct / Wrong / Blank donut */}
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-800">Response Accuracy Distribution</CardTitle>
                  <CardDescription className="text-[11px]">Overall breakdown of correct, wrong and blank questions submitted.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[200px]">
                  <DonutChart 
                    data={[
                      { label: "Correct Answers", value: stats.totalCorrect, color: "#10B981" },
                      { label: "Wrong Answers", value: stats.totalWrong, color: "#EF4444" },
                      { label: "Unanswered Qs", value: stats.totalUnanswered, color: "#94A3B8" }
                    ]}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Grand tests tracking if any */}
            {stats.grandTestData.length > 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-800">Grand Monthly Test Progression</CardTitle>
                  <CardDescription className="text-[11px]">Cumulative scores secured during Grand Test sessions (Max: 720 marks).</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart data={stats.grandTestData} maxVal={720} height={180} />
                </CardContent>
              </Card>
            )}

            {/* Table history */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800">My Complete Academic History</CardTitle>
                <CardDescription className="text-[11px]">Full history list of all exams logged by academy administration.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-450 uppercase tracking-wider">
                      <th className="py-3 px-4">Test Date</th>
                      <th className="py-3 px-4">Test Name</th>
                      <th className="py-3 px-4">Test Type</th>
                      <th className="py-3 px-4 text-center">Correct</th>
                      <th className="py-3 px-4 text-center">Wrong</th>
                      <th className="py-3 px-4 text-center">Blank</th>
                      <th className="py-3 px-4 text-center">Score Obtained</th>
                      <th className="py-3 px-4 text-center">Percentage</th>
                      <th className="py-3 px-4 text-center">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {[...marks].reverse().map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-slate-400 whitespace-nowrap">
                          {m.tests?.date || "N/A"}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {m.tests?.name || "N/A"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap uppercase text-[10px] font-bold text-slate-400">
                          {m.tests?.type?.replace("weekly_", "") || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-650">
                          {m.correct_answers}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-rose-500">
                          {m.wrong_answers}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-400">
                          {m.unanswered_questions}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                          {m.total} <span className="text-[10px] font-medium text-slate-400">/ {m.max_marks}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-primary">
                          {m.percentage}%
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            m.performance === "Excellent"
                              ? "bg-emerald-50 border-emerald-250 text-emerald-700"
                              : m.performance === "Good"
                              ? "bg-blue-50 border-blue-200 text-primary"
                              : m.performance === "Average"
                              ? "bg-amber-50 border-amber-250 text-amber-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}>
                            {m.performance || "Average"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  )
}
