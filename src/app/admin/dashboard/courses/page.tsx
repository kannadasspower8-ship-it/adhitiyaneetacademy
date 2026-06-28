"use client"

import Image from "next/image"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Image as ImageIcon, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  ListPlus,
  BookOpen
} from "lucide-react"
import { courses as starterCourses } from "@/data/mockData"
import { toast } from "@/lib/toast"
import { validateUploadedFile } from "@/lib/utils"
import { logAdminAction } from "@/lib/audit"

export default function CoursesManagementPage() {
  const supabase = useMemo(() => createClient(), [])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Form states
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  
  // Highlight feature input state
  const [featureInput, setFeatureInput] = useState("")

  const [courseForm, setCourseForm] = useState({
    id: "",
    title: "",
    description: "",
    duration: "",
    classTiming: "",
    target: "Long Term Program", // Target cohort
    eligibility: "NEET Aspirants",
    highlights: [] as string[],
    imageUrl: "",
    status: "Active",
    file: null as File | null,
  })

  // Load from local storage cache immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("adhitya-neet-courses-cms")
      if (cached) {
        try {
          setCourses(JSON.parse(cached))
          setFetching(false)
        } catch (e) {
          console.error("Error parsing courses cache:", e)
        }
      }
    }
  }, [])

  const fetchCourses = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetching(true)
    else setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })

      if (!error && data) {
        setCourses(data)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-courses-cms", JSON.stringify(data))
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
    const hasCache = typeof window !== "undefined" && localStorage.getItem("adhitya-neet-courses-cms")
    fetchCourses(hasCache ? true : false)
  }, [fetchCourses])

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const validation = validateUploadedFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
    const { error } = await supabase.storage.from("academy").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })
    if (error) throw error

    await logAdminAction(supabase, `Uploaded course file: ${file.name}`)

    const { data: urlData } = supabase.storage.from("academy").getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading(formMode === "add" ? "Publishing new course..." : "Updating course...")

    try {
      let finalImg = courseForm.imageUrl

      if (courseForm.file) {
        finalImg = await uploadFile(courseForm.file, "courses")
      }

      const payload = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        duration: courseForm.duration.trim(),
        class_timing: courseForm.classTiming.trim(),
        target: courseForm.target.trim(),
        eligibility: courseForm.eligibility.trim(),
        highlights: courseForm.highlights,
        image_url: finalImg || null,
        status: courseForm.status,
      }

      if (formMode === "add") {
        // Get next sort order
        const maxSort = courses.reduce((max, c) => (c.sort_order > max ? c.sort_order : max), 0)
        const newPayload = { ...payload, sort_order: maxSort + 1 }

        const { data, error } = await supabase.from("courses").insert(newPayload).select()
        if (error) throw error

        await logAdminAction(supabase, `Created course: ${payload.title}`)
        
        const newCourse = data && data.length > 0 ? data[0] : { id: `course-${Date.now()}`, ...newPayload }
        setCourses(prev => {
          const updated = [...prev, newCourse]
          if (typeof window !== "undefined") {
            localStorage.setItem("adhitya-neet-courses-cms", JSON.stringify(updated))
          }
          return updated
        })
        toast.success("Course created successfully!", toastId)
      } else {
        const { error } = await supabase.from("courses").update(payload).eq("id", courseForm.id)
        if (error) throw error

        await logAdminAction(supabase, `Updated course: ${payload.title}`)
        
        setCourses(prev => {
          const updated = prev.map(c => c.id === courseForm.id ? { ...c, ...payload } : c)
          if (typeof window !== "undefined") {
            localStorage.setItem("adhitya-neet-courses-cms", JSON.stringify(updated))
          }
          return updated
        })
        toast.success("Course updated successfully!", toastId)
      }

      // Reset
      setCourseForm({
        id: "",
        title: "",
        description: "",
        duration: "",
        classTiming: "",
        target: "Long Term Program",
        eligibility: "NEET Aspirants",
        highlights: [],
        imageUrl: "",
        status: "Active",
        file: null,
      })
      setFeatureInput("")
      setFormOpen(false)
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (course: any) => {
    setCourseForm({
      id: course.id,
      title: course.title,
      description: course.description || "",
      duration: course.duration || "",
      classTiming: course.class_timing || "",
      target: course.target || "Long Term Program",
      eligibility: course.eligibility || "NEET Aspirants",
      highlights: course.highlights || [],
      imageUrl: course.image_url || "",
      status: course.status || "Active",
      file: null,
    })
    setFormMode("edit")
    setFormOpen(true)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course "${title}"?`)) return
    setLoading(true)
    const toastId = toast.loading(`Deleting course "${title}"...`)

    const originalCourses = [...courses]
    const updated = courses.filter(c => c.id !== id)
    setCourses(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("adhitya-neet-courses-cms", JSON.stringify(updated))
    }

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id)
      if (error) throw error

      await logAdminAction(supabase, `Deleted course: ${title}`)
      toast.success(`Course "${title}" deleted successfully.`, toastId)
    } catch (err: any) {
      setCourses(originalCourses)
      if (typeof window !== "undefined") {
        localStorage.setItem("adhitya-neet-courses-cms", JSON.stringify(originalCourses))
      }
      toast.error(`Delete failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  // Feature highlight handlers
  const addFeature = () => {
    if (!featureInput.trim()) return
    setCourseForm(prev => ({
      ...prev,
      highlights: [...prev.highlights, featureInput.trim()]
    }))
    setFeatureInput("")
  }

  const removeFeature = (idx: number) => {
    setCourseForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx)
    }))
  }

  // Reordering handler
  const handleReorder = async (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === courses.length - 1) return

    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    const updated = [...courses]
    
    // Swap items
    const temp = updated[idx]
    updated[idx] = updated[targetIdx]
    updated[targetIdx] = temp

    // Re-assign sort_orders
    const finalUpdated = updated.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }))

    setCourses(finalUpdated)
    if (typeof window !== "undefined") {
      localStorage.setItem("adhitya-neet-courses-cms", JSON.stringify(finalUpdated))
    }

    try {
      // Save changes immediately
      const promises = finalUpdated.map(c => 
        supabase.from("courses").update({ sort_order: c.sort_order }).eq("id", c.id)
      )
      await Promise.all(promises)
      toast.success("Courses reordered successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error("Reordering failed: " + err.message)
    }
  }

  return (
    <div className="space-y-6 text-sm animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Academic Courses CMS
            {isSyncing && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing
              </span>
            )}
          </h1>
          <p className="text-slate-550 text-xs">Add, edit, reorder or hide different NEET batches and coaching options.</p>
        </div>
        <Button
          onClick={() => {
            setFormMode("add")
            setCourseForm({
              id: "",
              title: "",
              description: "",
              duration: "",
              classTiming: "",
              target: "Long Term Program",
              eligibility: "NEET Aspirants",
              highlights: [],
              imageUrl: "",
              status: "Active",
              file: null,
            })
            setFeatureInput("")
            setFormOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-bold text-xs rounded-xl px-5 h-11 w-full sm:w-auto shrink-0 justify-center shadow-md shadow-blue-500/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Course Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Course Cards List */}
        <div className={`${formOpen ? "lg:col-span-2" : "lg:col-span-3"} grid grid-cols-1 md:grid-cols-2 gap-6`}>
          {fetching ? (
            <div className="py-12 text-center text-slate-400 col-span-2 flex justify-center items-center font-semibold text-xs">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
              Loading courses list...
            </div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center text-slate-450 col-span-2 font-semibold text-xs">No batches published yet.</div>
          ) : (
            courses.map((c, index) => (
              <Card key={c.id} className="border-slate-200 overflow-hidden flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl relative border-t-4 border-t-blue-600">
                <div>
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                    {c.image_url ? (
                      <Image src={c.image_url} alt={c.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-350 bg-slate-50">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${
                        c.status === "Active"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      {c.status}
                    </span>

                    {/* Order Controls overlay */}
                    <div className="absolute bottom-3 left-3 flex gap-1.5 bg-black/60 p-1 rounded-lg backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => handleReorder(index, "up")}
                        disabled={index === 0}
                        className="text-white hover:text-blue-300 disabled:text-white/30 disabled:pointer-events-none p-1 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(index, "down")}
                        disabled={index === courses.length - 1}
                        className="text-white hover:text-blue-300 disabled:text-white/30 disabled:pointer-events-none p-1 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-800 line-clamp-1">{c.title}</CardTitle>
                    <CardDescription className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {c.duration} | {c.target}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-2.5">
                    <p className="text-xs text-slate-550 leading-relaxed line-clamp-3">{c.description}</p>
                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-500">
                      <div><strong>Timing:</strong> {c.class_timing}</div>
                      <div><strong>Eligibility:</strong> {c.eligibility || "NEET Aspirants"}</div>
                      {c.highlights && c.highlights.length > 0 && (
                        <div className="mt-2">
                          <strong>Features:</strong>
                          <ul className="list-disc pl-3 mt-0.5 space-y-0.5">
                            {c.highlights.slice(0, 2).map((h: string, idx: number) => (
                              <li key={idx} className="line-clamp-1">{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>
                <CardFooter className="justify-end gap-2 border-t border-slate-100 pt-3 bg-slate-50/50">
                  <Button variant="outline" className="border-slate-200 text-slate-600 h-10 px-3 rounded-xl text-xs font-bold" onClick={() => handleEdit(c)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" className="border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 h-10 px-3 rounded-xl text-xs font-bold" onClick={() => handleDelete(c.id, c.title)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Side Editor Panel */}
        {formOpen && (
          <Card className="border-slate-200 shadow-xl bg-white relative animate-in slide-in-from-right duration-350 rounded-2xl overflow-hidden lg:col-span-1">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/40">
              <CardTitle className="text-base font-bold text-slate-800">{formMode === "add" ? "Publish New Course" : "Modify Course Details"}</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">Enter details to show on the public programs brochure.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveCourse}>
              <CardContent className="space-y-4 pt-4 text-xs max-h-[550px] overflow-y-auto">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Course / Batch Name</Label>
                  <Input
                    placeholder="e.g. NEET Repeaters Program"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                    className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Target Cohort</Label>
                  <Input
                    placeholder="e.g. Schooling Students, Long Term"
                    value={courseForm.target}
                    onChange={(e) => setCourseForm({ ...courseForm, target: e.target.value })}
                    required
                    className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-slate-700 font-semibold">Duration</Label>
                    <Input
                      placeholder="e.g. 1 Year, 35 Days"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 text-xs h-11 px-3"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-700 font-semibold">Eligibility</Label>
                    <Input
                      placeholder="e.g. Class 12 Completed"
                      value={courseForm.eligibility}
                      onChange={(e) => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 text-xs h-11 px-3"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Class Timings & Schedule</Label>
                  <Input
                    placeholder="e.g. Monday to Saturday | 9:30 AM - 5:00 PM"
                    value={courseForm.classTiming}
                    onChange={(e) => setCourseForm({ ...courseForm, classTiming: e.target.value })}
                    required
                    className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Course Description</Label>
                  <textarea
                    placeholder="Provide a detailed summary of this batch..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full min-h-[90px] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Highlights List Builder */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <Label className="text-slate-700 font-semibold">Course Features & Highlights</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a highlight feature..."
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      className="rounded-lg border-slate-200 text-xs h-9 px-3 bg-white"
                      onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                    />
                    <Button 
                      type="button"
                      onClick={addFeature}
                      className="h-9 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto mt-2">
                    {courseForm.highlights.map((h, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 p-1.5 bg-white border border-slate-200 rounded-lg text-[10px]">
                        <span className="truncate leading-relaxed flex-grow pr-1">{h}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Course Brochure Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCourseForm({ ...courseForm, file: e.target.files?.[0] || null })}
                    className="rounded-xl border-slate-200 text-slate-800 h-11 flex items-center text-xs"
                  />
                  {courseForm.imageUrl && !courseForm.file && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-8 rounded overflow-hidden border border-slate-200 relative shrink-0">
                        <Image src={courseForm.imageUrl} alt="Preview" fill className="object-cover" />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Brochure image loaded</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Visibility Status</Label>
                  <select
                    value={courseForm.status}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Active">Active (Display on website)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-100 pt-4 bg-slate-50/50 pb-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-500 font-bold text-xs rounded-xl h-11 px-4"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-bold text-xs rounded-xl h-11 px-5 shadow-sm" disabled={loading}>
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {formMode === "add" ? "Publish Batch" : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
