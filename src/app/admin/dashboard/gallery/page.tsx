"use client"

import Image from "next/image"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit2, Upload, Loader2, Image as ImageIcon, Check, RefreshCw } from "lucide-react"
import { toast } from "@/lib/toast"
import { validateUploadedFile } from "@/lib/utils"
import { logAdminAction } from "@/lib/audit"

const starterGalleryRows = [
  {
    id: "starter-gallery-1",
    image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000",
    caption: "Adhithya NEET Academy Erode Campus",
    created_at: new Date().toISOString(),
  },
  {
    id: "starter-gallery-2",
    image_url: "https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=1000",
    caption: "Advanced Biology and Chemistry Lecture Hall",
    created_at: new Date().toISOString(),
  },
  {
    id: "starter-gallery-3",
    image_url: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=1000",
    caption: "Annual Academic Merit Felicitation Ceremony",
    created_at: new Date().toISOString(),
  },
]

export default function GalleryManagementPage() {
  const supabase = useMemo(() => createClient(), [])
  const [gallery, setGallery] = useState<any[]>(starterGalleryRows)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Upload states
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState("")

  // Load from cache immediately on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("adhitya-neet-gallery-cms")
      if (cached) {
        try {
          setGallery(JSON.parse(cached))
          setFetching(false)
        } catch (e) {
          console.error("Error parsing gallery cache:", e)
        }
      }
    }
  }, [])

  const fetchGallery = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetching(true)
    else setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setGallery(data)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-gallery-cms", JSON.stringify(data))
        }
      } else if (!error) {
        setGallery(starterGalleryRows)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
      setIsSyncing(false)
    }
  }, [supabase])

  useEffect(() => {
    const hasCache = typeof window !== "undefined" && localStorage.getItem("adhitya-neet-gallery-cms")
    fetchGallery(hasCache ? true : false)
  }, [fetchGallery])

  const uploadFile = async (file: File): Promise<string> => {
    const validation = validateUploadedFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `gallery/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    
    const { error } = await supabase.storage
      .from("academy")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (error) throw error

    await logAdminAction(supabase, `Uploaded file to gallery: ${file.name}`)

    const { data: urlData } = supabase.storage.from("academy").getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    const toastId = toast.loading("Uploading image to gallery...")

    try {
      const imageUrl = await uploadFile(file)
      const captionText = caption.trim()
      const { data, error } = await supabase.from("gallery").insert({
        image_url: imageUrl,
        caption: captionText || null,
      }).select()

      if (error) throw error

      await logAdminAction(supabase, `Added gallery image: ${captionText || 'No Caption'}`)
      
      setFile(null)
      setCaption("")
      const fileInput = document.getElementById("galleryUpload") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      if (data && data.length > 0) {
        setGallery(prev => {
          const updated = [data[0], ...prev]
          if (typeof window !== "undefined") {
            localStorage.setItem("adhitya-neet-gallery-cms", JSON.stringify(updated))
          }
          return updated
        })
      }
      toast.success("Image uploaded successfully!", toastId)
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCaption = async (id: string) => {
    setLoading(true)
    const toastId = toast.loading("Saving caption changes...")
    const captionText = editCaption.trim()
    try {
      const { error } = await supabase
        .from("gallery")
        .update({ caption: captionText || null })
        .eq("id", id)

      if (error) throw error

      await logAdminAction(supabase, `Updated gallery image caption: ${captionText || 'No Caption'}`)
      
      setEditingId(null)
      setGallery(prev => {
        const updated = prev.map(g => g.id === id ? { ...g, caption: captionText || null } : g)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-gallery-cms", JSON.stringify(updated))
        }
        return updated
      })
      toast.success("Caption saved successfully!", toastId)
    } catch (err: any) {
      toast.error(`Failed to save caption: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return
    setLoading(true)
    const toastId = toast.loading("Deleting gallery image...")

    const originalGallery = [...gallery]
    const itemToDelete = gallery.find(g => g.id === id)
    const updated = gallery.filter(g => g.id !== id)
    setGallery(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("adhitya-neet-gallery-cms", JSON.stringify(updated))
    }

    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id)
      if (error) throw error

      await logAdminAction(supabase, `Deleted gallery image: ${itemToDelete?.caption || 'No Caption'}`)

      toast.success("Gallery image deleted successfully.", toastId)
    } catch (err: any) {
      setGallery(originalGallery)
      if (typeof window !== "undefined") {
        localStorage.setItem("adhitya-neet-gallery-cms", JSON.stringify(originalGallery))
      }
      toast.error(`Delete failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 text-sm animate-fadeIn">
      {/* Header & Upload Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Gallery Assets
              {isSyncing && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Syncing
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Upload and manage campus photographs, events, and classroom layouts shown on the landing page.</p>
          </div>
          <div className="flex gap-4 items-center text-xs text-slate-450 mt-6 bg-slate-50 p-4 rounded-xl border border-slate-150 font-semibold">
            <ImageIcon className="w-5 h-5 text-primary shrink-0" />
            <span>Images uploaded here are stored in Supabase Storage and synced instantly with the public homepage gallery grid.</span>
          </div>
        </div>

        {/* Upload Form Card */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload New Photo
            </CardTitle>
            <CardDescription className="text-xs">Add a new image asset to the gallery ledger.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpload}>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-sm">Choose Image File</Label>
                <Input
                  id="galleryUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="rounded-xl border-slate-250 text-slate-800 file:text-xs h-12 flex items-center text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-sm">Image Caption (Optional)</Label>
                <Input
                  placeholder="e.g. Erode Campus Building, biology session"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 pt-3.5 bg-slate-50/50 justify-end rounded-b-xl">
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 font-bold text-sm rounded-xl h-12 px-5 w-full sm:w-auto justify-center" disabled={loading || !file}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Image
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Gallery Grid */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold">Gallery Asset Grid</CardTitle>
          <CardDescription className="text-xs">Dynamic display list of all uploaded media assets.</CardDescription>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="py-12 flex items-center justify-center text-slate-400 font-semibold text-sm">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading media files...
            </div>
          ) : gallery.length === 0 ? (
            <div className="py-12 text-center text-slate-450 text-sm">No images uploaded in the gallery database yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {gallery.map((item) => (
                <div key={item.id} className="group border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden border-b border-slate-150">
                    <Image src={item.image_url} alt={item.caption || "Gallery Asset"} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" className="h-12 text-sm rounded-xl px-4 font-bold flex-1" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                          <Button className="h-12 bg-primary text-white rounded-xl px-4 flex items-center gap-1 font-bold flex-1 justify-center" onClick={() => handleSaveCaption(item.id)}>
                            <Check className="w-4 h-4" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-slate-700 font-medium leading-relaxed italic">{item.caption || "No caption provided"}</p>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase mt-2 block">
                          Uploaded: {new Date(item.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    )}

                    {editingId !== item.id && (
                      <div className="flex justify-between items-center border-t border-slate-100 pt-3.5 mt-auto gap-4">
                        <Button
                          variant="outline"
                          className="h-12 border-slate-250 hover:bg-slate-50 rounded-xl flex-1 flex items-center justify-center gap-2 text-sm font-bold text-slate-600"
                          onClick={() => {
                            setEditingId(item.id)
                            setEditCaption(item.caption || "")
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-slate-655" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="h-12 border-slate-250 hover:bg-red-50 hover:border-red-200 group rounded-xl flex-1 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-red-500"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-500" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
