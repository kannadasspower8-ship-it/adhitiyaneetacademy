"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  PhoneCall, 
  Save, 
  Loader2, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Globe, 
  RefreshCw, 
  Clock, 
  Building
} from "lucide-react"
import { cmsContent } from "@/data/cmsContent"
import { toast } from "@/lib/toast"
import { logAdminAction } from "@/lib/audit"

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

export default function ContactInformationCMSPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Form States
  const [academyName, setAcademyName] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneSecondary, setPhoneSecondary] = useState("")
  const [email, setEmail] = useState("")
  const [emailSecondary, setEmailSecondary] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [workingHours, setWorkingHours] = useState("")
  const [address, setAddress] = useState("")
  const [mapEmbed, setMapEmbed] = useState("")
  
  // Social Links States
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [youtube, setYoutube] = useState("")
  const [twitter, setTwitter] = useState("")

  // Load from local storage cache immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("adhitya-neet-contact-cms")
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          loadStateData(cachedData)
          setFetching(false)
        } catch (e) {
          console.error("Error parsing contact cache:", e)
        }
      }
    }
  }, [])

  const loadStateData = (data: any) => {
    setAcademyName(data.academy_name || "ADHITYA NEET ACADEMY")
    setPhone(data.phone || cmsContent.global.phonePrimary)
    setPhoneSecondary(data.phone_secondary || cmsContent.global.phoneSecondary || "")
    setEmail(data.email || cmsContent.global.emailPrimary)
    setEmailSecondary(data.email_secondary || cmsContent.global.emailSecondary || "")
    setWhatsapp(data.whatsapp || cmsContent.global.whatsappNumber)
    setWorkingHours(data.working_hours || "9:00 AM - 7:00 PM")
    setAddress(data.address || cmsContent.global.address)
    setMapEmbed(data.map_embed || cmsContent.global.mapEmbed)
    setInstagram(data.instagram || cmsContent.global.socialLinks.instagram || "")
    setFacebook(data.facebook || cmsContent.global.socialLinks.facebook || "")
    setYoutube(data.youtube || cmsContent.global.socialLinks.youtube || "")
    setTwitter(data.twitter || cmsContent.global.socialLinks.twitter || "")
  }

  const fetchContact = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetching(true)
    else setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from("contact_information")
        .select("*")
        .eq("id", "main")
        .single()

      if (!error && data) {
        loadStateData(data)
        if (typeof window !== "undefined") {
          localStorage.setItem("adhitya-neet-contact-cms", JSON.stringify(data))
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
    const hasCache = typeof window !== "undefined" && localStorage.getItem("adhitya-neet-contact-cms")
    fetchContact(hasCache ? true : false)
  }, [fetchContact])

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading("Saving contact details...")

    try {
      const payload = {
        id: "main",
        academy_name: academyName.trim(),
        phone: phone.trim(),
        phone_secondary: phoneSecondary.trim(),
        email: email.trim(),
        email_secondary: emailSecondary.trim(),
        whatsapp: whatsapp.trim(),
        working_hours: workingHours.trim(),
        address: address.trim(),
        map_embed: mapEmbed.trim(),
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        twitter: twitter.trim(),
        youtube: youtube.trim(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("contact_information")
        .upsert(payload)

      if (error) throw error

      await logAdminAction(supabase, "Updated Contact Information CMS details")

      if (typeof window !== "undefined") {
        localStorage.setItem("adhitya-neet-contact-cms", JSON.stringify(payload))
      }

      toast.success("Contact Details saved successfully!", toastId)
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`, toastId)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] space-y-4 flex-col">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-slate-500 font-semibold text-xs">Loading contact parameters...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn text-sm">
      <form onSubmit={handleSaveContact} className="space-y-6">
        {/* Header card with save trigger */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Contact Information CMS
              {isSyncing && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 animate-pulse flex items-center gap-1 font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Syncing
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-xs">Configure helplines, support mailboxes, campus locations, social media links, and academy branding.</p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 rounded-xl px-5 shrink-0 text-xs shadow-md shadow-blue-500/10 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Contact Details
          </Button>
        </div>

        {/* 1. ACADEMY NAME & HOURS */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Academy Identity & Timings</CardTitle>
              <CardDescription className="text-xs text-slate-400">Configure global business title and working schedule.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-slate-700 font-semibold">Academy Name</Label>
                <Input
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="e.g. ADHITYA NEET ACADEMY"
                  required
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-700 font-semibold">Working / Consultation Hours</Label>
                <Input
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="e.g. 9:00 AM - 7:00 PM"
                  required
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. HELP & COMMUNICATION */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Communication & Helpline Desks</CardTitle>
              <CardDescription className="text-xs text-slate-400">Manage direct phone hotlines, WhatsApp, and support email addresses.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Primary Phone
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9600607680"
                  required
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Secondary Phone
                </Label>
                <Input
                  value={phoneSecondary}
                  onChange={(e) => setPhoneSecondary(e.target.value)}
                  placeholder="e.g. 096006 07680"
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                  WhatsApp Number
                </Label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 9600607680"
                  required
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Primary Support Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contact@adhityaneet.com"
                  required
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Secondary Support Email
                </Label>
                <Input
                  type="email"
                  value={emailSecondary}
                  onChange={(e) => setEmailSecondary(e.target.value)}
                  placeholder="e.g. support@adhityaneet.com"
                  className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. CAMPUS ADDRESS & MAP LOCATION */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Campus Address & Live Location Map</CardTitle>
              <CardDescription className="text-xs text-slate-400">Provide physical location details and Google Maps iframe embed src.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label className="text-slate-700 font-semibold">Complete Campus Address</Label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter postal address..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Google Maps Embed Source Link (src only)
              </Label>
              <Input
                value={mapEmbed}
                onChange={(e) => setMapEmbed(e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
                required
                className="rounded-xl border-slate-200 text-slate-800 h-11 px-4 text-xs focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Copy only the 'src' value inside Google Maps share iframe html code.</p>
            </div>
          </CardContent>
        </Card>

        {/* 4. SOCIAL MEDIA CHANNELS */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Official Social Media Platforms</CardTitle>
              <CardDescription className="text-xs text-slate-400">Link profiles to footer and contact buttons.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook Page URL
                </Label>
                <Input
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="rounded-xl border-slate-200 text-slate-850 h-11 px-4 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  Instagram Profile URL
                </Label>
                <Input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="rounded-xl border-slate-200 text-slate-850 h-11 px-4 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Youtube className="w-4 h-4 text-red-600" />
                  YouTube Channel URL
                </Label>
                <Input
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="rounded-xl border-slate-200 text-slate-850 h-11 px-4 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Twitter className="w-4 h-4 text-blue-400" />
                  Twitter / X Profile URL
                </Label>
                <Input
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="rounded-xl border-slate-200 text-slate-850 h-11 px-4 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
