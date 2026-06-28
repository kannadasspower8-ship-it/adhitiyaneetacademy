"use client"

import Image from "next/image"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Save, 
  Eye, 
  Loader2, 
  Plus, 
  Trash2, 
  FileText, 
  RefreshCw, 
  Layout, 
  BarChart3, 
  HelpCircle, 
  MessageSquare, 
  Search, 
  Upload,
  Globe
} from "lucide-react"
import { cmsContent } from "@/data/cmsContent"
import { academyStats, features, testimonials as fallbackTestimonials } from "@/data/mockData"
import { toast } from "@/lib/toast"
import { validateUploadedFile } from "@/lib/utils"
import { logAdminAction } from "@/lib/audit"

const defaultStats = [
  { label: "Students Trained", value: "2,500+" },
  { label: "Success Rate", value: "95%" },
  { label: "Years of Experience", value: "15+" },
  { label: "Expert Faculty", value: "35+" }
]

const iconOptions = ["GraduationCap", "BookOpen", "PenTool", "Users"]

export default function HomepageCMSPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // 1. Hero Section State
  const [heroTitle, setHeroTitle] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [heroDescription, setHeroDescription] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [primaryBtnText, setPrimaryBtnText] = useState("")
  const [primaryBtnLink, setPrimaryBtnLink] = useState("")
  const [secondaryBtnText, setSecondaryBtnText] = useState("")
  const [secondaryBtnLink, setSecondaryBtnLink] = useState("")
  const [heroFile, setHeroFile] = useState<File | null>(null)

  // 2. Statistics Section State
  const [stats, setStats] = useState<any[]>(defaultStats)

  // 3. Why Choose Us Section State
  const [whyTitle, setWhyTitle] = useState("")
  const [whyDesc, setWhyDesc] = useState("")
  const [whyItems, setWhyItems] = useState<any[]>([])

  // 4. Testimonials State
  const [testimonials, setTestimonials] = useState<any[]>([])

  // 5. SEO State
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")

  // Live Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false)

  // Load cache on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("adhitya-neet-home-cms")
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          loadStateData(cachedData)
          setFetching(false)
        } catch (e) {
          console.error("Error parsing cache:", e)
        }
      }
    }
  }, [])

  const loadStateData = (data: any) => {
    setHeroTitle(data.hero_title || cmsContent.home.hero.titleHighlight)
    setHeroSubtitle(data.hero_subtitle || cmsContent.home.hero.titlePrefix)
    setHeroDescription(data.hero_description || cmsContent.home.hero.description)
    setHeroImageUrl(data.hero_image || cmsContent.home.hero.image)
    setPrimaryBtnText(data.primary_btn_text || "Apply for Admission")
    setPrimaryBtnLink(data.primary_btn_link || "/contact")
    setSecondaryBtnText(data.secondary_btn_text || "WhatsApp Now")
    setSecondaryBtnLink(data.secondary_btn_link || "")
    setStats(data.stats && data.stats.length > 0 ? data.stats : defaultStats)
    setWhyTitle(data.why_choose_us_title || cmsContent.home.whyChooseUs.title)
    setWhyDesc(data.why_choose_us_description || cmsContent.home.whyChooseUs.description)
    setWhyItems(data.why_choose_us_items && data.why_choose_us_items.length > 0 ? data.why_choose_us_items : features)
    setTestimonials(data.testimonials && data.testimonials.length > 0 ? data.testimonials : fallbackTestimonials)
    setSeoTitle(data.seo_title || "Adhitya NEET Academy | Premium NEET Coaching in Erode")
    setSeoDescription(data.seo_description || "Secure your MBBS seat with Adhitya NEET Academy in Erode.")
    setSeoKeywords(data.seo_keywords || "NEET coaching Erode, NEET repeaters Erode, Adhitya NEET Academy")
  }

  const fetchHomepageData = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetching(true)
    else setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from("website_home")
        .select("*")
        .eq("id", "main")
        .single()

      if (!error && data) {
        loadStateData(data)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-home-cms", JSON.stringify(data))
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
    const hasCache = typeof window !== "undefined" && localStorage.getItem("adhitya-neet-home-cms")
    fetchHomepageData(hasCache ? true : false)
  }, [fetchHomepageData])

  const uploadFile = async (file: File): Promise<string> => {
    const validation = validateUploadedFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }
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
    const toastId = toast.loading("Saving homepage content...")

    try {
      let finalHeroImage = heroImageUrl
      if (heroFile) {
        finalHeroImage = await uploadFile(heroFile)
      }

      const payload = {
        id: "main",
        hero_title: heroTitle.trim(),
        hero_subtitle: heroSubtitle.trim(),
        hero_description: heroDescription.trim(),
        hero_image: finalHeroImage,
        cta_text: primaryBtnText.trim() || "Apply for Admission",
        primary_btn_text: primaryBtnText.trim(),
        primary_btn_link: primaryBtnLink.trim(),
        secondary_btn_text: secondaryBtnText.trim(),
        secondary_btn_link: secondaryBtnLink.trim(),
        stats: stats,
        why_choose_us_title: whyTitle.trim(),
        why_choose_us_description: whyDesc.trim(),
        why_choose_us_items: whyItems,
        testimonials: testimonials,
        seo_title: seoTitle.trim(),
        seo_description: seoDescription.trim(),
        seo_keywords: seoKeywords.trim(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("website_home")
        .upsert(payload)

      if (error) throw error

      await logAdminAction(supabase, "Updated Homepage CMS details")

      setHeroImageUrl(finalHeroImage)
      setHeroFile(null)

      if (typeof window !== "undefined") {
        localStorage.setItem("adhitya-neet-home-cms", JSON.stringify(payload))
      }

      toast.success("Homepage content saved and live successfully!", toastId)
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  // Stat handlers
  const handleStatChange = (idx: number, field: "label" | "value", val: string) => {
    const updated = [...stats]
    updated[idx][field] = val
    setStats(updated)
  }

  // Why Choose Us handlers
  const handleWhyChange = (idx: number, field: "title" | "description" | "icon", val: string) => {
    const updated = [...whyItems]
    updated[idx][field] = val
    setWhyItems(updated)
  }

  // Testimonial handlers
  const addTestimonial = () => {
    setTestimonials([{ name: "", role: "Student", content: "", rating: 5 }, ...testimonials])
  }

  const removeTestimonial = (idx: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== idx))
  }

  const handleTestimonialChange = (idx: number, field: string, val: any) => {
    const updated = [...testimonials]
    updated[idx][field] = val
    setTestimonials(updated)
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-slate-500 font-semibold text-xs">Fetching homepage parameters...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-sm animate-fadeIn relative">
      {/* 1. LIVE PREVIEW MODAL */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                Live Website Hero Preview
              </h3>
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:text-white" onClick={() => setPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
            
            <div className="flex-grow overflow-y-auto bg-slate-50 p-6 space-y-8">
              {/* Mock Hero Area */}
              <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/30 p-8 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 space-y-4 text-left">
                  <span className="text-[9px] tracking-widest font-extrabold text-blue-600 uppercase bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                    {heroSubtitle || "Guiding Future Medical Professionals"}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                    {heroTitle ? heroTitle.replace(/\*/g, '') : "Where Future Doctors Begin Their Journey"}
                  </h1>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-lg">{heroDescription}</p>
                  <div className="flex gap-2">
                    <Button className="bg-[#0B132B] hover:bg-[#1a2744] text-white font-bold px-4 py-2 text-xs rounded-lg">
                      {primaryBtnText}
                    </Button>
                    <Button variant="outline" className="border-slate-200 text-slate-700 font-bold px-4 py-2 text-xs rounded-lg bg-white">
                      {secondaryBtnText}
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-80 h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                  {heroFile ? (
                    <Image src={URL.createObjectURL(heroFile)} alt="Preview" fill unoptimized className="object-cover" />
                  ) : heroImageUrl ? (
                    <Image src={heroImageUrl} alt="Preview" fill sizes="320px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main CMS Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Website Homepage CMS
              {isSyncing && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Syncing
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-xs mt-1">Configure landing hero blocks, statistics counters, testimonials, and SEO tags.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="h-11 border-slate-200 text-slate-600 font-bold flex items-center gap-2 rounded-xl text-xs px-4 bg-white hover:bg-slate-50"
            >
              <Eye className="w-4 h-4" />
              Live Preview
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 rounded-xl px-5 text-xs shadow-md shadow-blue-500/10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* 1. HERO SECTION CONFIGURATION */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Hero Section Content</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">Edit main title, description, buttons and cover photograph.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-xs">Hero Badge Subtitle</Label>
                <Input
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="e.g. Guiding Future Medical Professionals"
                  required
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-xs">Hero Main Title (wrap *highlighted text* in asterisks)</Label>
                <Input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="e.g. Where Future *Doctors* Begin Their Journey"
                  required
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-xs">Hero Description Paragraph</Label>
              <textarea
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                required
                rows={3}
                placeholder="Briefly explain the academy's edge..."
                className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            {/* Buttons Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700">Primary Button Setup</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 font-semibold">Button Label</Label>
                    <Input
                      value={primaryBtnText}
                      onChange={(e) => setPrimaryBtnText(e.target.value)}
                      placeholder="Apply Now"
                      className="rounded-xl border-slate-200 text-xs h-10 px-3"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 font-semibold">Destination Link</Label>
                    <Input
                      value={primaryBtnLink}
                      onChange={(e) => setPrimaryBtnLink(e.target.value)}
                      placeholder="/contact"
                      className="rounded-xl border-slate-200 text-xs h-10 px-3"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700">Secondary Button Setup</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 font-semibold">Button Label</Label>
                    <Input
                      value={secondaryBtnText}
                      onChange={(e) => setSecondaryBtnText(e.target.value)}
                      placeholder="WhatsApp Now"
                      className="rounded-xl border-slate-200 text-xs h-10 px-3"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 font-semibold">Destination Link</Label>
                    <Input
                      value={secondaryBtnLink}
                      onChange={(e) => setSecondaryBtnLink(e.target.value)}
                      placeholder="e.g. https://wa.me/..."
                      className="rounded-xl border-slate-200 text-xs h-10 px-3"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="text-slate-700 font-semibold text-xs">Hero Cover Photograph</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-20 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                  {heroFile ? (
                    <Image src={URL.createObjectURL(heroFile)} alt="Pending Upload" fill unoptimized className="object-cover" />
                  ) : heroImageUrl ? (
                    <Image src={heroImageUrl} alt="Current Cover" fill sizes="120px" className="object-cover" />
                  ) : (
                    <Upload className="w-5 h-5 text-slate-350" />
                  )}
                </div>
                <div className="space-y-1 flex-grow">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                    className="rounded-xl border-slate-200 text-slate-750 text-xs h-10 px-3 file:text-xs"
                  />
                  <p className="text-[10px] text-slate-400">Suggest size: 1920x1080 (horizontal). Recommended format: JPEG or WEBP.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. STATISTICS COUNTERS */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Statistics Counters</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">Customize the 4 key stat boxes displayed in the homepage banner.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <div className="font-bold text-xs text-slate-500">Stat Box #{i + 1}</div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Number / Value</Label>
                      <Input
                        value={stat.value}
                        onChange={(e) => handleStatChange(i, "value", e.target.value)}
                        placeholder="e.g. 2,500+"
                        className="rounded-lg border-slate-200 text-xs h-9 px-3 mt-0.5 bg-white font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Label Text</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => handleStatChange(i, "label", e.target.value)}
                        placeholder="e.g. Students Trained"
                        className="rounded-lg border-slate-200 text-xs h-9 px-3 mt-0.5 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. WHY CHOOSE US */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-800">"Why Choose Us" Value Cards</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">Edit main section headers and individual value cards (maximum 4 cards).</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-xs">Section Main Header</Label>
                <Input
                  value={whyTitle}
                  onChange={(e) => setWhyTitle(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-xs">Section Description Summary</Label>
                <textarea
                  value={whyDesc}
                  onChange={(e) => setWhyDesc(e.target.value)}
                  required
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Why choose us cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {whyItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-600">Card Item #{idx + 1}</span>
                    <select
                      value={item.icon || "Users"}
                      onChange={(e) => handleWhyChange(idx, "icon", e.target.value)}
                      className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 font-bold text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {iconOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Label className="text-[10px] text-slate-400">Card Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleWhyChange(idx, "title", e.target.value)}
                        placeholder="Expert Mentorship"
                        className="rounded-lg border-slate-200 text-xs h-9 px-3 bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-400">Card Description</Label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleWhyChange(idx, "description", e.target.value)}
                        placeholder="Brief point summary..."
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 text-xs mt-0.5 bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. TESTIMONIALS MANAGER */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Student Reviews & Testimonials</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">Manage student reviews displayed on the website carousel.</CardDescription>
              </div>
            </div>
            <Button
              type="button"
              onClick={addTestimonial}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-3 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Review
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 max-h-[500px] overflow-y-auto">
            {testimonials.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                No custom testimonials added. Add one to override templates!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removeTestimonial(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1.5 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors"
                      title="Delete Testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-slate-400">Student Name</Label>
                          <Input
                            value={t.name}
                            onChange={(e) => handleTestimonialChange(idx, "name", e.target.value)}
                            required
                            placeholder="e.g. Ravi Kumar"
                            className="rounded-lg border-slate-200 text-xs h-9 px-3 bg-white font-semibold mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-slate-400">Role / Subtitle</Label>
                          <Input
                            value={t.role}
                            onChange={(e) => handleTestimonialChange(idx, "role", e.target.value)}
                            required
                            placeholder="e.g. NEET Aspirant"
                            className="rounded-lg border-slate-200 text-xs h-9 px-3 bg-white mt-0.5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-slate-400">Rating (1 to 5 Stars)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={t.rating || 5}
                            onChange={(e) => handleTestimonialChange(idx, "rating", parseInt(e.target.value))}
                            required
                            className="rounded-lg border-slate-200 text-xs h-9 px-3 bg-white mt-0.5"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-[10px] text-slate-400">Feedback Content</Label>
                        <textarea
                          value={t.content}
                          onChange={(e) => handleTestimonialChange(idx, "content", e.target.value)}
                          required
                          rows={3}
                          placeholder="Type review text..."
                          className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 text-xs mt-0.5 bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. HOMEPAGE SEO */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Homepage Search Optimization (SEO)</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">Control how Google searches display your home page title and description tags.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-xs">SEO Browser Title</Label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                required
                placeholder="e.g. Adhitya NEET Academy | Erode's Premier Coaching"
                className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-xs">SEO Page Meta Description</Label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                required
                rows={3}
                placeholder="Summary displayed under Google search links..."
                className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-xs">SEO Search Keywords (comma-separated)</Label>
              <Input
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                required
                placeholder="NEET coaching Erode, NEET repeaters, medical coaching"
                className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
