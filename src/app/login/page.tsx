"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Lock, Mail, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      // 1. Try checking students database table for matching username and password (mobile number)
      const { data: student, error: studentErr } = await supabase
        .from("students")
        .select("id, name, username, password")
        .eq("username", email.trim())
        .eq("password", password.trim())
        .maybeSingle()

      if (!studentErr && student) {
        // Success! Set cookie and redirect
        document.cookie = `student_id=${student.id}; path=/; max-age=86400; SameSite=Lax;`
        router.push("/student/dashboard")
        router.refresh()
        return
      }

      // 2. Otherwise fallback to standard admin Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) throw error

      if (data.user) {
        // First check metadata
        let role = data.user.user_metadata?.role
        
        // Fallback: query database directly
        if (!role) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("id", data.user.id)
            .single()
          
          if (roleData) {
            role = roleData.role
          }
        }

        if (role === "admin") {
          router.push("/admin/dashboard")
          router.refresh()
        } else {
          // If not admin, sign them out immediately
          await supabase.auth.signOut()
          throw new Error("Access Denied: Only manually configured administrator accounts can access this panel.")
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your details.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        {/* Brand Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900">ADHITYA NEET ACADEMY</h1>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">Website CMS Control Panel</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-xl bg-white rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-700"></div>
          <CardHeader className="pb-4 pt-8 text-center">
            <CardTitle className="text-lg text-slate-800 font-extrabold">Portal Login</CardTitle>
            <CardDescription className="text-xs">Sign in as an Administrator or a Student to view dashboard reviews.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-655 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-tight font-medium">{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <Label className="text-slate-655 flex items-center gap-1.5 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address / Username
                </Label>
                <Input
                  placeholder="admin@email.com or Student Name"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-slate-250 text-slate-800 text-sm h-12 px-4 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2 text-xs">
                <Label className="text-slate-655 flex items-center gap-1.5 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-slate-250 text-slate-800 text-sm h-12 px-4 focus-visible:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="pb-8 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all duration-300"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In to Panel
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          Authorized personnel only • Erode Campus Licensing
        </p>
      </div>
    </div>
  )
}
