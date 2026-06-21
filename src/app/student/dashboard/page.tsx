"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  Download,
  LogOut,
  RefreshCw,
  User,
  MapPin,
  Phone,
  GraduationCap
} from "lucide-react"
import { toast } from "@/lib/toast"
import * as XLSX from "xlsx"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts"

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
  } catch {
    return dateStr
  }
}

// ─── TOOLTIP AND CUSTOM RENDERING COMPONENTS ──────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomChartTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#0F172A] text-white p-3.5 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1.5 min-w-[160px]">
        <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">{data.name}</p>
        <p className="font-medium text-slate-400">Date: <span className="font-bold text-white">{data.date}</span></p>
        {data.correct !== undefined && data.correct !== null && (
          <p className="font-medium text-slate-400">Correct: <span className="font-extrabold text-[#10B981]">{data.correct}</span></p>
        )}
        {data.wrong !== undefined && data.wrong !== null && (
          <p className="font-medium text-slate-400">Wrong: <span className="font-extrabold text-[#EF4444]">{data.wrong}</span></p>
        )}
        <p className="font-medium text-slate-400">Score: <span className="font-extrabold text-[#2563EB]">{data.score}/{data.max}</span></p>
        <p className="font-medium text-slate-400">Percentage: <span className="font-extrabold text-[#F59E0B]">{data.pct}%</span></p>
      </div>
    )
  }
  return null
}

const renderCustomLineDot = (color: string) => {
  return function CustomDot(props: any) {
    const { cx, cy, payload } = props
    if (!cx || !cy) return null
    if (payload.isHighest) {
      return (
        <g key={payload.date + "-high"}>
          <circle cx={cx} cy={cy} r={6.5} fill="#10B981" stroke="#FFFFFF" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={11} fill="none" stroke="#10B981" strokeWidth={1.5} className="animate-ping opacity-60" />
        </g>
      )
    }
    if (payload.isLowest) {
      return (
        <g key={payload.date + "-low"}>
          <circle cx={cx} cy={cy} r={6.5} fill="#EF4444" stroke="#FFFFFF" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={11} fill="none" stroke="#EF4444" strokeWidth={1.5} className="animate-ping opacity-60" />
        </g>
      )
    }
    return (
      <circle cx={cx} cy={cy} r={4} fill={color} stroke="#FFFFFF" strokeWidth={1.5} key={payload.date} />
    )
  }
}

interface ChartContainerProps {
  title: string
  data: any[]
  children: React.ReactNode
}

