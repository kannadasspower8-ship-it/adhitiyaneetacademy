"use client"

import Image from "next/image"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2, Landmark } from "lucide-react"
import { cmsContent } from "@/data/cmsContent"
import { validateUploadedFile } from "@/lib/utils"
import { logAdminAction } from "@/lib/audit"

export default function AboutPageCMSPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // About CMS state
  const [aboutContent, setAboutContent] = useState(cmsContent.about.story.content1)
  const [mission, setMission] = useState(cmsContent.about.mission.content)
  const [vision, setVision] = useState(cmsContent.about.vision.content)
  const [overview, setOverview] = useState(cmsContent.about.story.content2)
  const [images, setImages] = useState<string[]>([cmsContent.about.story.image])
  const [file, setFile] = useState<File | null>(null)

  const fetchAboutData = useCallback(async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase
        .from("website_about")
        .select("*")
        .eq("id", "main")
        .single()

      if (!error && data) {
        setAboutContent(data.about_content || "")
        setMission(data.mission || "")
        setVision(data.vision || "")
        setOverview(data.overview || "")
        if (data.images && Array.isArray(data.images)) {
          setImages(data.images)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAboutData()
  }, [fetchAboutData])

  const uploadFile = async (file: File): Promise<string> => {
    const validation = validateUploadedFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    const fileName = `about/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
    const { error } = await supabase.storage.from("academy").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })
    if (error) throw error

    await logAdminAction(supabase, `Uploaded file to about section: ${file.name}`)

    const { data: urlData } = supabase.storage.from("academy").getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let updatedImages = [...images]

      if (file) {
        const uploadedUrl = await uploadFile(file)
        updatedImages = [uploadedUrl]
      }

      const { error } = await supabase
        .from("website_about")
        .upsert({
          id: "main",
          about_content: aboutContent.trim(),
          mission: mission.trim(),
          vision: vision.trim(),
          overview: overview.trim(),
          images: updatedImages,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      await logAdminAction(supabase, "Updated About Page CMS contents")

      alert("About page content saved successfully!")
      setFile(null)
      fetchAboutData()
    } catch (err: any) {
      alert(`Save failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-slate-500 font-semibold">Fetching about details...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-sm animate-fadeIn max-w-3xl">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">About Page CMS</h1>
            <p className="text-slate-500 text-sm">Edit academy history, structural mission guidelines, and vision goals.</p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-12 bg-primary hover:bg-primary/95 text-white font-bold flex items-center justify-center gap-2 rounded-xl px-5 shrink-0 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save About Details
          </Button>
        </div>

        {/* Content Configuration */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
              <Landmark className="w-4.5 h-4.5 text-primary" />
              Academy Story & Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">About Academy Content (Main Story)</Label>
              <textarea
                value={aboutContent}
                onChange={(e) => setAboutContent(e.target.value)}
                required
                className="w-full min-h-[150px] border border-slate-250 rounded-xl p-3 text-sm text-slate-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">Academy Overview (Secondary Content)</Label>
              <textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                required
                className="w-full min-h-[120px] border border-slate-250 rounded-xl p-3 text-sm text-slate-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">Representative Campus Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="rounded-xl border-slate-250 text-slate-850 file:text-xs h-12 flex items-center text-sm"
              />
              {images.length > 0 && !file && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                    <Image src={images[0]} alt="Campus" width={48} height={48} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">✓ Active about brochure photo loaded</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 text-base font-bold">Academic Mission & Vision Statements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">Mission Statement</Label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                required
                className="w-full min-h-[120px] border border-slate-250 rounded-xl p-3 text-sm text-slate-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">Vision Statement</Label>
              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                required
                className="w-full min-h-[120px] border border-slate-250 rounded-xl p-3 text-sm text-slate-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
