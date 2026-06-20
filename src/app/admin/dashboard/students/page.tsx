"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
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
  UserPlus, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Eye, 
  Check,
  TrendingUp,
  RefreshCw,
  Lock
} from "lucide-react"
import { toast } from "@/lib/toast"

const batchOptions = [
  "Repeater",
  "Rerepeater",
  "Weekend Batch",
  "Crash Course",
  "Test Batch"
]

export default function StudentManagementPage() {
  const supabase = useMemo(() => createClient(), [])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("All")

  // Form State
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [studentForm, setStudentForm] = useState({
    id: "",
    studentId: "",
    name: "",
    phone: "",
    email: "",
    batch: "Repeater",
    monthOfJoining: "",
    place: "",
    status: "Active"
  })

  // Load from local storage cache immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("adhitya-neet-students-list")
      if (cached) {
        try {
          setStudents(JSON.parse(cached))
          setFetching(false)
        } catch (e) {
          console.error("Error parsing students cache:", e)
        }
      }
    }
  }, [])

  const fetchStudents = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetching(true)
    else setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setStudents(data)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-students-list", JSON.stringify(data))
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
      setIsSyncing(false)
    }
  }, [supabase])

  useEffect(() => {
    const hasCache = typeof window !== "undefined" && localStorage.getItem("adhitya-neet-students-list")
    fetchStudents(hasCache ? true : false)
  }, [fetchStudents])

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading(formMode === "add" ? "Creating student profile..." : "Saving details...")

    try {
      const computedUsername = studentForm.name.trim()
      const computedPassword = studentForm.phone.trim()
      const computedStudentId = studentForm.studentId || `AN-${Date.now().toString().slice(-6)}`

      const payload: any = {
        name: studentForm.name.trim(),
        phone: studentForm.phone.trim(),
        email: studentForm.email.trim(),
        batch: studentForm.batch,
        month_of_joining: studentForm.monthOfJoining.trim(),
        place: studentForm.place.trim(),
        status: studentForm.status,
        username: computedUsername,
        password: computedPassword,
        student_id: computedStudentId
      }

      if (formMode === "add") {
        const { data, error } = await supabase.from("students").insert(payload).select()
        if (error) throw error

        const newStudent = data && data.length > 0 ? data[0] : { id: `temp-${Date.now()}`, ...payload }
        setStudents(prev => {
          const updated = [newStudent, ...prev]
          if (typeof window !== "undefined") {
            localStorage.setItem("adhitya-neet-students-list", JSON.stringify(updated))
          }
          return updated
        })
        toast.success("Student created successfully!", toastId)
      } else {
        const { error } = await supabase.from("students").update(payload).eq("id", studentForm.id)
        if (error) throw error

        setStudents(prev => {
          const updated = prev.map(s => s.id === studentForm.id ? { ...s, ...payload } : s)
          if (typeof window !== "undefined") {
            localStorage.setItem("adhitya-neet-students-list", JSON.stringify(updated))
          }
          return updated
        })
        toast.success("Student details updated successfully!", toastId)
      }

      // Reset form
      setStudentForm({
        id: "",
        studentId: "",
        name: "",
        phone: "",
        email: "",
        batch: "Repeater",
        monthOfJoining: "",
        place: "",
        status: "Active"
      })
      setFormOpen(false)
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (std: any) => {
    setStudentForm({
      id: std.id,
      studentId: std.student_id || "",
      name: std.name || "",
      phone: std.phone || "",
      email: std.email || "",
      batch: std.batch || "Repeater",
      monthOfJoining: std.month_of_joining || "",
      place: std.place || "",
      status: std.status || "Active"
    })
    setFormMode("edit")
    setFormOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove student "${name}"? This will delete all their marks history.`)) return
    setLoading(true)
    const toastId = toast.loading(`Removing student profile...`)

    const backup = [...students]
    const updated = students.filter(s => s.id !== id)
    setStudents(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("adhitya-neet-students-list", JSON.stringify(updated))
    }

    try {
      const { error } = await supabase.from("students").delete().eq("id", id)
      if (error) throw error
      toast.success(`Student profile deleted successfully.`, toastId)
    } catch (err: any) {
      setStudents(backup)
      if (typeof window !== "undefined") {
        localStorage.setItem("adhitya-neet-students-list", JSON.stringify(backup))
      }
      toast.error(`Delete failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter(std => {
      const matchesSearch = 
        std.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        std.phone?.includes(searchTerm) ||
        std.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        std.place?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesBatch = selectedBatch === "All" || std.batch === selectedBatch
      return matchesSearch && matchesBatch
    })
  }, [students, searchTerm, selectedBatch])

  return (
    <div className="space-y-6 text-sm animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Student Profiles Management
            {isSyncing && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm">Create profiles, customize batches, and monitor credentials setup.</p>
        </div>
        <Button
          onClick={() => {
            setFormMode("add")
            setStudentForm({
              id: "",
              studentId: "",
              name: "",
              phone: "",
              email: "",
              batch: "Repeater",
              monthOfJoining: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
              place: "",
              status: "Active"
            })
            setFormOpen(true)
          }}
          className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold text-sm rounded-xl px-5 h-12 w-full sm:w-auto shrink-0 justify-center shadow-md shadow-primary/10"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Add Student
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Registry & Filters Panel */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search name, phone, or town..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 rounded-xl border-slate-250 text-slate-800 text-xs w-full"
              />
            </div>
            
            {/* Batch Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="h-11 rounded-xl border border-slate-250 bg-white px-3 text-xs text-slate-700 font-semibold focus-visible:outline-none"
              >
                <option value="All">All Batches</option>
                {batchOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Display */}
          {fetching ? (
            <div className="py-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 flex justify-center items-center font-semibold text-sm">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Fetching student database...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 bg-white rounded-xl border border-slate-200 text-center text-slate-455 font-semibold text-sm">
              No matching student records found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((std) => (
                <Card key={std.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden flex flex-col justify-between">
                  <CardHeader className="pb-2 bg-slate-50/40 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-300">
                        {std.student_id || "AN-XXXX"}
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      std.status === "Active"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                      {std.status || "Active"}
                    </span>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {std.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm leading-none">{std.name}</h3>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">{std.batch}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 font-semibold border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {std.phone || "No Mobile"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {std.place || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Join: {std.month_of_joining || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {std.email ? std.email.substring(0, 15) + ".." : "No Email"}
                      </div>
                    </div>

                    {/* Credentials block */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <User className="w-3 h-3" /> User:
                        </span>
                        <code className="text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {std.username || std.name}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Pass:
                        </span>
                        <code className="text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {std.password || std.phone}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t border-slate-100 bg-slate-50/20 pt-3 pb-3 justify-end gap-2">
                    <Button 
                      asChild
                      variant="outline" 
                      size="sm" 
                      className="h-10 border-slate-250 text-slate-655 font-bold flex items-center gap-1.5 rounded-lg px-3"
                    >
                      <Link href={`/admin/dashboard/students/analytics?id=${std.id}`}>
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        Analytics
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(std)}
                      className="h-10 border-slate-250 text-slate-655 font-bold flex items-center gap-1.5 rounded-lg px-3"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(std.id, std.name)}
                      className="h-10 border-slate-250 text-red-500 hover:bg-red-50 hover:border-red-200 font-bold flex items-center gap-1.5 rounded-lg px-3"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Side Panel: Form to Add/Edit */}
        {formOpen && (
          <Card className="border-slate-200 shadow-lg bg-white relative animate-in slide-in-from-right duration-350">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">
                {formMode === "add" ? "Create Student Profile" : "Modify Student details"}
              </CardTitle>
              <CardDescription className="text-xs">
                Creates an automatic student login: Name as username, Mobile as password.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveStudent}>
              <CardContent className="space-y-4 pt-4 text-sm">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Student Name (Username)</Label>
                  <Input
                    placeholder="e.g. Rahul Kumar"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-800 h-11 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Mobile Number (Password)</Label>
                  <Input
                    placeholder="e.g. 9600607680"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-800 h-11 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Email ID (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="rahul@email.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="rounded-xl border-slate-250 text-slate-800 h-11 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Place / Town</Label>
                  <Input
                    placeholder="e.g. Erode, Perundurai"
                    value={studentForm.place}
                    onChange={(e) => setStudentForm({ ...studentForm, place: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-800 h-11 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Month of Joining</Label>
                  <Input
                    placeholder="e.g. June 2025"
                    value={studentForm.monthOfJoining}
                    onChange={(e) => setStudentForm({ ...studentForm, monthOfJoining: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-800 h-11 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Batch Course Option</Label>
                  <select
                    value={studentForm.batch}
                    onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-slate-250 bg-white px-3 text-sm text-slate-800 focus:outline-none"
                  >
                    {batchOptions.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Student Visibility Status</Label>
                  <select
                    value={studentForm.status}
                    onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-slate-250 bg-white px-3 text-sm text-slate-800 focus:outline-none"
                  >
                    <option value="Active">Active (Visible)</option>
                    <option value="Inactive">Inactive (Disabled)</option>
                  </select>
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
                  className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold text-sm rounded-xl h-11 px-5 shadow-sm"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {formMode === "add" ? "Create Profile" : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
