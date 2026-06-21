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
import bcrypt from "bcryptjs"
import { logAdminAction } from "@/lib/audit"

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
  const [selectedStatus, setSelectedStatus] = useState("All")

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
    monthOfJoining: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    place: "Erode",
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

      // Encrypt the password (mobile number) using bcrypt
      const salt = bcrypt.genSaltSync(10)
      const password_hash = bcrypt.hashSync(computedPassword, salt)

      const emailValue = studentForm.email.trim()
      const payload: any = {
        name: studentForm.name.trim(),
        phone: studentForm.phone.trim(),
        email: emailValue === "" ? null : emailValue,
        batch: studentForm.batch,
        month_of_joining: studentForm.monthOfJoining.trim() || new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        place: studentForm.place.trim() || "Erode",
        status: studentForm.status || "Active",
        username: computedUsername,
        password_hash: password_hash,
        password: null, // Clear plaintext password
        student_id: computedStudentId
      }

      if (formMode === "add") {
        const { data, error } = await supabase.from("students").insert(payload).select()
        if (error) throw error

        await logAdminAction(supabase, `Created student: ${payload.name} (${payload.batch})`)

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

        await logAdminAction(supabase, `Updated student: ${payload.name} (${payload.batch})`)

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
        monthOfJoining: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        place: "Erode",
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
      await logAdminAction(supabase, `Deleted student: ${name}`)
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
      const matchesStatus = selectedStatus === "All" || (std.status || "Active") === selectedStatus
      return matchesSearch && matchesBatch && matchesStatus
    })
  }, [students, searchTerm, selectedBatch, selectedStatus])

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
          <p className="text-slate-550 text-sm">Create profiles, customize batches, and monitor credentials setup.</p>
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
              place: "Erode",
              status: "Active"
            })
            setFormOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-bold text-sm rounded-xl px-5 h-12 w-full sm:w-auto shrink-0 justify-center shadow-md shadow-blue-500/10 transition-colors"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Add Student
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Registry & Filters Panel */}
        <div className={`${formOpen ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 rounded-xl border-slate-200 focus:border-blue-500 text-slate-800 text-xs w-full transition-colors"
              />
            </div>
            
            {/* Batch & Status Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 font-semibold focus-visible:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="All">All Batches</option>
                  {batchOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 font-semibold focus-visible:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table / Cards Render */}
          {fetching ? (
            <div className="space-y-4">
              {/* Desktop table skeleton */}
              <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Student", "Batch", "Mobile", "Username", "Password", "Status", ""].map((header) => (
                        <th key={header} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {[1, 2, 3, 4].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-28 bg-slate-100 rounded"></div>
                              <div className="h-3 w-16 bg-slate-100 rounded"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-full"></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded"></div></td>
                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-full"></div></td>
                        <td className="px-6 py-4"><div className="h-9 w-32 bg-slate-100 rounded-lg ml-auto"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile card skeleton */}
              <div className="md:hidden grid grid-cols-1 gap-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-slate-200 bg-white rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-28 bg-slate-100 rounded"></div>
                          <div className="h-3 w-16 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="h-20 bg-slate-50 rounded-xl"></div>
                    <div className="h-10 bg-slate-100 rounded-xl"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">No Matching Students</h3>
                <p className="text-slate-550 text-xs max-w-xs">We couldn't find any student records matching your search terms or filter criteria.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedBatch("All")
                  setSelectedStatus("All")
                }}
                className="h-10 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 rounded-xl text-xs px-4"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-550 uppercase tracking-wider">Student</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-550 uppercase tracking-wider">Batch</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-550 uppercase tracking-wider">Mobile</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-550 uppercase tracking-wider">Username</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-550 uppercase tracking-wider">Password</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-550 uppercase tracking-wider">Status</th>
                      <th scope="col" className="relative px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm border border-blue-100 shadow-sm shrink-0">
                              {std.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm leading-snug">{std.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">{std.student_id || "AN-XXXX"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {std.batch}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-slate-600 font-medium text-xs flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {std.phone || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-slate-700 text-xs font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200/60 font-semibold">
                            {std.username || std.name}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-slate-700 text-xs font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200/60 font-semibold">
                            {std.password || std.phone}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            (std.status || "Active") === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (std.status || "Active") === "Active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                            }`}></span>
                            {std.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-9 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-bold flex items-center gap-1.5 rounded-lg px-2.5 transition-all text-xs"
                            >
                              <Link href={`/admin/dashboard/students/analytics?id=${std.id}`}>
                                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                                Analytics
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(std)}
                              className="h-9 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-bold flex items-center gap-1.5 rounded-lg px-2.5 transition-all text-xs"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(std.id, std.name)}
                              className="h-9 border-slate-200 hover:border-red-300 text-red-600 hover:bg-red-50 font-bold flex items-center gap-1.5 rounded-lg px-2.5 transition-all text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {filteredStudents.map((std) => (
                  <Card key={std.id} className="border border-slate-200 shadow-sm hover:shadow-md bg-white rounded-2xl overflow-hidden flex flex-col justify-between p-4 space-y-4">
                    {/* Top Section */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                          {std.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">{std.name}</h3>
                          <span className="text-[10px] text-slate-400 font-medium font-mono block mt-0.5">ID: {std.student_id || "AN-XXXX"}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {std.batch}
                      </span>
                    </div>

                    {/* Middle Section */}
                    <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile:
                        </span>
                        <span className="text-slate-700 font-bold">{std.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" /> Username:
                        </span>
                        <code className="text-slate-700 font-semibold font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {std.username || std.name}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" /> Password:
                        </span>
                        <code className="text-slate-700 font-semibold font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {std.password || std.phone}
                        </code>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-semibold">Status:</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          (std.status || "Active") === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            (std.status || "Active") === "Active" ? "bg-emerald-500" : "bg-red-500"
                          }`}></span>
                          {std.status || "Active"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Section (Action Buttons) */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-10 border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1 rounded-xl text-xs"
                      >
                        <Link href={`/admin/dashboard/students/analytics?id=${std.id}`}>
                          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                          Analytics
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(std)}
                        className="h-10 border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1 rounded-xl text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(std.id, std.name)}
                        className="h-10 border-slate-200 text-red-650 hover:bg-red-50 hover:border-red-200 font-bold flex items-center justify-center gap-1 rounded-xl text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Form to Add/Edit */}
        {formOpen && (
          <Card className="lg:col-span-1 border border-slate-200 shadow-lg bg-white relative animate-in slide-in-from-right duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">
                {formMode === "add" ? "Create Student Profile" : "Modify Student Details"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
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
                    className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Mobile Number (Password)</Label>
                  <Input
                    placeholder="e.g. 9600607680"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    required
                    className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Batch Course Option</Label>
                  <select
                    value={studentForm.batch}
                    onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer font-medium"
                  >
                    {batchOptions.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-100 pt-4 pb-4 bg-slate-50/50">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-600 font-bold rounded-xl h-11 px-4 hover:bg-slate-50 transition-colors"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-bold text-sm rounded-xl h-11 px-5 shadow-sm transition-colors"
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
