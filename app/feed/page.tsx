// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { getAuth, onAuthStateChanged } from "firebase/auth"
// import { app } from "@/src/lib/firebase"
// import { toast } from "sonner"
// import LogoutButton from "@/src/components/logout-page-03/logout-form"
// import { Skeleton } from "@/components/ui/skeleton"
// import { Badge } from "@/components/ui/badge"
// import { useQuery } from "@tanstack/react-query"
// import { getUsers } from "@/src/services/user.service"

// export default function DashboardPage() {
//   const auth = getAuth(app)
//   const router = useRouter()
//   const [user, setUser] = useState<any>(null)
//   const [checkingAuth, setCheckingAuth] = useState(true)
//   const [dark, setDark] = useState(false)
//   const [postText, setPostText] = useState("")

//   const handlePost = async () => {
//   if (!postText.trim()) return

// }

//   const toggleDark = () => {
//     setDark(d => !d)
//     if (typeof window !== "undefined") { // SSR safe
//       document.documentElement.classList.toggle("dark")
//     }
//   }

//   useEffect(() => {
//     const unsubcribe = onAuthStateChanged(auth, currentUser => {
//       if (currentUser) {
//         setUser(currentUser)
//         toast.success("Login successful!", {
//           position: "top-center",
//           duration: 3000,
//         })
//       } else {
//         toast.warning("Please login first!", {
//           position: "top-center",
//           duration: 5000, //disappears
//         })
//         setUser(null)
//         setTimeout(() => {
//           router.push("/auth/login")
//         }, 2000)
//       }
//       setCheckingAuth(false)
//     })
//     return () => unsubcribe()
//   }, [auth, router])

//   const { data: users = [], isLoading } = useQuery({
//     queryKey: ["users"],
//     queryFn: getUsers,
//     enabled: !!user, //only fetch database if user login 
//   })

//   if (checkingAuth) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Skeleton className="h-20 w-20 rounded-full slow-pulse" />
//       </div>
//     )
//   }

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-center p-6">
//         <p className="text-lg text-muted-foreground" >Redirecting  to login...</p>
//       </div>
//     )
//   }

//   return (
//     <main className={`min-h-screen p-6 transition-colors duration-500 ${dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
//       <div className="mx-auto max-w-7xl space-y-10" >
//         <header className="flex items-center justify-between">
//           <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
//           <div>
//             <button onClick={toggleDark} className="rounded-md border border-gray-300 bg-gray-200 px-2 py-2 text-sm mr-3 font-medium hover:bg-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition">{dark ? "light Mode" : "Dark Mode"}</button>
//             <LogoutButton />
//           </div>
//         </header>

//         {/* Firebase Auth info */}
//         <section className={`rounded-xl border p-6 shadow-md transition-colors duration-500 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
//           <h2 className="text-xl font-semibold mb-2">Firebase Authentication Info</h2>
//           <p className="text-sm text-muted-foreground max-w-prose leading-relaxed">Logged in as <span className="font-semibold text-gray-800 dark:text-gray-300">{user.email}</span>. Only authenticated users can access this dashboard. All data is synced with Firebase and PostgreSQL.</p>
//         </section>

//         <section className="rounded-lg border p-4 bg-white">
//   <textarea
//     value={postText}
//     onChange={e => setPostText(e.target.value)}
//     placeholder="What's on your mind?"
//     className="w-full border p-2 rounded"
//   />
//   <button
//     onClick={handlePost}
//     className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
//   >
//     Post
//   </button>
// </section>


//         {/* User Card */}
//         <section>
//           <h2 className="mb-6 text-xl font-semibold">Users</h2>

