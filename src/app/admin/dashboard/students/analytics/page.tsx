"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  Calendar,
  Award,
  BookOpen,
  Download,
  RefreshCw,
  TrendingUp,
  User,
  MapPin,
  Phone,
  Mail,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  GraduationCap
} from "lucide-react"
import { toast } from "@/lib/toast"
import { LineChart, BarChart, AreaChart, DonutChart } from "@/components/shared/SVGCharts"
import * as XLSX from "xlsx"

function AnalyticsContent() {
  const searchParams = useSearchParams()
  const studentId = searchParams.get("id")
  const supabase = useMemo(() => createClient(), [])

  const [student, setStudent] = useState<any>(null)
  const [marks, setMarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load from local storage cache immediately
  useEffect(() => {
    if (typeof window !== "undefined" && studentId) {
      const cachedStudent = localStorage.getItem(`adhitya-neet-student-${studentId}`)
      const cachedMarks = localStorage.getItem(`adhitya-neet-marks-${studentId}`)
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
          localStorage.setItem(`adhitya-neet-student-${studentId}`, JSON.stringify(studentData))
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
          localStorage.setItem(`adhitya-neet-marks-${studentId}`, JSON.stringify(marksData))
        }
      }
    } catch (err: any) {
      console.error("Error loading student analytics:", err)
      toast.error(`Error loading data: ${err.message}`)
    } finally {
      setLoading(false)
      setIsSyncing(false)
    }
  }, [studentId, supabase])

  useEffect(() => {
    if (studentId) {
      const hasCache = typeof window !== "undefined" && localStorage.getItem(`adhitya-neet-marks-${studentId}`)
      fetchStudentData(hasCache ? true : false)
    }
  }, [studentId, fetchStudentData])

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

    // Monthly grouping
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

      // Group by month (YYYY-MM)
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

    // Strongest & Weakest Subjects
    const subList = [
      { name: "Biology", pct: bioPct },
      { name: "Chemistry", pct: chemPct },
      { name: "Physics", pct: physPct }
    ]
    subList.sort((a, b) => b.pct - a.pct)
    const strongest = subList[0].pct > 0 ? `${subList[0].name} (${subList[0].pct.toFixed(0)}%)` : "N/A"
    const weakest = subList[2].pct > 0 ? `${subList[2].name} (${subList[2].pct.toFixed(0)}%)` : "N/A"

    // Monthly progress data
    const monthlyTrendData = Object.entries(monthlyPct).map(([month, data]) => ({
      label: month,
      value: Math.round(data.sum / data.count)
    }))

    // Weekly trend percentages
    const weeklyTrendData = marks
      .filter(m => m.tests?.type !== "grand")
      .map(m => ({
        label: m.tests?.date ? m.tests.date.substring(5, 10) : "Test",
        value: Number(m.total)
      }))

    // Grand test comparisons
    const grandTestData = marks
      .filter(m => m.tests?.type === "grand")
      .map(m => ({
        label: m.tests?.date ? m.tests.date.substring(5, 10) : "Grand",
        value: Number(m.total)
      }))

    // Calculate improvement percentage (recent vs first test)
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
    XLSX.utils.book_append_sheet(wb, ws, "Academic Profile")
    XLSX.writeFile(wb, `${student.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_report.xlsx`)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-2">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="font-bold text-sm">Compiling student metrics...</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center max-w-lg mx-auto mt-12 p-6 shadow-sm">
        <h3 className="font-extrabold text-slate-800 text-lg">Student Profile Not Found</h3>
        <p className="text-slate-500 text-xs mt-1">Please go back to Student Profiles and select an active student.</p>
        <Button asChild className="mt-4 bg-primary text-white rounded-xl h-10 px-5">
          <Link href="/admin/dashboard/students">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profiles
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Back Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="border-slate-250 text-slate-600 rounded-xl h-11 w-11 shrink-0 p-0 hover:bg-slate-50">
            <Link href="/admin/dashboard/students">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{student.name}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-primary font-bold uppercase tracking-wider">
                {student.batch}
              </span>
              {isSyncing && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold animate-pulse">
                  Syncing
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Student Academic Performance Analytics Review</p>
          </div>
        </div>
        
        <Button
          onClick={handleExportExcel}
          disabled={marks.length === 0}
          className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold text-sm rounded-xl px-5 h-11 w-full sm:w-auto shrink-0 justify-center shadow-md shadow-primary/10"
        >
          <Download className="w-4 h-4" />
          Export Marks Excel
        </Button>
      </div>

      {/* Student Profile Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Student ID / Username</span>
            <code className="text-slate-800 font-bold text-[13px]">{student.student_id}</code>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Mobile / Password</span>
            <code className="text-slate-800 font-bold text-[13px]">{student.phone}</code>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-650 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Location Place</span>
            <span className="text-slate-800 font-bold text-sm">{student.place || "N/A"}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Month of Joining</span>
            <span className="text-slate-800 font-bold text-sm">{student.month_of_joining || "N/A"}</span>
          </div>
        </div>
      </div>

      {marks.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-455 font-semibold">
          No test score records logged for this student.
        </div>
      ) : stats ? (
        <>
          {/* KPI Dashboard Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 flex items-center gap-4 justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Average Score</span>
                  <h3 className="text-2xl font-extrabold text-slate-800 leading-none">{stats.avgScore}</h3>
                  <span className="text-[10px] font-bold text-primary">{stats.avgPercentage}% Avg rate</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary border border-blue-100 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 flex items-center gap-4 justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">High / Low Score</span>
                  <h3 className="text-xl font-extrabold text-slate-800 leading-none">{stats.highestScore} <span className="text-slate-350 text-xs">/ {stats.lowestScore}</span></h3>
                  <span className="text-[10px] font-semibold text-slate-450 block mt-1">Range of marks achieved</span>
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
                  <span className="text-[10px] font-semibold text-slate-450 block mt-1">Since first conducted test</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 flex items-center gap-4 justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Subjects Mastery</span>
                  <span className="text-xs font-bold text-emerald-600 block mt-0.5">Strong: {stats.strongest}</span>
                  <span className="text-xs font-bold text-rose-500 block">Weak: {stats.weakest}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graph Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Score Trend */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800">Weekly Test Trend</CardTitle>
                <CardDescription className="text-[11px]">Timeline history of weekly test marks (cumulative points scored).</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.weeklyTrendData.length > 0 ? (
                  <LineChart data={stats.weeklyTrendData} maxVal={200} height={200} />
                ) : (
                  <div className="h-44 flex items-center justify-center text-slate-400 font-bold">No weekly tests recorded</div>
                )}
              </CardContent>
            </Card>

            {/* Subject Mastery Analysis */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800">Subject-wise Mastery Rate</CardTitle>
                <CardDescription className="text-[11px]">Normalized percentage rate calculated across all completed tests.</CardDescription>
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

            {/* Monthly Progress Shading */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800">Monthly Improvement Avg</CardTitle>
                <CardDescription className="text-[11px]">Average percentage score grouped and plotted monthly.</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.monthlyTrendData.length > 0 ? (
                  <AreaChart data={stats.monthlyTrendData} maxVal={100} height={200} />
                ) : (
                  <div className="h-44 flex items-center justify-center text-slate-400 font-bold">Incomplete monthly compilation</div>
                )}
              </CardContent>
            </Card>

            {/* Response & Error ratios */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800">Total Response Distribution</CardTitle>
                <CardDescription className="text-[11px]">Breakdown of Correct, Wrong, and Unanswered answers overall.</CardDescription>
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

          {/* Grand Test Comparisons if any */}
          {stats.grandTestData.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800">Grand Monthly Test Performance</CardTitle>
                <CardDescription className="text-[11px]">Total scores secured during Grand Test sessions (Max: 720 marks).</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart data={stats.grandTestData} maxVal={720} height={180} />
              </CardContent>
            </Card>
          )}

          {/* Detailed Test History Table */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">Academic Score Ledgers</CardTitle>
                <CardDescription className="text-[11px]">Full history list of weekly and grand tests completed by student.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-450 uppercase tracking-wider">
                    <th className="py-3 px-4">Test Date</th>
                    <th className="py-3 px-4">Test Name</th>
                    <th className="py-3 px-4">Test Category</th>
                    <th className="py-3 px-4 text-center">Correct</th>
                    <th className="py-3 px-4 text-center">Wrong</th>
                    <th className="py-3 px-4 text-center">Blank</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Pct</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Render descending chronological order in table */}
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
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
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
    </div>
  )
}

export default function StudentAnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-2">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="font-bold text-sm">Initializing dashboard content...</span>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  )
}
