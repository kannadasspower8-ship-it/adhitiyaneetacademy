"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Search,
  Loader2,
  PlusCircle,
  FileText,
  Calendar,
  Download,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Users,
  BookOpen,
  FlaskConical,
  Atom,
  Dna,
  Save,
  Eye,
  Trash2,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet
} from "lucide-react"
import { toast } from "@/lib/toast"
import { generateMonthlyReport, generateCompleteReport } from "@/lib/excel-export"
import * as XLSX from "xlsx"

// ─── Constants ───────────────────────────────────────────────────────────────

const batchOptions = [
  { value: "Repeater", icon: "🔁", desc: "Re-appearing candidates" },
  { value: "Rerepeater", icon: "🔄", desc: "Second re-attempt candidates" },
  { value: "Weekend Batch", icon: "📅", desc: "Weekend-only students" },
  { value: "Crash Course", icon: "⚡", desc: "Intensive short course" },
  { value: "Test Batch", icon: "📝", desc: "Practice test group" },
]

const testTypeOptions = [
  { value: "weekly_biology", label: "Weekly Biology Test", shortLabel: "Biology", icon: <Dna className="w-7 h-7" />, maxMarks: 200, totalQ: 50 },
  { value: "weekly_chemistry", label: "Weekly Chemistry Test", shortLabel: "Chemistry", icon: <FlaskConical className="w-7 h-7" />, maxMarks: 180, totalQ: 45 },
  { value: "weekly_physics", label: "Weekly Physics Test", shortLabel: "Physics", icon: <Atom className="w-7 h-7" />, maxMarks: 180, totalQ: 45 },
  { value: "grand", label: "Grand Monthly Test", shortLabel: "Grand Test", icon: <BookOpen className="w-7 h-7" />, maxMarks: 720, totalQ: 180 },
]

// ─── Types ───────────────────────────────────────────────────────────────────

interface StudentRow {
  id: string
  student_id: string
  name: string
  // Weekly fields
  correctAnswers: number
  wrongAnswers: number
  // Grand fields
  biologyCorrect: number
  chemistryCorrect: number
  physicsCorrect: number
  totalWrong: number
  // Computed
  unanswered: number
  score: number
  maxMarks: number
  percentage: number
  // UI state
  saved: boolean
  error: string
}

interface TestHistoryRecord {
  testId: string
  testName: string
  testType: string
  testDate: string
  batch: string
  studentCount: number
  createdAt: string
}

type ViewMode = "registry" | "wizard-batch" | "wizard-type" | "spreadsheet" | "view-record"

// ─── Score Calculator ────────────────────────────────────────────────────────

function calcRow(row: StudentRow, testType: string): StudentRow {
  const r = { ...row }
  if (testType === "grand") {
    const totalCorrect = Number(r.biologyCorrect) + Number(r.chemistryCorrect) + Number(r.physicsCorrect)
    r.score = (totalCorrect * 4) - Number(r.totalWrong)
    r.unanswered = 180 - (totalCorrect + Number(r.totalWrong))
    r.maxMarks = 720
    r.percentage = r.maxMarks > 0 ? (r.score / r.maxMarks) * 100 : 0
  } else {
    const totalQ = testType === "weekly_biology" ? 50 : 45
    const maxM = testType === "weekly_biology" ? 200 : 180
    r.score = (Number(r.correctAnswers) * 4) - Number(r.wrongAnswers)
    r.unanswered = totalQ - (Number(r.correctAnswers) + Number(r.wrongAnswers))
    r.maxMarks = maxM
    r.percentage = maxM > 0 ? (r.score / maxM) * 100 : 0
  }
  if (r.percentage < 0) r.percentage = 0
  if (r.score < 0) r.score = 0
  return r
}

