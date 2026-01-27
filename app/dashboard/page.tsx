"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { app } from "@/src/lib/firebase"
import { toast } from "sonner"
import LogoutButton from "@/src/components/logout-page-03/logout-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/src/services/user.service"

export default function DashboardPage() {
  const auth = getAuth(app)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [dark, setDark] = useState(false)

  const toggleDark = () => {
    setDark(d => !d)
    if (typeof window !== "undefined") { // SSR safe
      document.documentElement.classList.toggle("dark")
    }
  }

  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, currentUser => {
      if (currentUser) {
        setUser(currentUser)
        toast.success("Login successful!", {
          position: "top-center",
          duration: 3000,
        })
      } else {
        toast.warning("Please login first!", {
          position: "top-center",
          duration: 5000, //disappears
        })
        setUser(null)
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
      setCheckingAuth(false)
    })
    return () => unsubcribe()
  }, [auth, router])

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: !!user, //only fetch database if user login 
  })

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-20 w-20 rounded-full slow-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center p-6">
        <p className="text-lg text-muted-foreground" >Redirecting  to login...</p>
      </div>
    )
  }

  return (
    <main className={`min-h-screen p-6 transition-colors duration-500 ${dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="mx-auto max-w-7xl space-y-10" >
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <div>
            <button onClick={toggleDark} className="rounded-md border border-gray-300 bg-gray-200 px-2 py-2 text-sm mr-3 font-medium hover:bg-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition">{dark ? "light Mode" : "Dark Mode"}</button>
            <LogoutButton />
          </div>
        </header>

        {/* Firebase Auth info */}
        <section className={`rounded-xl border p-6 shadow-md transition-colors duration-500 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <h2 className="text-xl font-semibold mb-2">Firebase Authentication Info</h2>
          <p className="text-sm text-muted-foreground max-w-prose leading-relaxed">Logged in as <span className="font-semibold text-gray-800 dark:text-gray-300">{user.email}</span>. Only authenticated users can access this dashboard. All data is synced with Firebase and PostgreSQL.</p>
        </section>

        {/* User Card */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">Users</h2>

          {isLoading ? (
            <div className="space-y-4"> {[1, 2, 3, 4, 5].map(i => (<Skeleton key={i} className="h-20 rounded-lg shadow-md slow-pulse" />))}</div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No user found</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {users.map(u => (
                <div key={u.id}>
                  <div className={`flex flex-col justify-between rounded-lg border p-5 shadow-md transition-colors duration-500 ${dark ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-100"}`}>
                    <p className="text-sm font-medium text-muted-foreground">ID: <span>{u.id}</span></p>
                    <h3 className="mt-1 text-lg font-semibold" > {u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : u.email.split("@")[0]}</h3>
                    <p className="text-sm mt-1 text-muted-foreground wrap-break-words">{u.email}</p>
                  </div>
                  <Badge variant={u.isActive ? "default" : "destructive"} className="self-start mt-4 px-4 py-1 text-sm font-semibold" >{u.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}