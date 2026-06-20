"use client"

import Image from "next/image"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit2, Trash2, Loader2, Trophy, RefreshCw } from "lucide-react"
import { topRanks } from "@/data/mockData"
import { toast } from "@/lib/toast"

const starterAchievementRows = topRanks.map((achievement, index) => ({
  id: `starter-achievement-${index + 1}`,
  name: achievement.name,
  rank: achievement.rank,
  score: achievement.score,
  year: achievement.year,
  image_url: achievement.image,
}))

export default function AchievementsManagementPage() {
  const supabase = useMemo(() => createClient(), [])
  const [achievements, setAchievements] = useState<any[]>(starterAchievementRows)
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
        .order("created_at", { ascending: false })

      if (!error && data) {
        setAchievements(data)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-achievements-cms", JSON.stringify(data))
        }
      } else if (!error) {
        setAchievements(starterAchievementRows)
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
    const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
    const { error } = await supabase.storage.from("academy").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })
    if (error) throw error
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
        image_url: finalImg || null,
      }

      if (formMode === "add") {
        const { data, error } = await supabase.from("achievements").insert(payload).select()
        if (error) throw error
        
        const newAchievement = data && data.length > 0 ? data[0] : { id: `achievement-${Date.now()}`, ...payload }
        setAchievements(prev => {
          const updated = [newAchievement, ...prev]
          if (typeof window !== "undefined") {
            localStorage.setItem("adhitya-neet-achievements-cms", JSON.stringify(updated))
          }
          return updated
        })
        toast.success("Achievement topper added successfully!", toastId)
      } else {
        const { error } = await supabase.from("achievements").update(payload).eq("id", achievementForm.id)
        if (error) throw error
        
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

  return (
    <div className="space-y-8 text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Achievements Management
            {isSyncing && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm">Add, update, or remove topper records and academic achievements.</p>
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
              imageUrl: "",
              file: null,
            })
            setFormOpen(true)
          }}
          className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold px-5 h-12 rounded-xl text-sm w-full sm:w-auto shrink-0 justify-center"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Topper
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Main List */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {fetching ? (
            <div className="py-12 text-center text-slate-400 col-span-2 flex justify-center items-center font-semibold text-sm">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading achievements...
            </div>
          ) : achievements.length === 0 ? (
            <div className="py-12 text-center text-slate-455 col-span-2 font-semibold text-sm">No toppers or achievements added yet.</div>
          ) : (
            achievements.map((a) => (
              <Card key={a.id} className="border-slate-200 overflow-hidden flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="h-48 w-full bg-slate-100 relative overflow-hidden border-b border-slate-150">
                    {a.image_url ? (
                      <Image src={a.image_url} alt={a.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-355 bg-slate-50">
                        <Trophy className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    <span className="absolute top-4 right-4 text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 border border-amber-200 text-amber-700">
                      {a.year}
                    </span>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-slate-800 line-clamp-1">{a.name}</CardTitle>
                    <CardDescription className="text-[11px] font-bold text-slate-455 uppercase flex gap-2">
                      <span className="text-primary font-extrabold">{a.rank}</span>
                      {a.score && <span>| Score: {a.score}</span>}
                    </CardDescription>
                  </CardHeader>
                </div>
                <CardFooter className="justify-end gap-3 border-t border-slate-100 pt-3.5 bg-slate-50/20">
                  <Button variant="outline" className="border-slate-250 text-slate-600 h-12 px-4 rounded-xl text-sm font-bold flex-1 sm:flex-none justify-center" onClick={() => handleEdit(a)}>
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Edit
                  </Button>
                  <Button variant="outline" className="border-slate-250 text-red-500 hover:bg-red-50 hover:border-red-200 h-12 px-4 rounded-xl text-sm font-bold flex-1 sm:flex-none justify-center" onClick={() => handleDelete(a.id, a.name)}>
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Form Panel */}
        {formOpen && (
          <Card className="border-slate-200 shadow-lg bg-white relative animate-in slide-in-from-right duration-350">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">{formMode === "add" ? "Add Topper Achievement" : "Modify Topper Details"}</CardTitle>
              <CardDescription className="text-xs">Publish topper achievements to show in statistics grids.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveAchievement}>
              <CardContent className="space-y-4 pt-4 text-sm">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Topper Name / Title</Label>
                  <Input
                    placeholder="e.g. Adhithya K."
                    value={achievementForm.name}
                    onChange={(e) => setAchievementForm({ ...achievementForm, name: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-850 h-12 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Rank (Description)</Label>
                  <Input
                    placeholder="e.g. AIR 12, State Rank 1"
                    value={achievementForm.rank}
                    onChange={(e) => setAchievementForm({ ...achievementForm, rank: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-850 h-12 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">NEET Score</Label>
                  <Input
                    placeholder="e.g. 715 / 720"
                    value={achievementForm.score}
                    onChange={(e) => setAchievementForm({ ...achievementForm, score: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-855 h-12 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Academic Year</Label>
                  <Input
                    placeholder="e.g. 2025"
                    value={achievementForm.year}
                    onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })}
                    required
                    className="rounded-xl border-slate-250 text-slate-855 h-12 px-4 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">Topper Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAchievementForm({ ...achievementForm, file: e.target.files?.[0] || null })}
                    className="rounded-xl border-slate-250 text-slate-855 h-12 flex items-center text-sm"
                  />
                  {achievementForm.imageUrl && !achievementForm.file && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                        <Image src={achievementForm.imageUrl} alt="Preview" width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] text-emerald-650 font-bold">✓ Current photo loaded</span>
                    </div>
                  )}
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
