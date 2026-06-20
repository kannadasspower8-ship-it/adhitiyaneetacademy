"use client"

import Image from "next/image"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from "lucide-react"
import { courses as starterCourses } from "@/data/mockData"

const starterCourseRows = starterCourses.map((course) => ({
  id: course.id,
  title: course.title,
  description: course.description,
  duration: course.duration,
  class_timing: course.classTiming,
  image_url: null,
  status: "Active",
}))

export default function CoursesManagementPage() {
  const supabase = useMemo(() => createClient(), [])
  const [courses, setCourses] = useState<any[]>(starterCourseRows)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Form states
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [courseForm, setCourseForm] = useState({
    id: "",
    title: "",
    description: "",
    duration: "",
    classTiming: "",
    imageUrl: "",
    status: "Active",
    file: null as File | null,
  })

  const fetchCourses = useCallback(async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true })

      if (!error && data && data.length > 0) {
        setCourses(data)
      } else {
        setCourses(starterCourseRows)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
    const { error } = await supabase.storage.from("academy").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })
    if (error) throw error
    const { data: urlData } = supabase.storage.from("academy").getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
        image_url: finalImg || null,
        status: courseForm.status,
      }

      if (formMode === "add") {
        const { data, error } = await supabase.from("courses").insert(payload).select()
        if (error) throw error
        alert("Course created successfully!")
        if (data && data.length > 0) {
          setCourses(prev => [...prev, data[0]])
        } else {
          fetchCourses()
        }
      } else {
        const { error } = await supabase.from("courses").update(payload).eq("id", courseForm.id)
        if (error) throw error
        alert("Course updated successfully!")
        setCourses(prev => prev.map(c => c.id === courseForm.id ? { ...c, ...payload } : c))
      }

      setCourseForm({
        id: "",
        title: "",
        description: "",
        duration: "",
        classTiming: "",
        imageUrl: "",
        status: "Active",
        file: null,
      })
      setFormOpen(false)
    } catch (err: any) {
      alert(`Save failed: ${err.message}`)
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
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id)
      if (error) throw error
      alert(`Course "${title}" deleted successfully.`)
      setCourses(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Courses Management</h1>
          <p className="text-slate-500 text-sm">Add, update, or remove coaching batches and programs.</p>
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
              imageUrl: "",
              status: "Active",
              file: null,
            })
            setFormOpen(true)
          }}
          className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold text-sm rounded-xl px-5 h-12 w-full sm:w-auto shrink-0 justify-center"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Course
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Course Cards Registry */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {fetching ? (
            <div className="py-12 text-center text-slate-400 col-span-2 flex justify-center items-center font-semibold text-sm">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading batches...
            </div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center text-slate-450 col-span-2 font-semibold text-sm">No batches published yet.</div>
          ) : (
            courses.map((c) => (
              <Card key={c.id} className="border-slate-200 overflow-hidden flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden border-b border-slate-150">
                    {c.image_url ? (
                      <Image src={c.image_url} alt={c.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-350 bg-slate-50">
                        <ImageIcon className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    <span
                      className={`absolute top-4 right-4 text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        c.status === "Active"
                          ? "bg-emerald-50 border-emerald-250 text-emerald-700"
                          : "bg-slate-50 border-slate-250 text-slate-455"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-slate-800 line-clamp-1">{c.title}</CardTitle>
                    <CardDescription className="text-[11px] font-bold text-slate-455 uppercase">{c.duration}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-2.5">
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{c.description}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Class Timings: <span className="text-slate-600 lowercase font-semibold">{c.class_timing}</span></p>
                  </CardContent>
                </div>
                <CardFooter className="justify-end gap-3 border-t border-slate-100 pt-3.5 bg-slate-50/20">
                  <Button variant="outline" className="border-slate-250 text-slate-600 h-12 px-4 rounded-xl text-sm font-bold flex-1 sm:flex-none justify-center" onClick={() => handleEdit(c)}>
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Edit
                  </Button>
                  <Button variant="outline" className="border-slate-250 text-red-500 hover:bg-red-50 hover:border-red-200 h-12 px-4 rounded-xl text-sm font-bold flex-1 sm:flex-none justify-center" onClick={() => handleDelete(c.id, c.title)}>
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Side Editor Panel */}
        {formOpen && (
          <Card className="border-slate-200 shadow-lg bg-white relative animate-in slide-in-from-right duration-350">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">{formMode === "add" ? "Publish Batch" : "Modify Batch Details"}</CardTitle>
              <CardDescription className="text-xs">Enter course details for landing page brochures.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveCourse}>
              <CardContent className="space-y-4 pt-4 text-sm">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Course Name</Label>
                  <Input
                    placeholder="e.g. NEET Repeaters, Crash Course"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Batch Duration</Label>
                  <Input
                    placeholder="e.g. 1 Year, 3 Months"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Class Timings</Label>
                  <Input
                    placeholder="e.g. 9:30 AM - 5:00 PM, 6:30 PM - 8:30 PM"
                    value={courseForm.classTiming}
                    onChange={(e) => setCourseForm({ ...courseForm, classTiming: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Course Description</Label>
                  <textarea
                    placeholder="Enter course revision modules..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full min-h-[120px] border border-slate-250 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Course Brochure Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCourseForm({ ...courseForm, file: e.target.files?.[0] || null })}
                    className="rounded-xl border-slate-250 text-slate-800 h-12 flex items-center text-sm"
                  />
                  {courseForm.imageUrl && !courseForm.file && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                        <Image src={courseForm.imageUrl} alt="Course Preview" width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] text-emerald-600 font-bold">✓ Course image loaded</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Brochure Visibility Status</Label>
                  <select
                    value={courseForm.status}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                    className="flex h-12 w-full rounded-xl border border-slate-250 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="Active">Active (Visible)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-100 pt-4 bg-slate-50/50">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-250 text-slate-655 font-bold text-sm rounded-xl h-12 px-5"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold text-sm rounded-xl h-12 px-5" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {formMode === "add" ? "Publish Course" : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
