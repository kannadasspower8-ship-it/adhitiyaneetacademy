import { cache } from "react"
import { createClient } from "./supabase/client"
import { cmsContent } from "@/data/cmsContent"
import { courses as mockCourses, topRanks as mockAchievements } from "@/data/mockData"

// Helper to get global settings from contact_information
export const getGlobalSettings = cache(async function (customClient?: any): Promise<any> {
  const supabase = customClient || createClient()
  try {
    const { data, error } = await supabase
      .from("contact_information")
      .select("*")
      .eq("id", "main")
      .single()

    if (error || !data) return cmsContent.global

    return {
      ...cmsContent.global,
      phonePrimary: data.phone || cmsContent.global.phonePrimary,
      phoneSecondary: data.phone || cmsContent.global.phoneSecondary,
      emailPrimary: data.email || cmsContent.global.emailPrimary,
      emailSecondary: data.email || cmsContent.global.emailSecondary,
      address: data.address || cmsContent.global.address,
      mapEmbed: data.map_embed || cmsContent.global.mapEmbed,
      whatsappNumber: data.whatsapp || "9600607680",
      socialLinks: {
        facebook: data.facebook || cmsContent.global.socialLinks.facebook,
        instagram: data.instagram || cmsContent.global.socialLinks.instagram,
        twitter: data.twitter || cmsContent.global.socialLinks.twitter,
        youtube: data.youtube || cmsContent.global.socialLinks.youtube,
      }
    }
  } catch {
    return cmsContent.global
  }
})

// Intercepts website_content queries and pulls from the new pages tables
export const getSectionContent = cache(async function (key: string, fallback: any, customClient?: any): Promise<any> {
  const supabase = customClient || createClient()
  try {
    if (key === "home_hero") {
      const { data, error } = await supabase.from("website_home").select("*").eq("id", "main").single()
      if (!error && data) {
        return {
          ...fallback,
          titleHighlight: data.hero_title || fallback.titleHighlight,
          description: data.hero_description || fallback.description,
          image: data.hero_image || fallback.image,
          ctaText: data.cta_text || fallback.ctaText,
        }
      }
    }

    if (key === "home_why_choose_us") {
      const { data, error } = await supabase.from("website_home").select("*").eq("id", "main").single()
      if (!error && data) {
        return {
          ...fallback,
          title: data.why_choose_us_title || fallback.title,
          description: data.why_choose_us_description || fallback.description,
          items: data.why_choose_us_items || fallback.items,
        }
      }
    }

    if (key === "about_story") {
      const { data, error } = await supabase.from("website_about").select("*").eq("id", "main").single()
      if (!error && data) {
        return {
          ...fallback,
          content1: data.about_content || fallback.content1,
          content2: data.overview || fallback.content2,
          image: (data.images && data.images[0]) || fallback.image,
        }
      }
    }

    if (key === "about_mission") {
      const { data, error } = await supabase.from("website_about").select("*").eq("id", "main").single()
      if (!error && data) {
        return {
          ...fallback,
          content: data.mission || fallback.content,
        }
      }
    }

    if (key === "about_vision") {
      const { data, error } = await supabase.from("website_about").select("*").eq("id", "main").single()
      if (!error && data) {
        return {
          ...fallback,
          content: data.vision || fallback.content,
        }
      }
    }

    // Fallback to website_content table (if exists) or fall back to mock data
    const { data, error } = await supabase
      .from("website_content")
      .select("content")
      .eq("key", key)
      .single()

    if (error || !data) return fallback

    return { ...fallback, ...data.content }
  } catch {
    return fallback
  }
})

export const getDynamicCourses = cache(async function (customClient?: any): Promise<any> {
  const supabase = customClient || createClient()
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "Active")
      .order("created_at", { ascending: true })

    if (error || !data || data.length === 0) return mockCourses

    return data.map((c: any) => ({
      id: c.id,
      title: c.title,
      duration: c.duration || "",
      target: c.target || "",
      days: c.days || "",
      classTiming: c.class_timing || "",
      description: c.description || "",
      highlights: c.highlights || [],
      image: c.image_url || null,
    }))
  } catch {
    return mockCourses
  }
})

export const getDynamicGallery = cache(async function (customClient?: any): Promise<any> {
  const supabase = customClient || createClient()
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false })

    if (error || !data || data.length === 0) {
      return [
        { id: 1, src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000", alt: "Adhithya NEET Academy Erode Campus", category: "Campus" },
        { id: 2, src: "https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=1000", alt: "Advanced Biology and Chemistry Lecture Hall", category: "Classrooms" },
        { id: 3, src: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=1000", alt: "Annual Academic Merit Felicitation Ceremony", category: "Events" },
      ]
    }

    return data.map((g: any, idx: number) => ({
      id: g.id || idx,
      src: g.image_url,
      alt: g.caption || "Campus Life Gallery Shot",
      category: "Campus",
    }))
  } catch {
    return [
      { id: 1, src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000", alt: "Adhithya NEET Academy Erode Campus", category: "Campus" },
    ]
  }
})

export const getDynamicAchievements = cache(async function (customClient?: any): Promise<any> {
  const supabase = customClient || createClient()
  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("created_at", { ascending: false })

    if (error || !data || data.length === 0) return mockAchievements

    return data.map((a: any) => ({
      name: a.name,
      rank: a.rank,
      score: a.score,
      year: a.year,
      image: a.image_url || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
    }))
  } catch {
    return mockAchievements
  }
})
