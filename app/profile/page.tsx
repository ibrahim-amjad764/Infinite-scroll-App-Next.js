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


// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProfileCard from "../../src/components/membership/profile-page/ProfileCard";
import ProfileHeader from "../../src/components/membership/profile-page/ProfileHeader";
import Loader from "../../components/ui/Loader";
import { getAuth, getIdToken } from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import { fetchUserProfile, fetchMyPosts } from "../../app/api/profile-user/user";

// -----------------------------
// Types
// -----------------------------
interface ProfileUser {
  firstName?: string;
  lastName?: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  createdAt?: string;
}

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
  };
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  likesCount: number;
  comments: Comment[];
  commentsCount: number;
}

// -----------------------------
// Firebase Config
// -----------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// -----------------------------
// Helper: Merge likes & comments into posts
// -----------------------------
const mergeLikesCommentsIntoPosts = (
  posts: Post[],
  likesData: { postid: string; count: number }[],
  commentsData: { postid: string; commentid: string; content: string; userid: string; firstName: string; lastName?: string; createdAt: string }[]
) => {
  const likesMap: Record<string, number> = {};
  likesData.forEach(like => {
    likesMap[like.postid] = like.count; // <-- use actual count
  });

  const commentsMap: Record<string, Comment[]> = {};
  commentsData.forEach(comment => {
    if (!commentsMap[comment.postid]) commentsMap[comment.postid] = [];
    commentsMap[comment.postid].push({
      id: comment.commentid,
      content: comment.content,
      user: { id: comment.userid, firstName: comment.firstName, lastName: comment.lastName },
      createdAt: comment.createdAt,
    });
  });

  return posts.map(post => ({
    ...post,
    likesCount: likesMap[post.id] || 0,
    comments: commentsMap[post.id] || [],
    commentsCount: commentsMap[post.id]?.length || 0,
  }));
};

// -----------------------------
// Fetch likes & comments for posts
// -----------------------------
const fetchLikesForPosts = async (postIds: string[]) => {
  const res = await fetch(`/api/posts/like?postIds=${postIds.join(",")}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  return await res.json();
};

const fetchCommentsForPosts = async (postIds: string[]) => {
  const res = await fetch(`/api/posts/comment?postIds=${postIds.join(",")}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  return await res.json();
};

// -----------------------------
// Component
// -----------------------------
const ProfilePage = () => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    document.title = "Profile | My Next JS App";
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (loading) return;
      setLoading(true);

      try {
        const token = await getFirebaseToken();
        if (!token) {
          toast.error("Please login again. Session expired.");
          router.push("/auth/login");
          return;
        }

        const userProfile = await fetchUserProfile();
        const { posts: rawPosts, hasMore: more } = await fetchMyPosts(page);

        setUser({
          ...userProfile,
          email: userProfile.email || "unknown@example.com",
        });

        // Get post IDs
        const postIds: string[] = rawPosts.map((p: Post) => p.id);

        // Fetch likes and comments
        const likesData = await fetchLikesForPosts(postIds);
        const commentsData = await fetchCommentsForPosts(postIds);

        // Merge into posts
        const postsWithEngagement: Post[] = mergeLikesCommentsIntoPosts(
          rawPosts,
          likesData,
          commentsData
        );

        setPosts(prev => (page === 1 ? postsWithEngagement : [...prev, ...postsWithEngagement]));
        setHasMore(more);
      } catch (error) {
        console.error("[ProfilePage] Error fetching profile/posts:", error);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [page]);

  const getFirebaseToken = async (): Promise<string | null> => {
    try {
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      return await getIdToken(currentUser, true);
    } catch (error) {
      console.error("Error getting Firebase token:", error);
      return null;
    }
  };

  const handleEditProfile = () => router.push("/profile/edit");

  if (!user) {
    return <Loader title="Loading profile..." subtitle="Fetching your account details" size="md" />;
  }

  const loadMorePosts = () => {
    if (!loading && hasMore) setPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 dark:bg-zinc-950">
      <div className="w-full px-10 py-10 space-y-6">
        <div className="bg-gray-500/10 rounded-lg shadow-md p-6 space-y-4">
          <ProfileHeader user={user} onEdit={handleEditProfile} showEditButton />
          <ProfileCard posts={posts} hasMore={hasMore} loadMore={loadMorePosts} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;