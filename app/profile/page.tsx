// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Button } from "../../components/ui/button";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { fetchUserProfile, fetchMyPosts } from "../../app/api/profile-user/user";
// import ProfileCard from "@/components/membership/profile-page/ProfileCard";
// import ProfileHeader from "@/components/membership/profile-page/ProfileHeader";
// import LogoutButton from "@/components/membership/logout-page-03/logout-form";
// import Loader from "../../components/ui/Loader";

// const ProfilePage = () => {
//   const [user, setUser] = useState<any>(null);
//   const [posts, setPosts] = useState<any[]>([]);
//   const router = useRouter();

//    useEffect(() => {
//     document.title = "Profile | My Next JS App"
//   }, [])

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [userProfile, { posts: myPosts }] = await Promise.all([
//           fetchUserProfile(),
//           fetchMyPosts(),
//         ]);
//         setUser(userProfile);
//         setPosts(myPosts);
//       } catch (error) {
//         console.error("[ProfilePage] Fetch error:", error);
//         toast.error("Failed to load profile. Please try again.");
//       }
//     };
//     load();
//   }, []);

//   const handleEditProfile = () => router.push("/profile/edit");

//   if (!user) return <Loader title="Loading profile..." subtitle="Fetching your account details" size="md" />;

//   return (
//     <div className="min-h-screen bg-slate-100 text-white">
//       <div className="max-w-xl mx-auto px-4 py-10 space-y-9">
//         {/* Home + Logout row */}
//         <div className="flex items-center justify-between">
//           <Button variant="outline" asChild className="text-gray-500 h-9 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
//             <Link href="/feed">Home</Link>
//           </Button>
//           <div className="w-22">
//             <Button
//               className="w-full bg-red-600 hover:bg-red-500 text-white rounded-md shadow-sm transition-all duration-200 ease-in-out hover:scale-105 active:scale-95" asChild>
//               <LogoutButton />
//             </Button>

//           </div>
//         </div>
//         <ProfileHeader user={user} onEdit={handleEditProfile} showEditButton  />

//         {/* Profile card + current user's posts */}
//         <ProfileCard user={user} posts={posts} />
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchUserProfile, fetchMyPosts } from "../../app/api/profile-user/user";
import ProfileCard from "@/components/membership/profile-page/ProfileCard";
import ProfileHeader from "@/components/membership/profile-page/ProfileHeader";
import Loader from "../../components/ui/Loader";
import { getAuth, getIdToken } from 'firebase/auth'; // Import from the modular SDK
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirebaseToken } from "@/services/auth.service"; // Import the helper function

// Initialize Firebase with your config (make sure to do this only once)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Set page title
  useEffect(() => {
    document.title = "Profile | My Next JS App";
  }, []);

  // Fetch user profile & posts whenever page changes
  useEffect(() => {
    const load = async () => {
      if (loading) return;
      setLoading(true);

      try {
        // Attempt to get fresh token if needed
        const token = await getFirebaseToken();

        if (!token) {
          toast.error("Please login again. Your session has expired.");
          router.push("/login"); // Redirect to login page
          return;
        }

        const userProfile = await fetchUserProfile();
        const { posts: myPosts, hasMore: more } = await fetchMyPosts(page);
        setUser(userProfile);

        // Append posts if page > 1, else replace
        setPosts((prev) => (page === 1 ? myPosts : [...prev, ...myPosts]));
        setHasMore(more);
      } catch (error) {
        console.error("[ProfilePage] Fetch error:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  // Get Firebase token (force refresh if expired)
  const getFirebaseToken = async () => {
    try {
      const auth = getAuth(app); // Use the correct auth instance
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      // Get a fresh token if the token is expired
      const token = await getIdToken(currentUser, true);  // true to force refresh
      console.log("Firebase Token refreshed:", token);
      return token;
    } catch (error) {
      console.error("Error fetching Firebase token:", error);
      return null;
    }
  };

  // Edit profile button
  const handleEditProfile = () => router.push("/profile/edit");

  // Show loader until user is loaded
  if (!user)
    return (
      <Loader
        title="Loading profile..."
        subtitle="Fetching your account details"
        size="md" />
    );

  // Load next page of posts
  const loadMorePosts = () => {
    if (!loading && hasMore) setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900">
      <div className="w-full px-10 py-10 space-y-6">
        <div className="bg-gray-500/10 rounded-lg shadow-md p-6 space-y-4">
          <ProfileHeader
            user={user}
            onEdit={handleEditProfile}
            showEditButton />
          
          {/* Infinite scroll posts */}
          <ProfileCard
            posts={posts}
            hasMore={hasMore}
            loadMore={loadMorePosts} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
