"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth"
import { app } from "@/src/lib/firebase"
import { useEffect } from "react"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const auth = getAuth(app)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        router.replace("/dashboard")
      }
    })
    return () => unsub()
  }, [auth, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const toastId = toast.loading("Signing in...")

  
  try {
    console.log("Sign-IN Start", email); 
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log("Firebase user object:", userCredential.user);
    
    const token = await userCredential.user.getIdToken();
    console.log("Token fetched:", token);

      toast.success("Login successful", { id: toastId });
      router.push("/dashboard");
      
    } catch (error: any) {
      console.error("Login failed:", error.message);
      toast.error(
        error.message || "Invalid email or password",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="email">
          Email address<span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-gray-700" />
      </div>

      {/* Password */}
      <div className="space-y-1">
        <Label htmlFor="password">
          Password<span className="text-destructive">*</span>
        </Label>

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            className="pr-10 border-gray-700 "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full text-muted-foreground"
            onClick={() => setShowPassword((p) => !p)}>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
      </div>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-muted-foreground">
            Remember me
          </Label>
        </div>

        <a href="/forgot-password"
          className="text-sm text-primary hover:underline" >
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full bg-teal-600 text-black hover:bg-teal-900" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a href="/auth/sign-up"
          className="font-medium text-primary hover:underline">
          Create an account
        </a>
      </p>
    </form>
  )
}
export default LoginForm