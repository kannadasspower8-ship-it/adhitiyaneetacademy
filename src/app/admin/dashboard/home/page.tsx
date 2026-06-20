"use client"

import Image from "next/image"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Eye, Loader2, Plus, Trash2, FileText } from "lucide-react"
import { cmsContent } from "@/data/cmsContent"
import { academyStats, features, topRanks } from "@/data/mockData"

const starterStats = academyStats.map(({ label, value }) => ({ label, value }))
const starterWhyItems = features.map(({ icon, title, description }) => ({ icon, title, description }))
const starterHighlights = topRanks.map(({ name, score, rank, year }) => ({ name, score, rank, year }))

export default function HomepageCMSPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Homepage CMS state
  const [heroTitle, setHeroTitle] = useState(cmsContent.home.hero.titleHighlight)
  const [heroDescription, setHeroDescription] = useState(cmsContent.home.hero.description)
  const [heroImageUrl, setHeroImageUrl] = useState(cmsContent.home.hero.image)
  const [ctaText, setCtaText] = useState("Apply Now")
  const [file, setFile] = useState<File | null>(null)

  // Statistics State (always 4 key stats)
  const [stats, setStats] = useState<any[]>(starterStats)

  // Why Choose Us State
  const [whyTitle, setWhyTitle] = useState(cmsContent.home.whyChooseUs.title)
  const [whyDesc, setWhyDesc] = useState(cmsContent.home.whyChooseUs.description)
  const [whyItems, setWhyItems] = useState<any[]>(starterWhyItems)

  // Success Highlights Topper highlights
  const [highlights, setHighlights] = useState<any[]>(starterHighlights)

  // Preview State modal
  const [previewOpen, setPreviewOpen] = useState(false)

  const fetchHomepageData = useCallback(async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase
        .from("website_home")
        .select("*")
        .eq("id", "main")
        .single()

      if (!error && data) {
        setHeroTitle(data.hero_title || "")
        setHeroDescription(data.hero_description || "")
        setHeroImageUrl(data.hero_image || "")
        setCtaText(data.cta_text || "")
        if (data.stats && Array.isArray(data.stats)) {
          setStats(data.stats)
        }
        setWhyTitle(data.why_choose_us_title || "")
        setWhyDesc(data.why_choose_us_description || "")
        if (data.why_choose_us_items && Array.isArray(data.why_choose_us_items)) {
          setWhyItems(data.why_choose_us_items)
        }
        if (data.success_highlights && Array.isArray(data.success_highlights)) {
          setHighlights(data.success_highlights)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchHomepageData()
  }, [fetchHomepageData])

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `home/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
    const { error } = await supabase.storage.from("academy").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })
    if (error) throw error
    const { data: urlData } = supabase.storage.from("academy").getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalHeroImage = heroImageUrl

      if (file) {
        finalHeroImage = await uploadFile(file)
      }

      const { error } = await supabase
        .from("website_home")
        .upsert({
          id: "main",
          hero_title: heroTitle.trim(),
          hero_description: heroDescription.trim(),
          hero_image: finalHeroImage,
          cta_text: ctaText.trim(),
          stats: stats,
          why_choose_us_title: whyTitle.trim(),
          why_choose_us_description: whyDesc.trim(),
          why_choose_us_items: whyItems,
          success_highlights: highlights,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      setHeroImageUrl(finalHeroImage)
      setFile(null)
      alert("Homepage content saved successfully!")
    } catch (err: any) {
      alert(`Save failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStatChange = (idx: number, field: "label" | "value", val: string) => {
    const updated = [...stats]
    updated[idx][field] = val
    setStats(updated)
  }

  const handleWhyChange = (idx: number, field: "title" | "description" | "icon", val: string) => {
    const updated = [...whyItems]
    updated[idx][field] = val
    setWhyItems(updated)
  }

  const addHighlight = () => {
    setHighlights([...highlights, { score: "", name: "", rank: "", year: "" }])
  }

  const removeHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx))
  }

  const handleHighlightChange = (idx: number, field: string, val: string) => {
    const updated = [...highlights]
    updated[idx][field] = val
    setHighlights(updated)
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-slate-500 font-semibold text-sm">Fetching website parameters...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-sm animate-fadeIn relative">
      {/* 1. PREVIEW MODAL */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                Live Landing Page Hero Preview
              </h3>
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:text-white" onClick={() => setPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
            
            {/* Embedded mockup layout */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-8">
              {/* Mock Hero Area */}
              <div className="bg-primary text-white p-6 md:p-12 rounded-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
                <div className="flex-1 space-y-4">
                  <span className="text-[10px] tracking-widest font-extrabold text-accent uppercase bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
                    Guiding Future Medical Professionals
                  </span>
                  <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Where Future Doctors Begin Their Journey</h1>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-lg">{heroDescription || "Description text goes here"}</p>
                  <Button className="bg-[#0B132B] hover:bg-[#1a2744] text-white font-bold px-6 py-2.5 rounded-xl h-12">
                    Apply for Admission
                  </Button>
                </div>
                <div className="w-full md:w-80 h-52 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0 relative">
                  {file ? (
                    <Image src={URL.createObjectURL(file)} alt="Preview" fill unoptimized className="object-cover" />
                  ) : heroImageUrl ? (
                    <Image src={heroImageUrl} alt="Preview" fill sizes="320px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-550">No Image</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main CMS Card */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Homepage CMS Panel</h1>
            <p className="text-slate-500 text-xs">Modify Hero description, Hero image, and Why Choose Us section text.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="w-full sm:w-auto h-12 border-slate-250 text-slate-655 font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              <Eye className="w-4 h-4" />
              Live Preview
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-12 bg-primary hover:bg-primary/95 text-white font-bold flex items-center justify-center gap-2 rounded-xl px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* 1. Hero Configuration */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Hero Section Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Hero Main Description</Label>
              <textarea
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                required
                className="w-full min-h-[120px] border border-slate-250 rounded-xl p-3 text-slate-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Hero Photograph Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="rounded-xl border-slate-250 text-slate-800 h-12 file:text-xs text-sm"
              />
              {heroImageUrl && !file && (
                <p className="text-[10px] text-emerald-600 font-bold">✓ Active homepage hero photo loaded</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Why Choose Us */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 text-base font-bold">"Why Choose Us" Core Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Section Title Header</Label>
                <Input
                  value={whyTitle}
                  onChange={(e) => setWhyTitle(e.target.value)}
                  required
                  className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 focus-visible:ring-primary text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Section Subtitle/Description</Label>
                <textarea
                  value={whyDesc}
                  onChange={(e) => setWhyDesc(e.target.value)}
                  required
                  className="w-full min-h-[120px] border border-slate-250 rounded-xl p-3 text-slate-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