function ChartContainer({ title, data, children }: ChartContainerProps) {
  return (
    <Card className="border-slate-100 bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {!data || data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 font-semibold text-xs bg-slate-50 border border-slate-100/50 rounded-xl">
            <span>No test records to plot yet</span>
          </div>
        ) : data.length === 1 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 font-semibold text-xs bg-slate-50 border border-slate-100/50 rounded-xl p-4 text-center">
            <span>More tests are required to generate a meaningful trend.</span>
          </div>
        ) : (
          <div className="h-64 w-full">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── DATA NORMALIZATION HELPER ────────────────────────────────────────────────

interface ProcessedDataResult {
  data: any[]
  maxVal: number
  avgPlotted: number
  avgPct: number
}

const processTestData = (tests: any[], defaultMax: number): ProcessedDataResult => {
  if (tests.length === 0) {
    return { data: [], maxVal: defaultMax, avgPlotted: 0, avgPct: 0 }
  }

  const maxVal = Math.max(...tests.map(d => d.max), defaultMax)
  const minVal = Math.min(...tests.map(d => d.max), defaultMax)
  const hasMixedMax = maxVal !== minVal

  const totalScorePct = tests.reduce((sum, d) => sum + d.pct, 0)
  const avgPct = totalScorePct / tests.length

  const percentages = tests.map(d => d.pct)
  const highestPct = Math.max(...percentages)
  const lowestPct = Math.min(...percentages)

  const processedData = tests.map(d => {
    const plottedValue = hasMixedMax ? Math.round((d.score / d.max) * maxVal) : d.score
    const isHighest = d.pct === highestPct
    const isLowest = d.pct === lowestPct
    return {
      ...d,
      plottedValue,
      isHighest,
      isLowest
    }
  })

  const avgPlotted = hasMixedMax 
    ? (avgPct / 100) * maxVal 
    : tests.reduce((sum, d) => sum + d.score, 0) / tests.length

  return {
    data: processedData,
    maxVal,
    avgPlotted,
    avgPct
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const router = useRouter()

  const [student, setStudent] = useState<any>(null)
  const [marks, setMarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load from local storage cache immediately if available
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
    fetchStudentData(hasCache ? true : false)
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

    marks.forEach(m => {
      const score = Number(m.total || 0)
      const pct = Number(m.percentage || 0)
      
      totalScore += score
      totalPercentage += pct
      if (score > highestScore) highestScore = score
      if (score < lowestScore) lowestScore = score

      totalCorrect += Number(m.correct_answers || 0)
      totalWrong += Number(m.wrong_answers || 0)
      totalUnanswered += Number(m.unanswered_questions || 0)

      const type = m.test_type || ""
      if (type === "weekly_biology") {
        bioScore += Number(m.biology || m.total || 0)
        bioMax += Number(m.max_marks || 200)
      } else if (type === "weekly_chemistry") {
        chemScore += Number(m.chemistry || m.total || 0)
        chemMax += Number(m.max_marks || 180)
      } else if (type === "weekly_physics") {
        physScore += Number(m.physics || m.total || 0)
        physMax += Number(m.max_marks || 180)
      } else if (type === "grand") {
        bioScore += Number(m.biology || 0)
        bioMax += 360

        chemScore += Number(m.chemistry || 0)
        chemMax += 180

        physScore += Number(m.physics || 0)
        physMax += 180
      }
    })

    const avgScore = totalScore / marks.length
    const avgPercentage = totalPercentage / marks.length

    // Compile Line Data List Chronologically (reverse from history display order)
    const sortedMarks = [...marks].sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())

    const bioRaw = sortedMarks
      .filter(m => m.test_type === "weekly_biology" || m.test_type === "grand")
      .map(m => {
        const score = Number(m.biology || (m.test_type === "weekly_biology" ? m.total : 0) || 0)
        const max = m.test_type === "grand" ? 360 : Number(m.max_marks || 200)
        const pct = max > 0 ? Math.round((score / max) * 100) : 0
        return {
          date: m.test_date ? formatDate(m.test_date) : "N/A",
          score,
          max,
          pct,
          name: m.test_name || "Biology Test",
          correct: m.test_type === "grand" ? m.biology_correct : m.correct_answers,
          wrong: m.test_type === "grand" ? null : m.wrong_answers
        }
      })

    const chemRaw = sortedMarks
      .filter(m => m.test_type === "weekly_chemistry" || m.test_type === "grand")
      .map(m => {
        const score = Number(m.chemistry || (m.test_type === "weekly_chemistry" ? m.total : 0) || 0)
        const max = m.test_type === "grand" ? 180 : Number(m.max_marks || 180)
        const pct = max > 0 ? Math.round((score / max) * 100) : 0
        return {
          date: m.test_date ? formatDate(m.test_date) : "N/A",
          score,
          max,
          pct,
          name: m.test_name || "Chemistry Test",
          correct: m.test_type === "grand" ? m.chemistry_correct : m.correct_answers,
          wrong: m.test_type === "grand" ? null : m.wrong_answers
        }
      })

    const physRaw = sortedMarks
      .filter(m => m.test_type === "weekly_physics" || m.test_type === "grand")
      .map(m => {
        const score = Number(m.physics || (m.test_type === "weekly_physics" ? m.total : 0) || 0)
        const max = m.test_type === "grand" ? 180 : Number(m.max_marks || 180)
        const pct = max > 0 ? Math.round((score / max) * 100) : 0
        return {
          date: m.test_date ? formatDate(m.test_date) : "N/A",
          score,
          max,
          pct,
          name: m.test_name || "Physics Test",
          correct: m.test_type === "grand" ? m.physics_correct : m.correct_answers,
          wrong: m.test_type === "grand" ? null : m.wrong_answers
        }
      })

    const grandTests = sortedMarks
      .filter(m => m.test_type === "grand")
      .map(m => {
        const score = Number(m.total || 0)
        const max = Number(m.max_marks || 720)
        const pct = max > 0 ? Math.round((score / max) * 100) : 0
        return {
          date: m.test_date ? formatDate(m.test_date) : "N/A",
          score,
          max,
          pct,
          name: m.test_name || "Grand Test"
        }
      })

    // Process lists using scaling and highlight helpers
    const bioResult = processTestData(bioRaw, 200)
    const chemResult = processTestData(chemRaw, 180)
    const physResult = processTestData(physRaw, 180)

    const subjectList = [
      { name: "Biology", pct: bioResult.avgPct, fill: "#2563EB" },
      { name: "Chemistry", pct: chemResult.avgPct, fill: "#10B981" },
      { name: "Physics", pct: physResult.avgPct, fill: "#F59E0B" }
    ]
    const sortedSubjects = [...subjectList].sort((a, b) => b.pct - a.pct)
    const strongest = sortedSubjects[0].pct > 0 ? `${sortedSubjects[0].name} (${sortedSubjects[0].pct.toFixed(0)}%)` : "N/A"
    const weakest = sortedSubjects[2].pct > 0 ? `${sortedSubjects[2].name} (${sortedSubjects[2].pct.toFixed(0)}%)` : "N/A"

    let grandStats = { highest: 0, lowest: 0, avg: 0, latest: 0 }
    if (grandTests.length > 0) {
      const grandScores = grandTests.map(t => t.score)
      const grandTotal = grandScores.reduce((sum, s) => sum + s, 0)
      grandStats = {
        highest: Math.max(...grandScores),
        lowest: Math.min(...grandScores),
        avg: Math.round(grandTotal / grandTests.length),
        latest: grandScores[grandScores.length - 1]
      }
    }

    let improvement = 0
    if (marks.length > 1) {
      const firstPct = Number(marks[0].percentage || 0)
      const lastPct = Number(marks[marks.length - 1].percentage || 0)
      improvement = lastPct - firstPct
    }

    // Peak accomplishment details
    let bestTest = { name: "N/A", score: 0, max: 0, pct: 0 }
    let bestPct = -1
    marks.forEach(m => {
      const pct = Number(m.percentage || 0)
      if (pct > bestPct) {
        bestPct = pct
        bestTest = {
          name: m.test_name || "Mock Test",
          score: Number(m.total || 0),
          max: Number(m.max_marks || 720),
          pct
        }
      }
    })

    const latest = marks[marks.length - 1]
    const latestScore = Number(latest.total || 0)
    const latestMax = Number(latest.max_marks || 720)
    const latestPct = Number(latest.percentage || 0)

    return {
      avgScore: Math.round(avgScore),
      avgPercentage: Math.round(avgPercentage),
      highestScore,
      lowestScore,
      totalCorrect,
      totalWrong,
      totalUnanswered,
      strongest,
      weakest,
      bioTests: bioResult.data,
      bioMax: bioResult.maxVal,
      bioAvg: bioResult.avgPlotted,
      bioAvgPct: bioResult.avgPct,
      chemTests: chemResult.data,
      chemMax: chemResult.maxVal,
      chemAvg: chemResult.avgPlotted,
      chemAvgPct: chemResult.avgPct,
      physTests: physResult.data,
      physMax: physResult.maxVal,
      physAvg: physResult.avgPlotted,
      physAvgPct: physResult.avgPct,
      grandTests,
      grandStats,
      improvement,
      latestScore,
      latestMax,
      latestPct,
      bestTest,
      subjectList
    }
  }, [marks])

  const handleExportExcel = () => {
    if (marks.length === 0 || !student) {
      alert("No marks records available to export.")
      return
    }

    const data = marks.map(m => ({
      "Student Name": student.name,
      "Correct Answers": m.correct_answers || 0,
      "Wrong Answers": m.wrong_answers || 0,
      "Unanswered Questions": m.unanswered_questions || 0,
      "Score Obtained": m.total || 0,
      "Percentage": m.percentage ? `${m.percentage}%` : "0%"
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "My Report")
    XLSX.writeFile(wb, `${student.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_report.xlsx`)
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
      {/* Student Portal Dedicated Header */}
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

        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-xs font-semibold text-slate-550">
            Welcome back, <span className="text-slate-850 font-bold">{student.name}</span>!
          </span>

          <div className="flex gap-2">
            {stats && (
              <Button
                onClick={handleExportExcel}
                variant="outline"
                className="h-10 border-slate-200 hover:bg-[#F8FAFC] text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download My Report
              </Button>
            )}
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="h-10 border-slate-200 hover:bg-red-50 hover:text-[#EF4444] hover:border-red-200 font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Portal Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-5 space-y-6">

        {/* 1. TOP STUDENT INFO CARDS (Profile summary) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F8FAFC] border border-slate-105 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100/50">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-450 font-bold uppercase tracking-wider block text-[9px]">Student ID</span>
              <code className="text-[#0F172A] font-extrabold text-[13px]">{student.student_id}</code>
            </div>
          </div>
          
          <div className="bg-[#F8FAFC] border border-slate-105 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100/50">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-450 font-bold uppercase tracking-wider block text-[9px]">Mobile Number</span>
              <span className="text-[#0F172A] font-extrabold text-sm">{student.phone}</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-105 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100/50">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-450 font-bold uppercase tracking-wider block text-[9px]">Location</span>
              <span className="text-[#0F172A] font-extrabold text-sm">{student.place || "N/A"}</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-105 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100/50">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-455 font-bold uppercase tracking-wider block text-[9px]">Month of Joining</span>
              <span className="text-[#0F172A] font-extrabold text-sm">{student.month_of_joining || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {marks.length === 0 ? (
          <div className="py-16 bg-[#F8FAFC] border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-bold text-xs uppercase tracking-wider">
            No test scores recorded yet. Your academic data will populate here when administrative marks are published.
          </div>
        ) : stats ? (
          <>
            {/* 2. SUMMARY METRICS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <Card className="border-slate-100 bg-[#F8FAFC] shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Score</span>
                  <div className="mt-1">
                    <h3 className="text-xl font-extrabold text-[#0F172A] leading-none">{stats.latestScore} <span className="text-[10px] text-slate-400 font-medium">/ {stats.latestMax}</span></h3>
                    <span className="text-[10px] font-bold text-[#2563EB] block mt-1">{stats.latestPct}% Rate</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 bg-[#F8FAFC] shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Highest Score</span>
                  <div className="mt-1">
                    <h3 className="text-xl font-extrabold text-emerald-650 leading-none">{stats.highestScore}</h3>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-1">Best logged performance</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 bg-[#F8FAFC] shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Average Score</span>
                  <div className="mt-1">
                    <h3 className="text-xl font-extrabold text-[#0F172A] leading-none">{stats.avgScore}</h3>
                    <span className="text-[10px] font-bold text-[#1D4ED8] block mt-1">{stats.avgPercentage}% Avg rate</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 bg-[#F8FAFC] shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Improvement</span>
                  <div className="mt-1">
                    <h3 className={`text-xl font-extrabold leading-none ${stats.improvement >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {stats.improvement >= 0 ? `+${stats.improvement.toFixed(1)}%` : `${stats.improvement.toFixed(1)}%`}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-1">Growth since first test</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 bg-[#F8FAFC] shadow-sm col-span-1">
                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Subject Strength</span>
                  <div className="mt-1">
                    <h3 className="text-[13px] font-extrabold text-emerald-600 truncate">{stats.strongest}</h3>
                    <span className="text-[9px] font-semibold text-slate-400 block mt-1">Highest mastery rating</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 bg-[#F8FAFC] shadow-sm col-span-1">
                <CardContent className="p-4 flex flex-col justify-between h-full min-h-[90px]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Subject Weakness</span>
                  <div className="mt-1">
                    <h3 className="text-[13px] font-extrabold text-[#EF4444] truncate">{stats.weakest}</h3>
                    <span className="text-[9px] font-semibold text-slate-400 block mt-1">Requires target revision</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3. GRAPHICAL ANALYTICS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Biology Performance Chart */}
              <ChartContainer title="Biology Performance Trend" data={stats.bioTests}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.bioTests} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, stats.bioMax]} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <ReferenceLine 
                      y={stats.bioAvg} 
                      stroke="#94A3B8" 
                      strokeDasharray="3 3" 
                      label={{ value: `Avg (${stats.bioAvgPct.toFixed(0)}%)`, fill: '#64748B', fontSize: 9, position: 'insideBottomLeft', fontWeight: 'bold' }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="plottedValue" 
                      stroke="#2563EB" 
                      strokeWidth={3} 
                      dot={renderCustomLineDot("#2563EB")} 
                      activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Chemistry Performance Chart */}
              <ChartContainer title="Chemistry Performance Trend" data={stats.chemTests}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chemTests} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, stats.chemMax]} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <ReferenceLine 
                      y={stats.chemAvg} 
                      stroke="#94A3B8" 
                      strokeDasharray="3 3" 
                      label={{ value: `Avg (${stats.chemAvgPct.toFixed(0)}%)`, fill: '#64748B', fontSize: 9, position: 'insideBottomLeft', fontWeight: 'bold' }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="plottedValue" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={renderCustomLineDot("#10B981")} 
                      activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Physics Performance Chart */}
              <ChartContainer title="Physics Performance Trend" data={stats.physTests}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.physTests} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, stats.physMax]} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <ReferenceLine 
                      y={stats.physAvg} 
                      stroke="#94A3B8" 
                      strokeDasharray="3 3" 
                      label={{ value: `Avg (${stats.physAvgPct.toFixed(0)}%)`, fill: '#64748B', fontSize: 9, position: 'insideBottomLeft', fontWeight: 'bold' }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="plottedValue" 
                      stroke="#F59E0B" 
                      strokeWidth={3} 
                      dot={renderCustomLineDot("#F59E0B")} 
                      activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Overall Grand Test Progression */}
              <Card className="border-slate-100 bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Overall Grand Test Progression</CardTitle>
                    {stats.grandTests.length > 1 && (
                      <div className="flex flex-wrap gap-3 text-[10px] font-bold">
                        <span className="text-emerald-600">Peak: {stats.grandStats.highest}</span>
                        <span className="text-rose-600">Lowest: {stats.grandStats.lowest}</span>
                        <span className="text-[#2563EB]">Avg: {stats.grandStats.avg}</span>
                        <span className="text-slate-700">Latest: {stats.grandStats.latest}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {stats.grandTests.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 font-semibold text-xs bg-slate-50 border border-slate-100/50 rounded-xl">
                      <span>No grand test records available yet</span>
                    </div>
                  ) : stats.grandTests.length === 1 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 font-semibold text-xs bg-slate-50 border border-slate-100/50 rounded-xl p-4 text-center">
                      <span>More tests are required to generate a meaningful trend.</span>
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.grandTests} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorGrand" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 720]} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <ReferenceLine 
                            y={stats.grandStats.avg} 
                            stroke="#94A3B8" 
                            strokeDasharray="3 3" 
                            label={{ value: `Avg (${stats.grandStats.avg})`, fill: '#64748B', fontSize: 9, position: 'insideBottomLeft', fontWeight: 'bold' }} 
                          />
                          <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorGrand)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subject Strength Comparison (Horizontal Bar Chart) */}
              <Card className="border-slate-105 bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Subject Strength Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.subjectList} layout="vertical" margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Average Score']} />
                        <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={24}>
                          {stats.subjectList.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Performance Insights Card */}
              <Card className="border-slate-105 bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Academic Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100/50 shadow-sm shadow-slate-100/30">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Strongest Subject</span>
                      <div className="text-xs font-extrabold text-[#2563EB] mt-1">{stats.strongest}</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100/50 shadow-sm shadow-slate-100/30">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weakest Subject</span>
                      <div className="text-xs font-extrabold text-[#EF4444] mt-1">{stats.weakest}</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100/50 shadow-sm shadow-slate-100/30">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average Performance</span>
                      <div className="text-xs font-extrabold text-slate-800 mt-1">{stats.avgPercentage}%</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100/50 shadow-sm shadow-slate-100/30">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Improvement</span>
                      <div className={`text-xs font-extrabold mt-1 ${stats.improvement >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {stats.improvement >= 0 ? `+${stats.improvement.toFixed(1)}%` : `${stats.improvement.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-100/50 shadow-sm shadow-slate-100/30">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Peak Accomplishment</span>
                    <div className="text-xs font-extrabold text-slate-800 mt-1">{stats.bestTest.name}</div>
                    <div className="text-[10px] font-semibold text-[#10B981] mt-0.5">
                      Score: {stats.bestTest.score}/{stats.bestTest.max} ({stats.bestTest.pct}%)
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* 4. STUDENT HISTORY TABLE */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-bold text-slate-800">My Complete Academic Performance History</CardTitle>
                <CardDescription className="text-[11px]">List registry of all weekly and monthly mock NEET exams.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/20 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider">
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
                  <tbody className="divide-y divide-slate-150/70 text-slate-700">
                    {[...marks].reverse().map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-400 whitespace-nowrap">
                          {m.test_date ? new Date(m.test_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {m.test_name || "N/A"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap uppercase text-[10px] font-bold text-slate-400">
                          {m.test_type?.replace("weekly_", "") || "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#10B981]">
                          {m.correct_answers}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#EF4444]">
                          {m.wrong_answers}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-400">
                          {m.unanswered_questions}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                          {m.total} <span className="text-[10px] font-medium text-slate-450">/ {m.max_marks}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#2563EB]">
                          {m.percentage}%
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  )
}
