"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneCall, Save, Loader2, Phone, Mail, MapPin, MessageCircle, Globe } from "lucide-react"
import { cmsContent } from "@/data/cmsContent"

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default function ContactInformationCMSPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Form State
  const [phone, setPhone] = useState(cmsContent.global.phonePrimary)
  const [email, setEmail] = useState(cmsContent.global.emailPrimary)
  const [whatsapp, setWhatsapp] = useState(cmsContent.global.whatsappNumber)
  const [address, setAddress] = useState(cmsContent.global.address)
  const [mapEmbed, setMapEmbed] = useState(cmsContent.global.mapEmbed)
  
  // Social Links State
  const [instagram, setInstagram] = useState(cmsContent.global.socialLinks.instagram)

  const fetchContact = useCallback(async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase
        .from("contact_information")
        .select("*")
        .eq("id", "main")
        .single()

      if (!error && data) {
        setPhone(data.phone || "")
        setEmail(data.email || "")
        setWhatsapp(data.whatsapp || "")
        setAddress(data.address || "")
        setMapEmbed(data.map_embed || "")
        setInstagram(data.instagram || "")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchContact()
  }, [fetchContact])

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("contact_information")
        .upsert({
          id: "main",
          phone: phone.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          address: address.trim(),
          map_embed: mapEmbed.trim(),
          facebook: "",
          instagram: instagram.trim(),
          twitter: "",
          youtube: "",
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      alert("Contact Information saved successfully!")
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
        <span className="ml-3 text-slate-500 font-semibold">Loading contact parameters...</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fadeIn text-sm">
      <form onSubmit={handleSaveContact} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Information CMS</h1>
            <p className="text-slate-500 text-sm">Update direct academy helplines, support mailboxes, locations, and social links.</p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-12 bg-primary hover:bg-primary/95 text-white font-bold flex items-center justify-center gap-2 rounded-xl px-6 shrink-0 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Contact Details
          </Button>
        </div>

        {/* Helplines Card */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
              <PhoneCall className="w-4.5 h-4.5 text-primary" />
              General Helpline Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Primary Telephone Number
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9600607680"
                  required
                  className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  WhatsApp Direct Number
                </Label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 9600607680"
                  required
                  className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                Helpline Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. contact@academy.com"
                required
                className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address and Map Embed */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-indigo-500" />
              Postal Address & Embed Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">Campus Address</Label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete postal address..."
                className="w-full min-h-[120px] border border-slate-250 rounded-xl p-3 text-sm text-slate-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                <Globe className="w-4 h-4 text-slate-400" />
                Google Maps Embed URL
              </Label>
              <Input
                value={mapEmbed}
                onChange={(e) => setMapEmbed(e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
                required
                className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
              />
              <p className="text-[11px] text-slate-400 font-semibold uppercase mt-1">Must be the exact src link of google maps embed iframe.</p>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 text-base font-bold">Social Media Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-md">
              <Label className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                <InstagramIcon className="w-4 h-4 text-pink-600" />
                Instagram Profile URL
              </Label>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="rounded-xl border-slate-250 text-slate-800 h-12 px-4 text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
