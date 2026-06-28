"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  Calendar,
  Award,
  Download,
  RefreshCw,
  TrendingUp,
  User,
  MapPin,
  Phone,
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

function AnalyticsContent() {
  const searchParams = useSearchParams()
  const studentId = searchParams.get("id")
  const supabase = useMemo(() => createClient(), [])

  const [student, setStudent] = useState<any>(null)
  const [marks, setMarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeSubject, setActiveSubject] = useState<string>("biology") // biology, chemistry, physics, grand
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null)

  useEffect(() => {
    setExpandedTestId(null)
  }, [activeSubject])

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

  // Format database query result to match student dashboard schema
  const formattedMarks = useMemo(() => {
    return marks.map(m => ({
      id: m.id,
      test_name: m.tests?.name || "N/A",
      test_type: m.tests?.type || "N/A",
      test_date: m.tests?.date || "N/A",
      correct_answers: m.correct_answers || 0,
      wrong_answers: m.wrong_answers || 0,
      unanswered_questions: m.unanswered_questions || 0,
      total: m.total || 0,
      max_marks: m.max_marks || 0,
      percentage: m.percentage || 0,
      performance: m.performance || "Average",
      biology_correct: m.biology_correct || 0,
      chemistry_correct: m.chemistry_correct || 0,
      physics_correct: m.physics_correct || 0,
      total_wrong: m.total_wrong || 0,
      biology: m.biology || 0,
      chemistry: m.chemistry || 0,
      physics: m.physics || 0
    }))
  }, [marks])

  // Sort marks chronologically for trend processing
  const sortedMarks = useMemo(() => {
    return [...formattedMarks].sort((a, b) => new Date(a.test_date || 0).getTime() - new Date(b.test_date || 0).getTime())
  }, [formattedMarks])

  // Group marks by category
  const biologyTests = useMemo(() => sortedMarks.filter(m => m.test_type === "weekly_biology"), [sortedMarks])
  const chemistryTests = useMemo(() => sortedMarks.filter(m => m.test_type === "weekly_chemistry"), [sortedMarks])
  const physicsTests = useMemo(() => sortedMarks.filter(m => m.test_type === "weekly_physics"), [sortedMarks])
  const grandTests = useMemo(() => sortedMarks.filter(m => m.test_type === "grand"), [sortedMarks])

  // Subject configurations
  const subjectsConfig = useMemo(() => [
    {
      id: "biology",
      name: "Biology",
      icon: "🧬",
      tests: biologyTests,
      max: 200,
    },
    {
      id: "chemistry",
      name: "Chemistry",
      icon: "🧪",
      tests: chemistryTests,
      max: 180,
    },
    {
      id: "physics",
      name: "Physics",
      icon: "⚛️",
      tests: physicsTests,
      max: 180,
    },
    {
      id: "grand",
      name: "Grand Test",
      icon: "🏆",
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
        "Student ID": student.student_id,
        "Student Name": student.name,
        "Batch": student.batch,
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
    XLSX.utils.book_append_sheet(wb, ws, "Academic Report")
    XLSX.writeFile(wb, `${student.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_neet_report.xlsx`)
    toast.success("Excel report downloaded successfully!")
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs">
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
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-450 font-semibold">
          No test score records logged for this student.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Subject Buttons Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {subjectsConfig.map(sub => {
              const isActive = activeSubject === sub.id
              return (
                <Button
                  key={sub.id}
                  onClick={() => setActiveSubject(sub.id)}
                  variant={isActive ? "default" : "outline"}
                  className={`h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isActive 
                      ? "bg-primary text-white hover:bg-primary/95" 
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{sub.icon}</span>
                  {sub.name}
                </Button>
              )
            })}
          </div>

          {currentSubjectData && (
            <div className="space-y-6 animate-fadeIn">
              {/* 1. Performance Graph */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">{currentSubjectData.config.name} Performance Trend</h3>
                <div className="w-full">
                  <LineChart 
                    data={currentSubjectData.chartPoints} 
                    maxVal={currentSubjectData.config.max} 
                    height={220} 
                  />
                </div>
              </div>

              {/* 2. Performance Insight Card */}
              <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Performance Insight</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                    currentSubjectData.insight === "Improving"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : currentSubjectData.insight === "Needs Improvement"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      currentSubjectData.insight === "Improving"
                        ? "bg-emerald-100 text-emerald-600"
                        : currentSubjectData.insight === "Needs Improvement"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-slate-200 text-slate-605"
                    }`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider block text-slate-450">Trend Rating</span>
                      <h4 className="text-sm font-black mt-0.5">
                        {currentSubjectData.insight === "Improving" && "🎉 Continuous Performance Improvement"}
                        {currentSubjectData.insight === "Needs Improvement" && "⚠️ Academic Shading: Target Revision Recommended"}
                        {currentSubjectData.insight === "Stable" && "⚖️ Stable Performance Range"}
                      </h4>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Test History Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">{currentSubjectData.config.name} Exam History Register</h3>
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
                        {currentSubjectData.historyList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-slate-450 font-semibold">
                              No test records logged for this subject.
                            </td>
                          </tr>
                        ) : (
                          currentSubjectData.historyList.map(m => {
                            const isExpanded = expandedTestId === m.id
                            const isGrandTest = activeSubject === "grand"

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
                                  className={`hover:bg-slate-50/20 transition-colors ${isGrandTest ? "cursor-pointer" : ""}`}
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
                                        <span className="text-[9px] text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-blue-150 shrink-0">
                                          {isExpanded ? "Hide details" : "Show details"}
                                        </span>
                                      )}
                                    </div>
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

                                {isGrandTest && isExpanded && (
                                  <tr>
                                    <td colSpan={8} className="p-4 bg-slate-50/50 border-y border-slate-100">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm space-y-1.5">
                                          <span className="text-[10px] font-extrabold text-emerald-600 block uppercase tracking-wider">🧬 Biology</span>
                                          <div className="flex justify-between text-xs text-slate-600">
                                            <span>Correct: <strong className="text-emerald-600">{bioC}</strong></span>
                                            <span>Wrong: <strong className="text-red-500">{bioW}</strong></span>
                                          </div>
                                          <div className="text-[11px] font-bold text-slate-700 pt-1 border-t border-slate-100 flex justify-between">
                                            <span>Score:</span>
                                            <span>{bioC * 4 - bioW} / 360</span>
                                          </div>
                                        </div>
                                        
                                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm space-y-1.5">
                                          <span className="text-[10px] font-extrabold text-amber-600 block uppercase tracking-wider">⚛️ Physics</span>
                                          <div className="flex justify-between text-xs text-slate-600">
                                            <span>Correct: <strong className="text-emerald-600">{physC}</strong></span>
                                            <span>Wrong: <strong className="text-red-500">{physW}</strong></span>
                                          </div>
                                          <div className="text-[11px] font-bold text-slate-700 pt-1 border-t border-slate-100 flex justify-between">
                                            <span>Score:</span>
                                            <span>{physC * 4 - physW} / 180</span>
                                          </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm space-y-1.5">
                                          <span className="text-[10px] font-extrabold text-blue-600 block uppercase tracking-wider">🧪 Chemistry</span>
                                          <div className="flex justify-between text-xs text-slate-600">
                                            <span>Correct: <strong className="text-emerald-600">{chemC}</strong></span>
                                            <span>Wrong: <strong className="text-red-500">{chemW}</strong></span>
                                          </div>
                                          <div className="text-[11px] font-bold text-slate-700 pt-1 border-t border-slate-100 flex justify-between">
                                            <span>Score:</span>
                                            <span>{chemC * 4 - chemW} / 180</span>
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

              {/* 4. Subject-wise Breakdown Summary (For Grand Test only) */}
              {activeSubject === "grand" && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Subject-wise Average Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Biology Average Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                          <span>🧬</span> Biology Average
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-semibold">Max: 360</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2">
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Avg Correct</span>
                          <span className="text-xl font-black text-emerald-600">
                            {(() => {
                              const list = currentSubjectData.historyList
                              if (list.length === 0) return "0.0"
                              const sum = list.reduce((acc, m) => acc + (m.biology_correct || 0), 0)
                              return (sum / list.length).toFixed(1)
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Avg Wrong</span>
                          <span className="text-xl font-black text-red-500">
                            {(() => {
                              const list = currentSubjectData.historyList
                              if (list.length === 0) return "0.0"
                              const sum = list.reduce((acc, m) => acc + Math.max(0, ((m.biology_correct || 0) * 4) - (m.biology || 0)), 0)
                              return (sum / list.length).toFixed(1)
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Avg Score</span>
                          <span className="text-xl font-black text-slate-800">
                            {(() => {
                              const list = currentSubjectData.historyList
                              if (list.length === 0) return "0.0"
                              const sum = list.reduce((acc, m) => acc + (m.biology || 0), 0)
                              return (sum / list.length).toFixed(1)
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Physics Average Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                          <span>⚛️</span> Physics Average
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-semibold">Max: 180</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2">
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Avg Correct</span>
                          <span className="text-xl font-black text-emerald-600">
                            {(() => {
                              const list = currentSubjectData.historyList
                              if (list.length === 0) return "0.0"
                              const sum = list.reduce((acc, m) => acc + (m.physics_correct || 0), 0)
                              return (sum / list.length).toFixed(1)
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Avg Wrong</span>
                          <span className="text-xl font-black text-red-500">
                            {(() => {
                              const list = currentSubjectData.historyList
                              if (list.length === 0) return "0.0"
                              const sum = list.reduce((acc, m) => acc + Math.max(0, ((m.physics_correct || 0) * 4) - (m.physics || 0)), 0)
                              return (sum / list.length).toFixed(1)
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Avg Score</span>
                          <span className="text-xl font-black text-slate-800">
                            {(() => {
                              const list = currentSubjectData.historyList
                              if (list.length === 0) return "0.0"
                              const sum = list.reduce((acc, m) => acc + (m.physics || 0), 0)
                              return (sum / list.length).toFixed(1)
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chemistry Average Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                          <span>🧪</span> Chemistry Average
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-semibold">Max: 180</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2">
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Avg Correct</span>
                          <span className="text-xl font-black text-emerald-600">
                            {(() => {
                              const list = currentSubjectData.historyList
                              if (list.length === 0) return "0.0"
                              const sum = list.reduce((acc, m) => acc + (m.chemistry_correct || 0), 0)
                              return (sum / list.length).toFixed(1)
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Avg Wrong</span>
                          <span className="text-xl font-black text-red-500">
                            {(() => {
                              const list = currentSubjectData.historyList
                              if (list.length === 0) return "0.0"
                              const sum = list.reduce((acc, m) => acc + Math.max(0, ((m.chemistry_correct || 0) * 4) - (m.chemistry || 0)), 0)
                              return (sum / list.length).toFixed(1)
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Avg Score</span>
                          <span className="text-xl font-black text-slate-800">
                            {(() => {
                              const list = currentSubjectData.historyList
                              if (list.length === 0) return "0.0"
                              const sum = list.reduce((acc, m) => acc + (m.chemistry || 0), 0)
                              return (sum / list.length).toFixed(1)
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
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
