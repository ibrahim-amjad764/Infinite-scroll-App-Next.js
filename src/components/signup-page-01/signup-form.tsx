"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/src/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel,
} from "@/src/components/ui/field"
import { Input } from "@/src/components/ui/input"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { app } from "@/src/lib/firebase"

async function saveUserToDB(idToken: string) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  })

  if (!res.ok) {
    const msg = await res.text()
    console.error("Backend DB Creation Failed:", msg)
    throw new Error("Signup DB Sync Failed")
  }

  return res.json()
}

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const auth = getAuth(app)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) router.replace("/dashboard")
    })
    return () => unsub()
  }, [auth, router])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const name = String(formData.get("name") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")
    const confirmPassword = String(formData.get("confirm-password") || "")

    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    const toastId = toast.loading("Creating your account...")

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Firebase User Created:", cred.user.uid)

      const idToken = await cred.user.getIdToken(true)
      console.log("Token Issued:", idToken.slice(0, 20), "...")

      await saveUserToDB(idToken)
      toast.success("Account created successfully", { id: toastId })

      router.push("/auth/login")
    } catch (err: any) {
      console.error("Signup failed:", err.message || err)
      toast.error(err.message || "Signup failed. Please try again.", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-gray-300 shadow-2xl border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Enter your details to create an account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <FieldGroup>

              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" name="name" placeholder="Enter full name" required className="border-gray-700" />
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required className="border-gray-700" />
              </Field>

              {/* Password */}
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="border-gray-700"/>
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FieldDescription>At least 8 characters.</FieldDescription>
              </Field>

              {/* Confirm Password */}
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="border-gray-700"/>
                  <button
                    type="button"
                    aria-label="Toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>

              {/* Submit */}
              <Field>
                <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a href="/auth/login" className="underline hover:text-[#0C7779]">
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}




















// return (
//   <div className={cn("flex flex-col gap-6", className)} {...props}>
//     <Card className="bg-gray-300 shadow-2xl border border-gray-200">
//       <CardHeader className="text-center">
//         <CardTitle className="text-xl">Create your account</CardTitle>
//         <CardDescription>
//           Enter your details to create an account
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form onSubmit={handleSignup} className="space-y-4">
//           <FieldGroup>
//             {/* Full Name */}
//             <Field>
//               <FieldLabel htmlFor="name">Full Name</FieldLabel>
//               <Input
//                 id="name"
//                 name="name"
//                 placeholder="Enter full name"
//                 required
//                 className="bg-white"
//               />
//             </Field>

//             {/* Email */}
//             <Field>
//               <FieldLabel htmlFor="email">Email</FieldLabel>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="m@example.com"
//                 required
//                 className="bg-white"
//               />
//             </Field>

//             {/* Password */}
//             <Field>
//               <FieldLabel htmlFor="password">Password</FieldLabel>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   required
//                   className="bg-white"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(p => !p)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//               <FieldDescription>At least 8 characters.</FieldDescription>
//             </Field>

//             {/* Confirm Password */}
//             <Field>
//               <FieldLabel htmlFor="confirm-password">
//                 Confirm Password
//               </FieldLabel>
//               <div className="relative">
//                 <Input
//                   id="confirm-password"
//                   name="confirm-password"
//                   type={showConfirmPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   required
//                   className="bg-white"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(p => !p)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
//                 >
//                   {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </Field>

//             {/* Submit */}
//             <Field>
//               <Button type="submit" className="w-full" disabled={loading}>
//                 {loading ? "Creating account..." : "Create Account"}
//               </Button>

//               <FieldDescription className="text-center">
//                 Already have an account?{" "}
//                 <a href="/auth/login" className="underline">
//                   Sign in
//                 </a>
//               </FieldDescription>
//             </Field>
//           </FieldGroup>
//         </form>
//       </CardContent>
//     </Card>
//   </div>
// )