function getGrading(pct: number) {
  if (pct >= 80) return "Excellent"
  if (pct >= 60) return "Good"
  if (pct >= 40) return "Average"
  return "Needs Improvement"
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function MarksRegistryPage() {
  const supabase = useMemo(() => createClient(), [])

  // ─── Page State ─────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("registry")
  const [allMarks, setAllMarks] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // ─── Wizard State ───────────────────────────────────────────────────────
  const [selectedBatch, setSelectedBatch] = useState("")
  const [selectedTestType, setSelectedTestType] = useState("")
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0])
  const [rows, setRows] = useState<StudentRow[]>([])
  const [saving, setSaving] = useState(false)

  // ─── View Record State ─────────────────────────────────────────────────
  const [viewRecord, setViewRecord] = useState<TestHistoryRecord | null>(null)
  const [viewRows, setViewRows] = useState<any[]>([])
  const [viewLoading, setViewLoading] = useState(false)

  // ─── Load Cache ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cm = localStorage.getItem("adhitya-neet-marks-registry")
      const cs = localStorage.getItem("adhitya-neet-students-cache")
      if (cm) { try { setAllMarks(JSON.parse(cm)); setFetching(false) } catch {} }
      if (cs) { try { setStudents(JSON.parse(cs)) } catch {} }
    }
  }, [])

  // ─── Fetch ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setFetching(true)
    else setIsSyncing(true)
    try {
      const { data: sData } = await supabase
        .from("students").select("id, student_id, name, batch")
        .eq("status", "Active").order("name", { ascending: true })
      if (sData) {
        setStudents(sData)
        if (typeof window !== "undefined") localStorage.setItem("adhitya-neet-students-cache", JSON.stringify(sData))
      }

      const { data: mData } = await supabase
        .from("student_marks")
        .select(`
          id, student_id, test_id,
          physics, chemistry, biology, total, percentage, performance,
          correct_answers, wrong_answers, unanswered_questions, max_marks,
          biology_correct, chemistry_correct, physics_correct, total_wrong,
          created_at,
          students ( name, batch ),
          tests ( name, date, type )
        `)
        .order("created_at", { ascending: false })
      if (mData) {
        setAllMarks(mData)
        if (typeof window !== "undefined") localStorage.setItem("adhitya-neet-marks-registry", JSON.stringify(mData))
      }
    } catch (err) { console.error(err) }
    finally { setFetching(false); setIsSyncing(false) }
  }, [supabase])

  useEffect(() => {
    const hasCache = typeof window !== "undefined" && localStorage.getItem("adhitya-neet-marks-registry")
    fetchData(!!hasCache)
  }, [fetchData])

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD TEST HISTORY RECORDS (grouped by test + batch)
  // ═══════════════════════════════════════════════════════════════════════════

  const historyRecords = useMemo<TestHistoryRecord[]>(() => {
    const map = new Map<string, TestHistoryRecord>()
    for (const m of allMarks) {
      const batch = m.students?.batch || "Unknown"
      const key = `${m.test_id}__${batch}`
      if (!map.has(key)) {
        map.set(key, {
          testId: m.test_id,
          testName: m.tests?.name || "Unknown Test",
          testType: m.tests?.type || "",
          testDate: m.tests?.date || "",
          batch,
          studentCount: 0,
          createdAt: m.created_at
        })
      }
      map.get(key)!.studentCount++
    }
    // Sort newest first
    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [allMarks])

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return historyRecords
    const q = searchTerm.toLowerCase()
    return historyRecords.filter(r =>
      r.batch.toLowerCase().includes(q) ||
      r.testName.toLowerCase().includes(q) ||
      r.testDate.includes(q)
    )
  }, [historyRecords, searchTerm])

  // ═══════════════════════════════════════════════════════════════════════════
  // WIZARD ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const startWizard = () => {
    setSelectedBatch("")
    setSelectedTestType("")
    setTestDate(new Date().toISOString().split("T")[0])
    setRows([])
    setViewMode("wizard-batch")
  }

  const selectBatch = (b: string) => {
    setSelectedBatch(b)
    setViewMode("wizard-type")
  }

  const selectTestType = (t: string) => {
    setSelectedTestType(t)
    const info = testTypeOptions.find(o => o.value === t)!
    const batchStudents = students.filter(s => s.batch === selectedBatch)
    setRows(batchStudents.map(s => ({
      id: s.id,
      student_id: s.student_id,
      name: s.name,
      correctAnswers: 0,
      wrongAnswers: 0,
      biologyCorrect: 0,
      chemistryCorrect: 0,
      physicsCorrect: 0,
      totalWrong: 0,
      unanswered: info.totalQ,
      score: 0,
      maxMarks: info.maxMarks,
      percentage: 0,
      saved: false,
      error: ""
    })))
    setViewMode("spreadsheet")
  }

  const updateRow = (idx: number, field: keyof StudentRow, val: number) => {
    setRows(prev => {
      const arr = [...prev]
      arr[idx] = calcRow({ ...arr[idx], [field]: val, saved: false }, selectedTestType)
      return arr
    })
  }

  // ─── Export Excel (from entry or view) ──────────────────────────────────

  const exportExcel = (
    exportRows: { name: string; correct: number; wrong: number; unanswered: number; score: number; percentage: number }[],
    batch: string,
    testLabel: string,
    date: string
  ) => {
    const data = exportRows.map(r => ({
      "Student Name": r.name,
      "Correct Answers": r.correct,
      "Wrong Answers": r.wrong,
      "Unanswered Questions": r.unanswered,
      "Score": r.score,
      "Percentage (%)": Number(r.percentage.toFixed(1))
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    ws["!cols"] = [{ wch: 25 }, { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 10 }, { wch: 14 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Marks")

    const safeB = batch.replace(/\s+/g, "_")
    const safeT = testLabel.replace(/\s+/g, "_")
    const parts = date.split("-") // yyyy-mm-dd
    const safeD = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : date.replace(/-/g, "_")
    XLSX.writeFile(wb, `${safeB}_${safeT}_${safeD}.xlsx`)
  }

  const handleExportFromEntry = () => {
    const info = testTypeOptions.find(t => t.value === selectedTestType)!
    const exportRows = rows.map(r => ({
      name: r.name,
      correct: selectedTestType === "grand"
        ? Number(r.biologyCorrect) + Number(r.chemistryCorrect) + Number(r.physicsCorrect)
        : Number(r.correctAnswers),
      wrong: selectedTestType === "grand" ? Number(r.totalWrong) : Number(r.wrongAnswers),
      unanswered: r.unanswered,
      score: r.score,
      percentage: r.percentage
    }))
    exportExcel(exportRows, selectedBatch, info.label, testDate)
    toast.success("Excel file downloaded!")
  }

  // ─── Save Test Record ──────────────────────────────────────────────────

  const handleSaveTestRecord = async () => {
    const filledRows = rows.filter(r => {
      if (selectedTestType === "grand") return r.biologyCorrect > 0 || r.chemistryCorrect > 0 || r.physicsCorrect > 0 || r.totalWrong > 0
      return r.correctAnswers > 0 || r.wrongAnswers > 0
    })

    if (filledRows.length === 0) {
      toast.error("Please enter marks for at least one student.")
      return
    }

    setSaving(true)
    const tid = toast.loading(`Saving test record for ${filledRows.length} students...`)

    try {
      // 1. Resolve or create Test entity
      const info = testTypeOptions.find(t => t.value === selectedTestType)!
      const testName = `${info.label} - ${testDate}`

      let testId = ""
      const { data: existing } = await supabase.from("tests").select("id").eq("name", testName).maybeSingle()
      if (existing) {
        testId = existing.id
      } else {
        const { data: created, error } = await supabase.from("tests")
          .insert({ name: testName, date: testDate, type: selectedTestType, max_marks: info.maxMarks })
          .select().single()
        if (error) throw error
        testId = created.id
      }

      // 2. Insert marks for each filled student
      let successCount = 0
      for (const row of filledRows) {
        const c = calcRow(row, selectedTestType)
        let bio = 0, chem = 0, phys = 0
        if (selectedTestType === "weekly_biology") bio = c.score
        else if (selectedTestType === "weekly_chemistry") chem = c.score
        else if (selectedTestType === "weekly_physics") phys = c.score
        else {
          bio = Number(row.biologyCorrect) * 4
          chem = Number(row.chemistryCorrect) * 4
          phys = Number(row.physicsCorrect) * 4
        }

        const totalCorrect = selectedTestType === "grand"
          ? Number(row.biologyCorrect) + Number(row.chemistryCorrect) + Number(row.physicsCorrect)
          : Number(row.correctAnswers)
        const totalWrong = selectedTestType === "grand" ? Number(row.totalWrong) : Number(row.wrongAnswers)

        const { error } = await supabase.from("student_marks").insert({
          student_id: row.id,
          test_id: testId,
          physics: phys,
          chemistry: chem,
          biology: bio,
          total: c.score,
          percentage: Number(c.percentage.toFixed(2)),
          performance: getGrading(c.percentage),
          correct_answers: totalCorrect,
          wrong_answers: totalWrong,
          unanswered_questions: c.unanswered,
          max_marks: c.maxMarks,
          biology_correct: selectedTestType === "grand" ? Number(row.biologyCorrect) : null,
          chemistry_correct: selectedTestType === "grand" ? Number(row.chemistryCorrect) : null,
          physics_correct: selectedTestType === "grand" ? Number(row.physicsCorrect) : null,
          total_wrong: selectedTestType === "grand" ? Number(row.totalWrong) : null
        })

        if (!error) {
          successCount++
          setRows(prev => {
            const arr = [...prev]
            const i = arr.findIndex(r => r.id === row.id)
            if (i >= 0) arr[i] = { ...arr[i], saved: true, error: "" }
            return arr
          })
        } else {
          setRows(prev => {
            const arr = [...prev]
            const i = arr.findIndex(r => r.id === row.id)
            if (i >= 0) arr[i] = { ...arr[i], error: error.message }
            return arr
          })
        }
      }

      toast.success(`✅ Test Record Saved Successfully! (${successCount} students)`, tid)
      fetchData(true)
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`, tid)
    } finally {
      setSaving(false)
    }
  }

  // ─── View Record ───────────────────────────────────────────────────────

  const handleViewRecord = async (rec: TestHistoryRecord) => {
    setViewRecord(rec)
    setViewLoading(true)
    setViewMode("view-record")

    try {
      const { data } = await supabase
        .from("student_marks")
        .select(`
          id, student_id, correct_answers, wrong_answers, unanswered_questions,
          total, percentage, max_marks,
          biology_correct, chemistry_correct, physics_correct, total_wrong,
          students ( name, batch, student_id )
        `)
        .eq("test_id", rec.testId)

      if (data) {
        const filtered = data.filter((m: any) => m.students?.batch === rec.batch)
        setViewRows(filtered)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setViewLoading(false)
    }
  }

  const handleExportFromView = () => {
    if (!viewRecord) return
    const info = testTypeOptions.find(t => t.value === viewRecord.testType)
    const exportRows = viewRows.map((m: any) => ({
      name: m.students?.name || "—",
      correct: m.correct_answers || 0,
      wrong: m.wrong_answers || 0,
      unanswered: m.unanswered_questions || 0,
      score: m.total || 0,
      percentage: m.percentage || 0
    }))
    exportExcel(exportRows, viewRecord.batch, info?.label || viewRecord.testName, viewRecord.testDate)
    toast.success("Excel file downloaded!")
  }

  // ─── Delete Record ─────────────────────────────────────────────────────

  const handleDeleteRecord = async (rec: TestHistoryRecord) => {
    const confirm1 = confirm(`Delete all marks for "${rec.batch} – ${rec.testName}"?\n\nThis will remove marks for ${rec.studentCount} students. This action cannot be undone.`)
    if (!confirm1) return

    const tid = toast.loading("Deleting test record...")
    try {
      // Get all mark IDs for this test + batch
      const { data: marks } = await supabase
        .from("student_marks")
        .select("id, students ( batch )")
        .eq("test_id", rec.testId)

      if (marks) {
        const idsToDelete = marks
          .filter((m: any) => m.students?.batch === rec.batch)
          .map((m: any) => m.id)

        if (idsToDelete.length > 0) {
          const { error } = await supabase.from("student_marks").delete().in("id", idsToDelete)
          if (error) throw error
        }
      }

      toast.success("Test record deleted successfully.", tid)
      fetchData(true)
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`, tid)
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  const getTestLabel = (type: string) => testTypeOptions.find(t => t.value === type)?.label || type
  const formatDate = (d: string) => {
    if (!d) return "—"
    const parts = d.split("-")
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : d
  }
  const pctColor = (p: number) => p >= 80 ? "text-emerald-600" : p >= 60 ? "text-blue-600" : p >= 40 ? "text-amber-600" : "text-red-500"
  const pctBg = (p: number) => p >= 80 ? "bg-emerald-50 border-emerald-200" : p >= 60 ? "bg-blue-50 border-blue-200" : p >= 40 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"

  const isGrand = selectedTestType === "grand"
  const testInfo = testTypeOptions.find(t => t.value === selectedTestType)

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: WIZARD — SELECT BATCH
  // ═══════════════════════════════════════════════════════════════════════════

  if (viewMode === "wizard-batch") {
    return (
      <div className="animate-fadeIn">
        <WizardHeader step={1} onBack={() => setViewMode("registry")} backLabel="Back to Registry" />
        <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Select Batch</h2>
            <p className="text-slate-500">Choose the batch to enter test marks for</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {batchOptions.map(b => {
              const count = students.filter(s => s.batch === b.value).length
              return (
                <button
                  key={b.value}
                  onClick={() => selectBatch(b.value)}
                  className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-lg hover:scale-[1.02] transition-all text-left group"
                >
                  <span className="text-3xl sm:text-4xl">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">{b.value}</h3>
                    <p className="text-xs text-slate-400 font-medium">{count} student{count !== 1 ? "s" : ""} enrolled</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: WIZARD — SELECT TEST TYPE
  // ═══════════════════════════════════════════════════════════════════════════

  if (viewMode === "wizard-type") {
    return (
      <div className="animate-fadeIn">
        <WizardHeader step={2} onBack={() => setViewMode("wizard-batch")} backLabel="Change Batch" selectedBatch={selectedBatch} />
        <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Select Test Type</h2>
            <p className="text-slate-500">
              Batch: <span className="font-bold text-blue-600">{selectedBatch}</span>
            </p>
          </div>

          {/* Date Picker */}
          <div className="mb-8 max-w-xs mx-auto">
            <Label className="text-slate-700 font-bold text-sm mb-2 block">📅 Test Date</Label>
            <Input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="h-12 rounded-xl border-slate-300 text-slate-800 text-sm font-medium w-full text-center"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testTypeOptions.map(t => (
              <button
                key={t.value}
                onClick={() => selectTestType(t.value)}
                className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-lg hover:scale-[1.02] transition-all text-left group"
              >
                <div className="text-slate-500 group-hover:text-indigo-600 transition-colors">{t.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">{t.label}</h3>
                  <p className="text-xs text-slate-400 font-medium">Max: {t.maxMarks} marks · {t.totalQ} questions</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: SPREADSHEET — EXCEL-LIKE MARK ENTRY
  // ═══════════════════════════════════════════════════════════════════════════

  if (viewMode === "spreadsheet") {
    const allSaved = rows.length > 0 && rows.every(r => r.saved)

    return (
      <div className="animate-fadeIn">
        <WizardHeader step={3} onBack={() => setViewMode("wizard-type")} backLabel="Change Test" selectedBatch={selectedBatch} selectedTest={testInfo?.label} />

        <div className="px-2 sm:px-4 py-4">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>{batchOptions.find(b => b.value === selectedBatch)?.icon}</span>
                  <span>{selectedBatch}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-blue-700">{testInfo?.label}</span>
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  📅 {formatDate(testDate)} · {rows.length} students · Enter marks below
                </p>
              </div>
              {allSaved && (
                <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> All Saved
                </span>
              )}
            </div>
          </div>

          {/* Spreadsheet Table */}
          {rows.length === 0 ? (
            <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-600">No Students Found</h3>
              <p className="text-sm text-slate-400 mt-1">Add students to the &quot;{selectedBatch}&quot; batch first.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="text-left py-3 px-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider w-10">#</th>
                      <th className="text-left py-3 px-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider min-w-[150px]">Student Name</th>
                      {!isGrand ? (
                        <>
                          <th className="text-center py-3 px-3 font-bold text-emerald-600 text-[11px] uppercase tracking-wider min-w-[120px]">Correct Answers</th>
                          <th className="text-center py-3 px-3 font-bold text-red-500 text-[11px] uppercase tracking-wider min-w-[120px]">Wrong Answers</th>
                        </>
                      ) : (
                        <>
                          <th className="text-center py-3 px-3 font-bold text-green-600 text-[11px] uppercase tracking-wider min-w-[100px]">Bio Correct</th>
                          <th className="text-center py-3 px-3 font-bold text-cyan-600 text-[11px] uppercase tracking-wider min-w-[100px]">Chem Correct</th>
                          <th className="text-center py-3 px-3 font-bold text-orange-600 text-[11px] uppercase tracking-wider min-w-[100px]">Phys Correct</th>
                          <th className="text-center py-3 px-3 font-bold text-red-500 text-[11px] uppercase tracking-wider min-w-[100px]">Wrong Answers</th>
                        </>
                      )}
                      <th className="text-center py-3 px-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider min-w-[110px]">Unanswered</th>
                      <th className="text-center py-3 px-3 font-bold text-blue-600 text-[11px] uppercase tracking-wider min-w-[100px]">Score</th>
                      <th className="text-center py-3 px-3 font-bold text-indigo-600 text-[11px] uppercase tracking-wider min-w-[100px]">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`border-b border-slate-100 transition-colors ${
                          row.saved ? "bg-emerald-50/40" : row.error ? "bg-red-50/40" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        } hover:bg-blue-50/20`}
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-400 text-xs">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 text-sm">
                          {row.name}
                          {row.saved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline ml-2" />}
                          {row.error && <span className="text-[10px] text-red-500 block font-medium">Error: {row.error}</span>}
                        </td>

                        {!isGrand ? (
                          <>
                            <td className="py-2 px-2 text-center">
                              <input type="number" min="0" max={testInfo?.totalQ || 50}
                                value={row.correctAnswers || ""}
                                onChange={e => updateRow(idx, "correctAnswers", Number(e.target.value))}
                                disabled={row.saved || saving} placeholder="0"
                                className="w-full max-w-[80px] h-10 text-center rounded-lg border border-slate-250 text-slate-800 font-semibold text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 mx-auto block"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input type="number" min="0"
                                value={row.wrongAnswers || ""}
                                onChange={e => updateRow(idx, "wrongAnswers", Number(e.target.value))}
                                disabled={row.saved || saving} placeholder="0"
                                className="w-full max-w-[80px] h-10 text-center rounded-lg border border-slate-250 text-slate-800 font-semibold text-sm focus:border-red-300 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 mx-auto block"
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-2 text-center">
                              <input type="number" min="0" max="90"
                                value={row.biologyCorrect || ""}
                                onChange={e => updateRow(idx, "biologyCorrect", Number(e.target.value))}
                                disabled={row.saved || saving} placeholder="0"
                                className="w-full max-w-[70px] h-10 text-center rounded-lg border border-slate-250 text-slate-800 font-semibold text-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 mx-auto block"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input type="number" min="0" max="45"
                                value={row.chemistryCorrect || ""}
                                onChange={e => updateRow(idx, "chemistryCorrect", Number(e.target.value))}
                                disabled={row.saved || saving} placeholder="0"
                                className="w-full max-w-[70px] h-10 text-center rounded-lg border border-slate-250 text-slate-800 font-semibold text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 mx-auto block"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input type="number" min="0" max="45"
                                value={row.physicsCorrect || ""}
                                onChange={e => updateRow(idx, "physicsCorrect", Number(e.target.value))}
                                disabled={row.saved || saving} placeholder="0"
                                className="w-full max-w-[70px] h-10 text-center rounded-lg border border-slate-250 text-slate-800 font-semibold text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 mx-auto block"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input type="number" min="0"
                                value={row.totalWrong || ""}
                                onChange={e => updateRow(idx, "totalWrong", Number(e.target.value))}
                                disabled={row.saved || saving} placeholder="0"
                                className="w-full max-w-[70px] h-10 text-center rounded-lg border border-slate-250 text-slate-800 font-semibold text-sm focus:border-red-300 focus:ring-2 focus:ring-red-100 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 mx-auto block"
                              />
                            </td>
                          </>
                        )}

                        <td className="py-2 px-3 text-center font-semibold text-slate-500">{row.unanswered}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`font-extrabold text-base ${pctColor(row.percentage)}`}>{row.score}</span>
                          <span className="text-[10px] text-slate-400 font-medium"> / {row.maxMarks}</span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${pctBg(row.percentage)} ${pctColor(row.percentage)}`}>
                            {row.percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ─── Bottom Bar: Export Excel + Save Test Record ─── */}
              <div className="bg-slate-50 border-t-2 border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-slate-500 font-medium">
                  <span className="font-bold text-slate-700">{rows.filter(r => r.saved).length}</span> / {rows.length} saved
                </p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    onClick={handleExportFromEntry}
                    variant="outline"
                    className="border-slate-300 text-slate-700 font-bold text-sm rounded-xl h-12 px-5 flex items-center gap-2 flex-1 sm:flex-none justify-center hover:bg-slate-100"
                  >
                    <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
                    Export Excel
                  </Button>
                  <Button
                    onClick={handleSaveTestRecord}
                    disabled={saving || allSaved}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl h-12 px-6 flex items-center gap-2 flex-1 sm:flex-none justify-center shadow-md shadow-blue-200"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
                    {saving ? "Saving..." : allSaved ? "Saved ✓" : "Save Test Record"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: VIEW SAVED TEST RECORD
  // ═══════════════════════════════════════════════════════════════════════════

  if (viewMode === "view-record" && viewRecord) {
    const recType = viewRecord.testType
    const recIsGrand = recType === "grand"

    return (
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <button
              onClick={() => { setViewMode("registry"); setViewRecord(null); setViewRows([]) }}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Registry
            </button>
            <Button
              onClick={handleExportFromView}
              variant="outline"
              className="border-slate-300 text-slate-700 font-bold text-sm rounded-xl h-10 px-4 flex items-center gap-2 hover:bg-slate-100"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
            </Button>
          </div>
        </div>

        <div className="px-2 sm:px-4 py-4">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5">
            <h2 className="text-lg font-extrabold text-slate-900">{viewRecord.batch} — {getTestLabel(viewRecord.testType)}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">📅 {formatDate(viewRecord.testDate)} · {viewRows.length} students</p>
          </div>

          {viewLoading ? (
            <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center flex items-center justify-center gap-2 text-slate-400 font-semibold">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading test record...
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="text-left py-3 px-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider w-10">#</th>
                      <th className="text-left py-3 px-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider min-w-[150px]">Student Name</th>
                      <th className="text-center py-3 px-3 font-bold text-emerald-600 text-[11px] uppercase tracking-wider">Correct Answers</th>
                      <th className="text-center py-3 px-3 font-bold text-red-500 text-[11px] uppercase tracking-wider">Wrong Answers</th>
                      <th className="text-center py-3 px-3 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Unanswered</th>
                      <th className="text-center py-3 px-3 font-bold text-blue-600 text-[11px] uppercase tracking-wider">Score</th>
                      <th className="text-center py-3 px-3 font-bold text-indigo-600 text-[11px] uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewRows.map((m: any, idx: number) => (
                      <tr key={m.id} className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                        <td className="py-2.5 px-3 font-bold text-slate-400 text-xs">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 text-sm">{m.students?.name || "—"}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{m.correct_answers || 0}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-red-500">{m.wrong_answers || 0}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-500">{m.unanswered_questions || 0}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`font-extrabold ${pctColor(m.percentage || 0)}`}>{m.total || 0}</span>
                          <span className="text-[10px] text-slate-400 font-medium"> / {m.max_marks || 0}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${pctBg(m.percentage || 0)} ${pctColor(m.percentage || 0)}`}>
                            {Number(m.percentage || 0).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: REGISTRY — TEST HISTORY PAGE (DEFAULT)
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-5 text-sm animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Marks Registry
            {isSyncing && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Test history register — all completed tests and their records.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button onClick={startWizard}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-bold text-sm rounded-xl px-5 h-12 flex-1 sm:flex-none justify-center shadow-md shadow-blue-200">
            <PlusCircle className="w-4.5 h-4.5" /> Enter Marks
          </Button>
          <Button variant="outline" onClick={() => generateMonthlyReport(supabase)}
            className="border-slate-250 text-slate-600 font-bold text-sm rounded-xl px-4 h-12 flex items-center gap-2 hover:bg-slate-50">
            <Download className="w-4 h-4" /> Monthly Report
          </Button>
          <Button variant="outline" onClick={() => generateCompleteReport(supabase)}
            className="border-slate-250 text-slate-600 font-bold text-sm rounded-xl px-4 h-12 flex items-center gap-2 hover:bg-slate-50">
            <FileText className="w-4 h-4" /> Master Backup
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by batch, test name, or date..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-11 rounded-xl border-slate-250 text-slate-800 text-sm w-full"
          />
        </div>
      </div>

      {/* History Table */}
      {fetching ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center flex items-center justify-center gap-2 text-slate-400 font-semibold">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading test history...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-600">No Test Records Yet</h3>
          <p className="text-sm text-slate-400 mt-1">Click &quot;Enter Marks&quot; to record your first test.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="text-left py-3.5 px-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Batch</th>
                  <th className="text-left py-3.5 px-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Test Type</th>
                  <th className="text-left py-3.5 px-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Test Date</th>
                  <th className="text-center py-3.5 px-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Students</th>
                  <th className="text-right py-3.5 px-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((rec, idx) => (
                  <tr key={`${rec.testId}-${rec.batch}`} className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"} hover:bg-blue-50/20 transition-colors`}>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span>{batchOptions.find(b => b.value === rec.batch)?.icon || "📋"}</span>
                        {rec.batch}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{getTestLabel(rec.testType)}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-600">{formatDate(rec.testDate)}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 text-xs">
                        <Users className="w-3 h-3" /> {rec.studentCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewRecord(rec)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => {
                            const info = testTypeOptions.find(t => t.value === rec.testType)
                            // Fetch and export
                            supabase.from("student_marks")
                              .select("correct_answers, wrong_answers, unanswered_questions, total, percentage, max_marks, students ( name, batch )")
                              .eq("test_id", rec.testId)
                              .then(({ data }) => {
                                if (data) {
                                  const filtered = data.filter((m: any) => m.students?.batch === rec.batch)
                                  const exportRows = filtered.map((m: any) => ({
                                    name: m.students?.name || "—",
                                    correct: m.correct_answers || 0,
                                    wrong: m.wrong_answers || 0,
                                    unanswered: m.unanswered_questions || 0,
                                    score: m.total || 0,
                                    percentage: m.percentage || 0
                                  }))
                                  exportExcel(exportRows, rec.batch, info?.label || rec.testName, rec.testDate)
                                  toast.success("Excel file downloaded!")
                                }
                              })
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// WIZARD STEP HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function WizardHeader({ step, onBack, backLabel, selectedBatch, selectedTest }: {
  step: number
  onBack: () => void
  backLabel: string
  selectedBatch?: string
  selectedTest?: string
}) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </button>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {[
            { n: 1, label: "Batch" },
            { n: 2, label: "Test Type" },
            { n: 3, label: "Enter Marks" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-1.5">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === n ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : step > n ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                    : "bg-slate-100 text-slate-400 border-2 border-slate-200"
              }`}>
                {step > n ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={`hidden sm:block text-xs font-semibold ${
                step === n ? "text-blue-700" : step > n ? "text-emerald-600" : "text-slate-400"
              }`}>
                {step > n && n === 1 && selectedBatch ? selectedBatch :
                 step > n && n === 2 && selectedTest ? selectedTest : label}
              </span>
              {n < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
