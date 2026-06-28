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
  Trophy, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Sparkles,
  GraduationCap
} from "lucide-react"
import { toast } from "@/lib/toast"
import { validateUploadedFile } from "@/lib/utils"
import { logAdminAction } from "@/lib/audit"

export default function AchievementsManagementPage() {
  const supabase = useMemo(() => createClient(), [])
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Form states
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [achievementForm, setAchievementForm] = useState({
    id: "",
    name: "",
    rank: "",
    score: "",
    year: "",
    description: "",
    medicalCollege: "",
    imageUrl: "",
    file: null as File | null,
  })

  // Load from local storage cache immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("adhitya-neet-achievements-cms")
      if (cached) {
        try {
          setAchievements(JSON.parse(cached))
          setFetching(false)
        } catch (e) {
          console.error("Error parsing achievements cache:", e)
        }
      }
    }
  }, [])

  const fetchAchievements = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetching(true)
    else setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })

      if (!error && data) {
        setAchievements(data)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-achievements-cms", JSON.stringify(data))
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
    const hasCache = typeof window !== "undefined" && localStorage.getItem("adhitya-neet-achievements-cms")
    fetchAchievements(hasCache ? true : false)
  }, [fetchAchievements])

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

    await logAdminAction(supabase, `Uploaded achievements file: ${file.name}`)

    const { data: urlData } = supabase.storage.from("academy").getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading(formMode === "add" ? "Adding topper achievement..." : "Updating topper details...")

    try {
      let finalImg = achievementForm.imageUrl

      if (achievementForm.file) {
        finalImg = await uploadFile(achievementForm.file, "achievements")
      }

      const payload = {
        name: achievementForm.name.trim(),
        rank: achievementForm.rank.trim(),
        score: achievementForm.score.trim(),
        year: achievementForm.year.trim(),
        description: achievementForm.description.trim(),
        medical_college: achievementForm.medicalCollege.trim(),
        image_url: finalImg || null,
      }

      if (formMode === "add") {
        // Calculate next sort order
        const maxSort = achievements.reduce((max, a) => (a.sort_order > max ? a.sort_order : max), 0)
        const newPayload = { ...payload, sort_order: maxSort + 1 }

        const { data, error } = await supabase.from("achievements").insert(newPayload).select()
        if (error) throw error

        await logAdminAction(supabase, `Created achievement topper: ${payload.name} (${payload.rank}, ${payload.year})`)
        
        const newAchievement = data && data.length > 0 ? data[0] : { id: `achievement-${Date.now()}`, ...newPayload }
        setAchievements(prev => {
          const updated = [...prev, newAchievement]
          if (typeof window !== "undefined") {
            localStorage.setItem("adhitya-neet-achievements-cms", JSON.stringify(updated))
          }
          return updated
        })
        toast.success("Achievement topper added successfully!", toastId)
      } else {
        const { error } = await supabase.from("achievements").update(payload).eq("id", achievementForm.id)
        if (error) throw error

        await logAdminAction(supabase, `Updated achievement topper: ${payload.name} (${payload.rank}, ${payload.year})`)
        
        setAchievements(prev => {
          const updated = prev.map(a => a.id === achievementForm.id ? { ...a, ...payload } : a)
          if (typeof window !== "undefined") {
            localStorage.setItem("adhitya-neet-achievements-cms", JSON.stringify(updated))
          }
          return updated
        })
        toast.success("Achievement topper updated successfully!", toastId)
      }

      setAchievementForm({
        id: "",
        name: "",
        rank: "",
        score: "",
        year: "",
        description: "",
        medicalCollege: "",
        imageUrl: "",
        file: null,
      })
      setFormOpen(false)
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (a: any) => {
    setAchievementForm({
      id: a.id,
      name: a.name,
      rank: a.rank || "",
      score: a.score || "",
      year: a.year || "",
      description: a.description || "",
      medicalCollege: a.medical_college || "",
      imageUrl: a.image_url || "",
      file: null,
    })
    setFormMode("edit")
    setFormOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete achievement for "${name}"?`)) return
    setLoading(true)
    const toastId = toast.loading(`Deleting achievement for "${name}"...`)

    const originalAchievements = [...achievements]
    const updated = achievements.filter(a => a.id !== id)
    setAchievements(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("adhitya-neet-achievements-cms", JSON.stringify(updated))
    }

    try {
      const { error } = await supabase.from("achievements").delete().eq("id", id)
      if (error) throw error

      await logAdminAction(supabase, `Deleted achievement topper: ${name}`)
      toast.success(`Achievement record for "${name}" deleted.`, toastId)
    } catch (err: any) {
      setAchievements(originalAchievements)
      if (typeof window !== "undefined") {
        localStorage.setItem("adhitya-neet-achievements-cms", JSON.stringify(originalAchievements))
      }
      toast.error(`Delete failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  // Reordering handler
  const handleReorder = async (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === achievements.length - 1) return

    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    const updated = [...achievements]

    // Swap items
    const temp = updated[idx]
    updated[idx] = updated[targetIdx]
    updated[targetIdx] = temp

    // Reassign sort orders
    const finalUpdated = updated.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }))

    setAchievements(finalUpdated)
    if (typeof window !== "undefined") {
      localStorage.setItem("adhitya-neet-achievements-cms", JSON.stringify(finalUpdated))
    }

    try {
      const promises = finalUpdated.map(item => 
        supabase.from("achievements").update({ sort_order: item.sort_order }).eq("id", item.id)
      )
      await Promise.all(promises)
      toast.success("Achievements reordered successfully!")
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
            Academy Toppers CMS
            {isSyncing && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing
              </span>
            )}
          </h1>
          <p className="text-slate-550 text-xs">Add, edit, reorder, or delete student NEET scores and medical college placements.</p>
        </div>
        <Button
          onClick={() => {
            setFormMode("add")
            setAchievementForm({
              id: "",
              name: "",
              rank: "",
              score: "",
              year: new Date().getFullYear().toString(),
              description: "",
              medicalCollege: "",
              imageUrl: "",
              file: null,
            })
            setFormOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-bold text-xs rounded-xl px-5 h-11 w-full sm:w-auto shrink-0 justify-center shadow-md shadow-blue-500/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Topper Record
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Grid */}
        <div className={`${formOpen ? "lg:col-span-2" : "lg:col-span-3"} grid grid-cols-1 md:grid-cols-2 gap-6`}>
          {fetching ? (
            <div className="py-12 text-center text-slate-400 col-span-2 flex justify-center items-center font-semibold text-xs">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
              Loading achievements data...
            </div>
          ) : achievements.length === 0 ? (
            <div className="py-12 text-center text-slate-450 col-span-2 font-semibold text-xs">No toppers or achievements added yet.</div>
          ) : (
            achievements.map((a, index) => (
              <Card key={a.id} className="border-slate-200 overflow-hidden flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl relative border-t-4 border-t-blue-600">
                <div>
                  <div className="h-52 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                    {a.image_url ? (
                      <Image src={a.image_url} alt={a.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-350 bg-slate-50">
                        <Trophy className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    <span className="absolute top-3 right-3 text-[9px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 border border-amber-200 text-amber-700">
                      NEET {a.year}
                    </span>

                    {/* Order Controls overlay */}
                    <div className="absolute bottom-3 left-3 flex gap-1 bg-black/60 p-1 rounded-lg backdrop-blur-sm z-10">
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
                        disabled={index === achievements.length - 1}
                        className="text-white hover:text-blue-300 disabled:text-white/30 disabled:pointer-events-none p-1 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-800 line-clamp-1">{a.name}</CardTitle>
                    <CardDescription className="text-[10px] font-bold text-slate-500 uppercase flex flex-wrap gap-x-2 gap-y-0.5">
                      <span className="text-blue-600 font-extrabold">{a.rank}</span>
                      {a.score && <span className="text-slate-400">| Score: <strong className="text-slate-700">{a.score}</strong></span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-2 text-[11px] text-slate-500">
                    {a.medical_college && (
                      <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 p-1.5 rounded-lg text-blue-700 font-bold text-[9px] uppercase">
                        <GraduationCap className="w-3.5 h-3.5" /> Admitted: {a.medical_college}
                      </div>
                    )}
                    {a.description && <p className="text-xs text-slate-500 leading-relaxed italic">{a.description}</p>}
                  </CardContent>
                </div>
                <CardFooter className="justify-end gap-2 border-t border-slate-100 pt-3 bg-slate-50/50">
                  <Button variant="outline" className="border-slate-200 text-slate-600 h-10 px-3 rounded-xl text-xs font-bold" onClick={() => handleEdit(a)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" className="border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 h-10 px-3 rounded-xl text-xs font-bold" onClick={() => handleDelete(a.id, a.name)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Form Panel */}
        {formOpen && (
          <Card className="border-slate-200 shadow-xl bg-white relative animate-in slide-in-from-right duration-350 rounded-2xl overflow-hidden lg:col-span-1">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/40">
              <CardTitle className="text-base font-bold text-slate-800">{formMode === "add" ? "Add Topper Achievement" : "Modify Topper Details"}</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">Publish topper statistics and medical college details.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveAchievement}>
              <CardContent className="space-y-4 pt-4 text-xs max-h-[550px] overflow-y-auto">
                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Student Name</Label>
                  <Input
                    placeholder="e.g. Adhithya K."
                    value={achievementForm.name}
                    onChange={(e) => setAchievementForm({ ...achievementForm, name: e.target.value })}
                    required
                    className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-slate-700 font-semibold">Rank Display</Label>
                    <Input
                      placeholder="e.g. AIR 12"
                      value={achievementForm.rank}
                      onChange={(e) => setAchievementForm({ ...achievementForm, rank: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 text-xs h-11 px-3"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-700 font-semibold">NEET Score</Label>
                    <Input
                      placeholder="e.g. 715 / 720"
                      value={achievementForm.score}
                      onChange={(e) => setAchievementForm({ ...achievementForm, score: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 text-xs h-11 px-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-slate-700 font-semibold">NEET Exam Year</Label>
                    <Input
                      placeholder="e.g. 2025"
                      value={achievementForm.year}
                      onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 text-xs h-11 px-3"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-700 font-semibold">Admitted Medical College</Label>
                    <Input
                      placeholder="e.g. Madras Medical College"
                      value={achievementForm.medicalCollege}
                      onChange={(e) => setAchievementForm({ ...achievementForm, medicalCollege: e.target.value })}
                      className="rounded-xl border-slate-200 text-xs h-11 px-3"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Topper Review / Description</Label>
                  <textarea
                    placeholder="Provide comments, feedback or details on student success..."
                    value={achievementForm.description}
                    onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                    className="w-full min-h-[90px] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 font-semibold">Student Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAchievementForm({ ...achievementForm, file: e.target.files?.[0] || null })}
                    className="rounded-xl border-slate-200 text-slate-800 h-11 flex items-center text-xs"
                  />
                  {achievementForm.imageUrl && !achievementForm.file && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-8 rounded overflow-hidden border border-slate-200 relative shrink-0">
                        <Image src={achievementForm.imageUrl} alt="Preview" fill className="object-cover" />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Profile photo loaded</span>
                    </div>
                  )}
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
                  {formMode === "add" ? "Publish Topper" : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
