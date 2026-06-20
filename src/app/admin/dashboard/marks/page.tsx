"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Loader2, 
  PlusCircle, 
  FileText, 
  User, 
  Calendar, 
  Award,
  BookOpen, 
  Download,
  RefreshCw,
  Info
} from "lucide-react"
import { toast } from "@/lib/toast"
import { generateSingleTestReport, generateMonthlyReport, generateCompleteReport } from "@/lib/excel-export"
import * as XLSX from "xlsx"

const testTypes = [
  { value: "weekly_biology", label: "Weekly Biology Test (Max 200)" },
  { value: "weekly_chemistry", label: "Weekly Chemistry Test (Max 180)" },
  { value: "weekly_physics", label: "Weekly Physics Test (Max 180)" },
  { value: "grand", label: "Grand Monthly Test (Max 720)" }
]

export default function MarksRegistryPage() {
  const supabase = useMemo(() => createClient(), [])
  const [marks, setMarks] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [testsList, setTestsList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [filterBatch, setFilterBatch] = useState("All")

  // Form State
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  
  const [markForm, setMarkForm] = useState({
    id: "",
    studentId: "", // UUID
    testType: "weekly_biology",
    testDate: new Date().toISOString().split("T")[0],
    
    // Weekly Fields
    correctAnswers: 0,
    wrongAnswers: 0,
    
    // Grand Test Fields
    biologyCorrect: 0,
    chemistryCorrect: 0,
    physicsCorrect: 0,
    totalWrong: 0
  })

  // Load from local storage cache immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedMarks = localStorage.getItem("adhitya-neet-marks-registry")
      const cachedStudents = localStorage.getItem("adhitya-neet-students-cache")
      if (cachedMarks) {
        setMarks(JSON.parse(cachedMarks))
        setFetching(false)
      }
      if (cachedStudents) {
        setStudents(JSON.parse(cachedStudents))
      }
    }
  }, [])

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetching(true)
    else setIsSyncing(true)
    try {
      // 1. Fetch Students
      const { data: studentsData } = await supabase
        .from("students")
        .select("id, student_id, name, batch")
        .eq("status", "Active")
        .order("name", { ascending: true })

      if (studentsData) {
        setStudents(studentsData)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-students-cache", JSON.stringify(studentsData))
        }
      }

      // 2. Fetch Marks with joined Student and Test info
      const { data: marksData } = await supabase
        .from("student_marks")
        .select(`
          id,
          student_id,
          test_id,
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
          students (
            name,
            batch
          ),
          tests (
            name,
            date,
            type
          )
        `)
        .order("created_at", { ascending: false })

      if (marksData) {
        setMarks(marksData)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-marks-registry", JSON.stringify(marksData))
        }

        // Generate unique test names list for reports
        const tests = Array.from(new Set(marksData.map(m => JSON.stringify({ id: m.test_id, name: m.tests?.name }))))
          .map(t => JSON.parse(t))
          .filter(t => t.id && t.name)
        setTestsList(tests)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
      setIsSyncing(false)
    }
  }, [supabase])

  useEffect(() => {
    const hasCache = typeof window !== "undefined" && localStorage.getItem("adhitya-neet-marks-registry")
    fetchData(hasCache ? true : false)
  }, [fetchData])

  // Live Score Calculator
  const calculatedFields = useMemo(() => {
    const { testType, correctAnswers, wrongAnswers, biologyCorrect, chemistryCorrect, physicsCorrect, totalWrong } = markForm
    
    if (testType === "grand") {
      const totalQuestions = 180
      const maxMarks = 720
      const totalCorrect = Number(biologyCorrect) + Number(chemistryCorrect) + Number(physicsCorrect)
      const score = (totalCorrect * 4) - Number(totalWrong)
      const unanswered = totalQuestions - (totalCorrect + Number(totalWrong))
      const percentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0
      
      return {
        unanswered,
        score,
        maxMarks,
        percentage
      }
    } else {
      let totalQuestions = 50
      let maxMarks = 200

      if (testType === "weekly_chemistry" || testType === "weekly_physics") {
        totalQuestions = 45
        maxMarks = 180
      }

      const score = (Number(correctAnswers) * 4) - Number(wrongAnswers)
      const unanswered = totalQuestions - (Number(correctAnswers) + Number(wrongAnswers))
      const percentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0

      return {
        unanswered,
        score,
        maxMarks,
        percentage
      }
    }
  }, [markForm])

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!markForm.studentId) {
      alert("Please select a student.")
      return
    }
    setLoading(true)
    const toastId = toast.loading("Saving test marks...")

    try {
      const { testType, testDate, studentId, correctAnswers, wrongAnswers, biologyCorrect, chemistryCorrect, physicsCorrect, totalWrong } = markForm
      
      // 1. Resolve or Create Test entity
      let resolvedTestId = ""
      const typeLabel = testTypes.find(t => t.value === testType)?.label.split(" (")[0] || "Test"
      const testName = `${typeLabel} - ${testDate}`
      
      const { data: existingTest } = await supabase
        .from("tests")
        .select("id")
        .eq("name", testName)
        .maybeSingle()

      if (existingTest) {
        resolvedTestId = existingTest.id
      } else {
        const { data: newTest, error: errTest } = await supabase
          .from("tests")
          .insert({
            name: testName,
            date: testDate,
            type: testType,
            max_marks: calculatedFields.maxMarks
          })
          .select()
          .single()

        if (errTest) throw errTest
        resolvedTestId = newTest.id
      }

      // 2. Setup Student Marks Payload
      let bioMarks = 0
      let chemMarks = 0
      let physMarks = 0
      
      if (testType === "weekly_biology") bioMarks = calculatedFields.score
      else if (testType === "weekly_chemistry") chemMarks = calculatedFields.score
      else if (testType === "weekly_physics") physMarks = calculatedFields.score
      else {
        bioMarks = Number(biologyCorrect) * 4
        chemMarks = Number(chemistryCorrect) * 4
        physMarks = Number(physicsCorrect) * 4
      }

      let grading = "Needs Improvement"
      if (calculatedFields.percentage >= 80) grading = "Excellent"
      else if (calculatedFields.percentage >= 60) grading = "Good"
      else if (calculatedFields.percentage >= 40) grading = "Average"

      const payload: any = {
        student_id: studentId,
        test_id: resolvedTestId,
        physics: physMarks,
        chemistry: chemMarks,
        biology: bioMarks,
        total: calculatedFields.score,
        percentage: Number(calculatedFields.percentage.toFixed(2)),
        performance: grading,
        correct_answers: testType === "grand" ? (Number(biologyCorrect) + Number(chemistryCorrect) + Number(physicsCorrect)) : Number(correctAnswers),
        wrong_answers: testType === "grand" ? Number(totalWrong) : Number(wrongAnswers),
        unanswered_questions: calculatedFields.unanswered,
        max_marks: calculatedFields.maxMarks,
        biology_correct: testType === "grand" ? Number(biologyCorrect) : null,
        chemistry_correct: testType === "grand" ? Number(chemistryCorrect) : null,
        physics_correct: testType === "grand" ? Number(physicsCorrect) : null,
        total_wrong: testType === "grand" ? Number(totalWrong) : null
      }

      if (formMode === "add") {
        const { data, error } = await supabase.from("student_marks").insert(payload).select()
        if (error) throw error
        toast.success("Marks recorded successfully!", toastId)
      } else {
        const { error } = await supabase.from("student_marks").update(payload).eq("id", markForm.id)
        if (error) throw error
        toast.success("Marks updated successfully!", toastId)
      }

      // Reset
      setMarkForm({
        id: "",
        studentId: "",
        testType: "weekly_biology",
        testDate: new Date().toISOString().split("T")[0],
        correctAnswers: 0,
        wrongAnswers: 0,
        biologyCorrect: 0,
        chemistryCorrect: 0,
        physicsCorrect: 0,
        totalWrong: 0
      })
      setFormOpen(false)
      fetchData(true)
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (m: any) => {
    const isGrand = m.tests?.type === "grand"
    setMarkForm({
      id: m.id,
      studentId: m.student_id,
      testType: m.tests?.type || "weekly_biology",
      testDate: m.tests?.date || new Date().toISOString().split("T")[0],
      correctAnswers: isGrand ? 0 : m.correct_answers || 0,
      wrongAnswers: isGrand ? 0 : m.wrong_answers || 0,
      biologyCorrect: isGrand ? m.biology_correct || 0 : 0,
      chemistryCorrect: isGrand ? m.chemistry_correct || 0 : 0,
      physicsCorrect: isGrand ? m.physics_correct || 0 : 0,
      totalWrong: isGrand ? m.total_wrong || 0 : 0
    })
    setFormMode("edit")
    setFormOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove marks record for student "${name}"?`)) return
    setLoading(true)
    const toastId = toast.loading("Deleting marks record...")

    const backup = [...marks]
    const updated = marks.filter(m => m.id !== id)
    setMarks(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("adhitya-neet-marks-registry", JSON.stringify(updated))
    }

    try {
      const { error } = await supabase.from("student_marks").delete().eq("id", id)
      if (error) throw error
      toast.success("Marks record deleted.", toastId)
    } catch (err: any) {
      setMarks(backup)
      if (typeof window !== "undefined") {
        localStorage.setItem("adhitya-neet-marks-registry", JSON.stringify(backup))
      }
      toast.error(`Delete failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  // Individual Student Export Excel
  const handleExportStudent = (studentId: string, name: string) => {
    const studentRecords = marks.filter(m => m.student_id === studentId)
    if (studentRecords.length === 0) {
      alert("No marks history found for this student.")
      return
    }

    const data = studentRecords.map(m => ({
      "Student Name": m.students?.name,
      "Batch": m.students?.batch,
      "Test Name": m.tests?.name,
      "Test Type": m.tests?.type,
      "Test Date": m.tests?.date,
      "Correct Answers": m.correct_answers,
      "Wrong Answers": m.wrong_answers,
      "Unanswered Questions": m.unanswered_questions,
      "Marks Obtained": m.total,
      "Maximum Marks": m.max_marks,
      "Percentage (%)": m.percentage
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Performance Report")
    XLSX.writeFile(wb, `${name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_marks.xlsx`)
  }

  const filteredMarks = useMemo(() => {
    return marks.filter(m => {
      const matchesSearch = m.students?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "All" || m.tests?.type === filterType
      const matchesBatch = filterBatch === "All" || m.students?.batch === filterBatch
      return matchesSearch && matchesType && matchesBatch
    })
  }, [marks, searchTerm, filterType, filterBatch])

  return (
    <div className="space-y-6 text-sm animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Marks Management Registry
            {isSyncing && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm">Enter weekly and grand test results, audit subject records, and export files.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Add Marks */}
          <Button
            onClick={() => {
              setFormMode("add")
              setMarkForm({
                id: "",
                studentId: students[0]?.id || "",
                testType: "weekly_biology",
                testDate: new Date().toISOString().split("T")[0],
                correctAnswers: 0,
                wrongAnswers: 0,
                biologyCorrect: 0,
                chemistryCorrect: 0,
                physicsCorrect: 0,
                totalWrong: 0
              })
              setFormOpen(true)
            }}
            className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold text-sm rounded-xl px-5 h-12 flex-1 sm:flex-none justify-center"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            Enter Marks
          </Button>

          {/* Export Monthly Compilation */}
          <Button
            variant="outline"
            onClick={() => generateMonthlyReport(supabase)}
            className="border-slate-250 text-slate-655 font-bold text-sm rounded-xl px-4 h-12 flex items-center gap-2 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Export Monthly Report
          </Button>
          
          {/* Backup Database */}
          <Button
            variant="outline"
            onClick={() => generateCompleteReport(supabase)}
            className="border-slate-250 text-slate-655 font-bold text-sm rounded-xl px-4 h-12 flex items-center gap-2 hover:bg-slate-50"
          >
            <FileText className="w-4 h-4" />
            Master Backup
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Registry list */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 rounded-xl border-slate-250 text-slate-800 text-xs w-full"
              />
            </div>

            {/* Test Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-11 rounded-xl border border-slate-250 bg-white px-3 text-xs text-slate-700 font-semibold focus-visible:outline-none w-full"
              >
                <option value="All">All Test Types</option>
                {testTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label.split(" (")[0]}</option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="h-11 rounded-xl border border-slate-250 bg-white px-3 text-xs text-slate-700 font-semibold focus-visible:outline-none w-full"
              >
                <option value="All">All Batches</option>
                <option value="Repeater">Repeater</option>
                <option value="Rerepeater">Rerepeater</option>
                <option value="Weekend Batch">Weekend Batch</option>
                <option value="Crash Course">Crash Course</option>
                <option value="Test Batch">Test Batch</option>
              </select>
            </div>
          </div>

          {/* List display */}
          {fetching ? (
            <div className="py-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 flex justify-center items-center font-semibold text-sm">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Fetching test registry...
            </div>
          ) : filteredMarks.length === 0 ? (
            <div className="py-12 bg-white rounded-xl border border-slate-200 text-center text-slate-455 font-semibold text-sm">
              No test score records matching filter parameters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMarks.map((m) => (
                <Card key={m.id} className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden flex flex-col sm:flex-row items-stretch">
                  {/* Score Highlight Box */}
                  <div className={`sm:w-36 flex flex-col items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-slate-100 ${
                    m.percentage >= 80 ? "bg-emerald-50/50" : m.percentage >= 60 ? "bg-blue-50/30" : "bg-slate-50/50"
                  }`}>
                    <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Score</span>
                    <h2 className="text-2xl font-extrabold text-slate-800">{m.total} <span className="text-xs font-semibold text-slate-400">/ {m.max_marks}</span></h2>
                    <span className={`text-[10px] font-bold mt-1 ${
                      m.percentage >= 80 ? "text-emerald-600" : m.percentage >= 60 ? "text-primary" : "text-slate-550"
                    }`}>
                      {m.percentage}%
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-slate-855 text-sm">{m.students?.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase">
                          <span>{m.students?.batch}</span>
                          <span>•</span>
                          <span className="text-primary">{m.tests?.name}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-450">
                        Date: {m.tests?.date}
                      </span>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-500">
                      <div>
                        <span className="text-slate-400 text-[9px] font-bold block uppercase">Correct</span>
                        <span className="text-slate-700 font-bold">{m.correct_answers}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[9px] font-bold block uppercase">Wrong</span>
                        <span className="text-red-500 font-bold">{m.wrong_answers}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[9px] font-bold block uppercase">Unanswered</span>
                        <span className="text-slate-500 font-bold">{m.unanswered_questions}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportStudent(m.student_id, m.students?.name)}
                        className="h-10 text-[11px] border-slate-200 text-slate-655 font-bold flex items-center gap-1 hover:bg-slate-50 rounded-lg"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-650" />
                        Export Student
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(m)}
                          className="h-10 text-[11px] border-slate-250 text-slate-655 font-bold flex items-center gap-1 rounded-lg"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(m.id, m.students?.name)}
                          className="h-10 text-[11px] border-slate-250 text-red-500 hover:bg-red-50 hover:border-red-200 font-bold flex items-center gap-1 rounded-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Side Panel: Form to Entry */}
        {formOpen && (
          <Card className="border-slate-200 shadow-lg bg-white relative animate-in slide-in-from-right duration-350">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">
                {formMode === "add" ? "Record Test Marks" : "Modify Test Marks"}
              </CardTitle>
              <CardDescription className="text-xs">
                Select test type, picker date, and input answer counts.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveMarks}>
              <CardContent className="space-y-4 pt-4 text-sm">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Select Student</Label>
                  <select
                    value={markForm.studentId}
                    onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
                    required
                    disabled={formMode === "edit"}
                    className="flex h-11 w-full rounded-xl border border-slate-250 bg-white px-3 text-sm text-slate-800 focus:outline-none"
                  >
                    <option value="">-- Choose Active Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.batch})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Test Date</Label>
                  <Input
                    type="date"
                    value={markForm.testDate}
                    onChange={(e) => setMarkForm({ ...markForm, testDate: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-800 h-11 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Test Type Category</Label>
                  <select
                    value={markForm.testType}
                    onChange={(e) => setMarkForm({ ...markForm, testType: e.target.value })}
                    required
                    disabled={formMode === "edit"}
                    className="flex h-11 w-full rounded-xl border border-slate-250 bg-white px-3 text-sm text-slate-800 focus:outline-none"
                  >
                    {testTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Form fields changes depending on Grand or Weekly test */}
                {markForm.testType !== "grand" ? (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Correct Answers</Label>
                      <Input
                        type="number"
                        min="0"
                        max={markForm.testType === "weekly_biology" ? 50 : 45}
                        value={markForm.correctAnswers}
                        onChange={(e) => setMarkForm({ ...markForm, correctAnswers: Number(e.target.value) })}
                        required
                        className="rounded-xl border-slate-250 text-slate-800 h-11 px-4 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Wrong Answers</Label>
                      <Input
                        type="number"
                        min="0"
                        value={markForm.wrongAnswers}
                        onChange={(e) => setMarkForm({ ...markForm, wrongAnswers: Number(e.target.value) })}
                        required
                        className="rounded-xl border-slate-250 text-slate-800 h-11 px-4 text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-[11px]">Bio Correct</Label>
                        <Input
                          type="number"
                          min="0"
                          max="90"
                          value={markForm.biologyCorrect}
                          onChange={(e) => setMarkForm({ ...markForm, biologyCorrect: Number(e.target.value) })}
                          required
                          className="rounded-xl border-slate-250 text-slate-800 h-11 px-2.5 text-xs text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-[11px]">Chem Correct</Label>
                        <Input
                          type="number"
                          min="0"
                          max="45"
                          value={markForm.chemistryCorrect}
                          onChange={(e) => setMarkForm({ ...markForm, chemistryCorrect: Number(e.target.value) })}
                          required
                          className="rounded-xl border-slate-250 text-slate-800 h-11 px-2.5 text-xs text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-[11px]">Phys Correct</Label>
                        <Input
                          type="number"
                          min="0"
                          max="45"
                          value={markForm.physicsCorrect}
                          onChange={(e) => setMarkForm({ ...markForm, physicsCorrect: Number(e.target.value) })}
                          required
                          className="rounded-xl border-slate-250 text-slate-800 h-11 px-2.5 text-xs text-center"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Total Wrong Answers</Label>
                      <Input
                        type="number"
                        min="0"
                        value={markForm.totalWrong}
                        onChange={(e) => setMarkForm({ ...markForm, totalWrong: Number(e.target.value) })}
                        required
                        className="rounded-xl border-slate-250 text-slate-800 h-11 px-4 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Score Calculation preview */}
                <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-2 text-[11px] text-slate-600">
                  <div className="flex justify-between items-center text-slate-500 font-bold border-b border-blue-100/30 pb-1.5 uppercase tracking-wider">
                    <span>Live Computation Preview</span>
                    <Info className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span>Unanswered Questions:</span>
                    <span className="font-bold text-slate-700">{calculatedFields.unanswered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calculated Score:</span>
                    <span className="font-extrabold text-primary text-xs">{calculatedFields.score} / {calculatedFields.maxMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Percentage Rate:</span>
                    <span className="font-bold text-slate-700">{calculatedFields.percentage.toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-100 pt-4 bg-slate-50/50 rounded-b-2xl">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-250 text-slate-655 font-bold rounded-xl h-11 px-4"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold text-sm rounded-xl h-11 px-5"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {formMode === "add" ? "Record Marks" : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