//           {isLoading ? (
//             <div className="space-y-4"> {[1, 2, 3, 4, 5].map(i => (<Skeleton key={i} className="h-20 rounded-lg shadow-md slow-pulse" />))}</div>
//           ) : users.length === 0 ? (
//             <p className="text-center text-muted-foreground py-10">No user found</p>
//           ) : (
//             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {users.map(u => (
//                 <div key={u.id}>
//                   <div className={`flex flex-col justify-between rounded-lg border p-5 shadow-md transition-colors duration-500 ${dark ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-100"}`}>
//                     <p className="text-sm font-medium text-muted-foreground">ID: <span>{u.id}</span></p>
//                     <h3 className="mt-1 text-lg font-semibold" > {u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : u.email.split("@")[0]}</h3>
//                     <p className="text-sm mt-1 text-muted-foreground wrap-break-words">{u.email}</p>
//                   </div>
//                   <Badge variant={u.isActive ? "default" : "destructive"} className="self-start mt-4 px-4 py-1 text-sm font-semibold" >{u.isActive ? "Active" : "Inactive"}</Badge>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//       </div>
//     </main>
//   )
// }
"use client"

import Image from "next/image"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/src/components/navbar/navbar"

const posts = [
  {
    id: 1,
    user: "shadcn",
    time: "5h",
    // avatar: "https://github.com/evilrabbit.png",
    content: "A modern authentication system built with Firebase, focusing on security, performance, and clean UI.",
    image: "https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZnJlZSUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D",
  },
  
  {
    id: 2,
    user: "evilrabbit",
    time: "6d",
    // avatar: "https://github.com/evilrabbit.png",
    content: "This project demonstrates Firebase Authentication with a sleek, production-ready interface.",
    image: null,
  },
  {
    id: 3,
    user: "yyx990803",
    time: "7h",
    // avatar: "https://github.com/evilrabbit.png",
    content: "A modern authentication system built with Firebase, focusing on security, performance, and clean UI.",
    image: "https://images.unsplash.com/photo-1768463852001-811ead5844fb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNTB8fHxlbnwwfHx8fHw%3D",
  },
  {
    id: 4,
    user: "torvalds",
    time: "2h",
    // avatar: "https://github.com/evilrabbit.png",
    content: "Secure user authentication using Firebase with a modern React & Next.js stack.",
    image: "https://images.unsplash.com/photo-1702416197021-b24131ab8232?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlZSUyMGltYWdlcyUyMGNhcnN8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 5,
    user: "gaearon",
    time: "10d",
    // avatar: "https://github.com/evilrabbit.png",
    content: "A modern authentication system built with Firebase, focusing on security, performance, and clean UI.",
    image: "https://plus.unsplash.com/premium_photo-1763073253332-e75e796e8925?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNDV8fHxlbnwwfHx8fHw%3Dhttps://images.unsplash.com/photo-1768895415845-f3e6ff701a0b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMDd8fHxlbnwwfHx8fHw%3Dhttps://images.unsplash.com/photo-1702416197021-b24131ab8232?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlZSUyMGltYWdlcyUyMGNhcnN8ZW58MHx8MHx8fDA%3D",
  },
]

export default function FeedPage(){
  return(
    <>
          {/*navigation */}
          <Navbar />
    
          {/* feed container */}
          <div className="mx-auto max-w-xl flex flex-col gap-6 py-6">
            {posts.map((post) => (
              <Card key={post.id} className="shadow-md">
    
                {/* header with avatar and content */}
                <CardHeader className="flex flex-row items-start gap-3">
                  <Avatar>
                    <AvatarImage src={`https://github.com/${post.user}.png?s=100`} />
                    <AvatarFallback>{post.user[0]}</AvatarFallback>
                  </Avatar>
    
                  <div className="flex flex-col">
                    <div>
                      <p className="text-sm font-semibold">{post.user}</p>
                      <p className="text-xs text-muted-foreground">{post.time}</p>
                    </div>
                    <CardContent className="text-sm p-0 mt-1">
                      {post.content}
                    </CardContent>
                  </div>
                </CardHeader>
    
                {/* image */}
                {post.image && (
                  <div className="relative w-full h-[300px]">
                    <Image src={post.image} alt="post image" fill
                      className="object-cover" />
                  </div>
                )}
    
                {/* actions */}
                <CardFooter className="flex justify-around border-t">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4 mr-1" />Like
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />Comment
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />Share
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
    
  )
}