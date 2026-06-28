"use client"

import Image from "next/image"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Trash2, 
  Edit2, 
  Upload, 
  Loader2, 
  Image as ImageIcon, 
  Check, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  X,
  FileImage
} from "lucide-react"
import { toast } from "@/lib/toast"
import { validateUploadedFile } from "@/lib/utils"
import { logAdminAction } from "@/lib/audit"

// Helper to compress image in browser
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Image compression failed"));
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function GalleryManagementPage() {
  const supabase = useMemo(() => createClient(), [])
  const [gallery, setGallery] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false)

  // Upload states
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState("")

  // Full-size Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })

      if (!error && data) {
        setGallery(data)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-gallery-cms", JSON.stringify(data))
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
    const hasCache = typeof window !== "undefined" && localStorage.getItem("adhitya-neet-gallery-cms")
    fetchGallery(hasCache ? true : false)
  }, [fetchGallery])

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const droppedFile = files[0]
      if (droppedFile.type.startsWith("image/")) {
        setFile(droppedFile)
      } else {
        toast.error("Please drop an image file only.")
      }
    }
  }

  const uploadFile = async (rawFile: File): Promise<string> => {
    // 1. Basic validation
    const validation = validateUploadedFile(rawFile)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // 2. Browser compression
    let uploadBlob: Blob = rawFile
    try {
      uploadBlob = await compressImage(rawFile)
    } catch (compressErr) {
      console.warn("Compression skipped, raw upload: ", compressErr)
    }

    const fileName = `gallery/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`
    
    const { error } = await supabase.storage
      .from("academy")
      .upload(fileName, uploadBlob, {
        cacheControl: "3600",
        contentType: "image/jpeg",
        upsert: true,
      })

    if (error) throw error

    await logAdminAction(supabase, `Uploaded file to gallery: ${rawFile.name}`)

    const { data: urlData } = supabase.storage.from("academy").getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    const toastId = toast.loading("Compressing and uploading image...")

    try {
      const imageUrl = await uploadFile(file)
      const captionText = caption.trim()
      
      // Calculate next sort order
      const maxSort = gallery.reduce((max, item) => (item.sort_order > max ? item.sort_order : max), 0)

      const { data, error } = await supabase.from("gallery").insert({
        image_url: imageUrl,
        caption: captionText || null,
        sort_order: maxSort + 1,
      }).select()

      if (error) throw error

      await logAdminAction(supabase, `Added gallery image: ${captionText || 'No Caption'}`)
      
      setFile(null)
      setCaption("")
      const fileInput = document.getElementById("galleryUpload") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      if (data && data.length > 0) {
        setGallery(prev => {
          const updated = [...prev, data[0]]
          if (typeof window !== "undefined") {
            localStorage.setItem("adhitya-neet-gallery-cms", JSON.stringify(updated))
          }
          return updated
        })
      }
      toast.success("Image uploaded and live successfully!", toastId)
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  // Replace existing image file
  const handleReplaceImage = async (id: string, currentCaption: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const newFile = files[0]
    
    setLoading(true)
    const toastId = toast.loading("Compressing and replacing image...")

    try {
      const newUrl = await uploadFile(newFile)
      const { error } = await supabase
        .from("gallery")
        .update({ image_url: newUrl })
        .eq("id", id)

      if (error) throw error

      await logAdminAction(supabase, `Replaced gallery image for: ${currentCaption || 'No Caption'}`)

      setGallery(prev => {
        const updated = prev.map(item => item.id === id ? { ...item, image_url: newUrl } : item)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-gallery-cms", JSON.stringify(updated))
        }
        return updated
      })

      toast.success("Image replaced successfully!", toastId)
    } catch (err: any) {
      toast.error(`Replacement failed: ${err.message}`, toastId)
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

  // Reordering handler
  const handleReorder = async (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === gallery.length - 1) return

    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    const updated = [...gallery]

    // Swap items
    const temp = updated[idx]
    updated[idx] = updated[targetIdx]
    updated[targetIdx] = temp

    // Reassign sort orders
    const finalUpdated = updated.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }))

    setGallery(finalUpdated)
    if (typeof window !== "undefined") {
      localStorage.setItem("adhitya-neet-gallery-cms", JSON.stringify(finalUpdated))
    }

    try {
      const promises = finalUpdated.map(item => 
        supabase.from("gallery").update({ sort_order: item.sort_order }).eq("id", item.id)
      )
      await Promise.all(promises)
      toast.success("Gallery items reordered successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error("Reordering failed: " + err.message)
    }
  }

  return (
    <div className="space-y-6 text-sm animate-fadeIn">
      {/* Lightbox Preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setPreviewUrl(null)} 
              className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2 bg-white/10 rounded-full backdrop-blur-sm"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
              <Image src={previewUrl} alt="Preview" fill className="object-contain" unoptimized />
            </div>
          </div>
        </div>
      )}

      {/* Header & Upload Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Photo Gallery Assets CMS
              {isSyncing && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Syncing
                </span>
              )}
            </h1>
            <p className="text-slate-550 text-xs mt-1">Manage public landing page campus photographs, classrooms, and event ceremonies.</p>
          </div>
          <div className="flex gap-4 items-center text-xs text-slate-450 mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100 font-semibold">
            <ImageIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Images are auto-compressed in the browser before storage upload to ensure lightning-fast page loading speeds!</span>
          </div>
        </div>

        {/* Drag and Drop Upload Card */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Gallery Photo
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Drag or browse image to publish.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpload}>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  isDragging 
                    ? "border-blue-500 bg-blue-50/40" 
                    : file 
                      ? "border-emerald-300 bg-emerald-50/10" 
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                }`}
                onClick={() => document.getElementById("galleryUpload")?.click()}
              >
                <input
                  id="galleryUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                
                {file ? (
                  <div className="space-y-2">
                    <FileImage className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-bold text-slate-800 text-[10px] truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[9px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB - Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-700">Drag & Drop Image Here</p>
                    <p className="text-[9px] text-slate-400">or click to browse local files</p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-slate-700 font-semibold">Image Caption (Optional)</Label>
                <Input
                  placeholder="e.g. Adhithya NEET classroom panel"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="rounded-xl border-slate-200 h-10 px-3 text-xs focus:border-blue-500"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 pt-3 bg-slate-50/30 justify-end pb-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-bold text-xs rounded-xl h-10 px-5 w-full sm:w-auto justify-center cursor-pointer shadow-sm" disabled={loading || !file}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish Image
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Gallery Grid */}
      <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-800">Media Library ({gallery.length} Images)</CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-0.5">Use order arrows to reorder, replacement button to change image asset, and edit caption.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {fetching ? (
            <div className="py-12 flex items-center justify-center text-slate-400 font-semibold text-xs">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
              Loading gallery media...
            </div>
          ) : gallery.length === 0 ? (
            <div className="py-12 text-center text-slate-450 text-xs font-semibold">No images uploaded in the gallery database yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {gallery.map((item, index) => (
                <div key={item.id} className="group border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between relative">
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                    <Image src={item.image_url} alt={item.caption || "Gallery Asset"} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw" className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    
                    {/* Media Hover Buttons */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setPreviewUrl(item.image_url)}
                        className="w-9 h-9 rounded-full bg-white text-slate-800 hover:bg-blue-600 hover:text-white border-0 shadow-md cursor-pointer"
                        title="View Full Image"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {/* Replace Image Button Trigger */}
                      <label 
                        className="w-9 h-9 rounded-full bg-white text-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
                        title="Replace Image File"
                      >
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleReplaceImage(item.id, item.caption || "", e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Reorder Arrows overlay */}
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
                        disabled={index === gallery.length - 1}
                        className="text-white hover:text-blue-300 disabled:text-white/30 disabled:pointer-events-none p-1 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          className="rounded-lg border-slate-200 h-9 px-3 text-xs"
                          onKeyDown={(e) => { if(e.key === "Enter") handleSaveCaption(item.id); }}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="h-8 text-[10px] rounded-lg px-2 flex-1" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" className="h-8 bg-blue-600 text-white rounded-lg px-2 flex items-center gap-1 text-[10px] flex-1 justify-center cursor-pointer" onClick={() => handleSaveCaption(item.id)}>
                            <Check className="w-3.5 h-3.5" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed line-clamp-2">{item.caption || "No caption provided"}</p>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 block">
                          Uploaded: {new Date(item.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    )}

                    {editingId !== item.id && (
                      <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-auto gap-3">
                        <Button
                          variant="outline"
                          className="h-9 border-slate-200 hover:bg-slate-50 rounded-xl flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600"
                          onClick={() => {
                            setEditingId(item.id)
                            setEditCaption(item.caption || "")
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="h-9 border-slate-200 hover:bg-red-50 hover:border-red-200 group rounded-xl flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-500"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
