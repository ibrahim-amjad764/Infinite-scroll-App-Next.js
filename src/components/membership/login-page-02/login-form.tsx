"use client"

import { useState, useEffect } from "react"
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth"
import { app } from "@/src/lib/firebase"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const auth = getAuth(app)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/feed")
    })
    return () => unsub()
  }, [auth, router])

  // Refresh token effect (optional, you can add it here if you want)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading("Signing in...")
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken() //logged user get firebase token
      await fetch("/api/auth/login", { //token send to backend api to set cookie
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Login successful", { id: toastId })
      router.replace("/feed")
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700 px-4">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-15 max-w-md w-full border border-white/25 shadow-lg">
        {/* Top Title and Subtitle (from first snippet) */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white/50"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        <div className="mb-5">
          <h1 className="text-white text-xl font-bold text-center">Sign in to Firebase Authentication</h1>
          <p className="text-gray-300 mt-1 text-center">Ship Faster and Focus on Growth.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 text-white">
          {/* Email with icon */}
          <div className="relative">
            <Label htmlFor="email" className="sr-only">Email address</Label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-white/50 placeholder-white/70 pl-10 py-2 text-white focus:outline-none focus:border-white transition" />
            <MailIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-white/70 ml-1.5" size={20} />
          </div>

          {/* Password with icon and show toggle */}
          <div className="relative">
            <Label htmlFor="password" className="sr-only">Password</Label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b border-white/50 placeholder-white/70 pl-10 pr-10 py-2 text-white focus:outline-none focus:border-white transition" />
            <LockIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-white/70 ml-1.5" size={20} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 text-white/70 hover:text-white transition"
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm text-white/70">
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox id="remember" />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit button */}
          <Button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-800 rounded-full py-3 text-white font-semibold tracking-wide hover:brightness-125 transition disabled:opacity-60">
            {loading ? "Logging in..." : "LOGIN"}
          </Button>

          {/* Footer */}
          <p className="text-center text-sm text-white/70 mt-2">
            Don&apos;t have an account?{" "}
            <a href="/auth/sign-up" className="font-medium text-teal-400 hover:underline">
              Create an account
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
export default LoginForm
