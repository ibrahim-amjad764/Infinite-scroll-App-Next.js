// "use client";

// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Heart, MessageCircle, Share2 } from "lucide-react";
// import { Navbar } from "@/src/components/navbar/navbar";
// import Image from "next/image";
// import { renderUser } from "@/src/types/renderUser";


// // const posts = [
// //   {
// //     id: 1,
// //     user: "shadcn",
// //     time: "5h",
// //     // avatar: "https://github.com/evilrabbit.png",
// //     content: "A modern authentication system built with Firebase, focusing on security, performance, and clean UI.",
// //     image: "https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZnJlZSUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D",
// //   },

// //   {
// //     id: 2,
// //     user: "evilrabbit",
// //     time: "6d",
// //     // avatar: "https://github.com/evilrabbit.png",
// //     content: "This project demonstrates Firebase Authentication with a sleek, production-ready interface.",
// //     image: null,
// //   },
// //   {
// //     id: 3,
// //     user: "yyx990803",
// //     time: "7h",
// //     // avatar: "https://github.com/evilrabbit.png",
// //     content: "A modern authentication system built with Firebase, focusing on security, performance, and clean UI.",
// //     image: "https://images.unsplash.com/photo-1768463852001-811ead5844fb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNTB8fHxlbnwwfHx8fHw%3D",
// //   },
// //   {
// //     id: 4,
// //     user: "torvalds",
// //     time: "2h",
// //     // avatar: "https://github.com/evilrabbit.png",
// //     content: "Secure user authentication using Firebase with a modern React & Next.js stack.",
// //     image: "https://images.unsplash.com/photo-1702416197021-b24131ab8232?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlZSUyMGltYWdlcyUyMGNhcnN8ZW58MHx8MHx8fDA%3D",
// //   },
// //   {
// //     id: 5,
// //     user: "gaearon",
// //     time: "10d",
// //     // avatar: "https://github.com/evilrabbit.png",
// //     content: "A modern authentication system built with Firebase, focusing on security, performance, and clean UI.",
// //     image: "https://plus.unsplash.com/premium_photo-1763073253332-e75e796e8925?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNDV8fHxlbnwwfHx8fHw%3Dhttps://images.unsplash.com/photo-1768895415845-f3e6ff701a0b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMDd8fHxlbnwwfHx8fHw%3Dhttps://images.unsplash.com/photo-1702416197021-b24131ab8232?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlZSUyMGltYWdlcyUyMGNhcnN8ZW58MHx8MHx8fDA%3D",
// //   },
// // ]

//   //   <Card key={post.id}>...</Card>
//   // ))}

//   //User Type
// interface User {
//   id: string;
//   firstName?: string | null;
//   lastName?: string | null;
//   email: string;
// }

// //Post Type
// interface Post {
//   id: string;
//   content: string;
//   images?: string[]; //  undefined
//   createdAt: string;
//   user: User;
//   time?: string;
// }


// const fetchPosts = async (): Promise<Post[]> => {
//   const res = await fetch("/api/posts");

//   if (!res.ok) {
//     throw new Error("Failed to fetch posts");
//   }

//   const data = await res.json();

//   // Check if the data is an array, otherwise return an empty array
//   if (Array.isArray(data)) {
//     return data;
//   } else if (data && Array.isArray(data.posts)) {
//     return data.posts; // Assuming posts are inside a 'posts' key
//   } else {
//     console.error("Unexpected response structure:", data);
//     return []; // Return an empty array if the structure is unexpected
//   }
// };



// export default function FeedPage() {
//   const { data: posts = [], isLoading, error } = useQuery<Post[]>({
//     queryKey: ["posts"],//unique identifier
//     queryFn: fetchPosts,
//     retry: 2,
//   });
//   if (!Array.isArray(posts)) {
//   console.error("Expected posts to be an array, but got:", posts);
//   return <p>Something went wrong.</p>;
// }

//   // Manage active index for each post outside of .map()
//   const [activeIndices, setActiveIndices] = useState<{ [key: string]: number }>({});

//   const handleNextImage = (postId: string, imagesLength: number) => {
//     setActiveIndices((prev) => ({
//       ...prev,
//       [postId]: Math.min(prev[postId] + 1, imagesLength - 1),
//     }));
//   };

//   const handlePrevImage = (postId: string) => {
//     setActiveIndices((prev) => ({
//       ...prev,
//       [postId]: Math.max((prev[postId] || 0) - 1, 0),
//     }));
//   };

//   //   <Card key={post.id}>...</Card>
//   // ))}

//   if (isLoading) return <p>Loading posts...</p>;
//   if (error) return <p>Something went wrong.</p>;
//   if (posts.length === 0) return <p>No posts yet.</p>;

//   return (
//     <>
//       <Navbar />

//       <div className="mx-auto max-w-xl flex flex-col gap-6 py-6">
//         {posts.map((post) => {
//           const safeUser = {
//             ...post.user,
//             firstName: post.user.firstName ?? "Anonymous",
//             lastName: post.user.lastName ?? "",
//           };
//           const displayName =
//             post.user.firstName || post.user.lastName
//               ? `${post.user.firstName ?? ""} ${post.user.lastName ?? ""}`.trim()
//               : "Anonymous User";

//           // Set the activeIndex for the current post, if not set
//           if (activeIndices[post.id] === undefined) {
//             setActiveIndices((prev) => ({
//               ...prev,
//               [post.id]: 0, // Initialize the first image as the active one
//             }));
//           }

//           return (
//             <Card key={post.id} className="shadow-md">
//               {/* header */}
//               <CardHeader className="flex flex-row items-start gap-3">
//                 <Avatar>
//                   <AvatarFallback>
//                     {post.user.firstName?.[0] ?? post.user.lastName?.[0] ?? post.user.email[0].toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>

//                 <div className="flex flex-col">
//                   <p className="text-sm font-semibold">
//                     {renderUser(safeUser)}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     {post.time ?? new Date(post.createdAt).toLocaleDateString()}
//                   </p>

//                   <CardContent className="text-sm p-0 mt-1">
//                     {post.content}
//                   </CardContent>
//                 </div>
//               </CardHeader>

//               {/* image caousel */}
//               {post.images?.length ? (
//                 <div className="relative w-full h-[300px]">
//                   <Image
//                     src={post.images[activeIndices[post.id] || 0]} // Handle active index
//                     alt={`Post image ${activeIndices[post.id] || 0}`}
//                     fill
//                     className="object-cover"/>
//                   {post.images.length > 1 && (
//                     <div className="absolute inset-0 flex justify-between items-center">
//                       <Button
//                         variant="secondary"
//                         onClick={() => handlePrevImage(post.id)}
//                         disabled={activeIndices[post.id] === 0}>&lt;
//                       </Button>
//                       <Button
//                         variant="secondary"
//                         onClick={() => handleNextImage(post.id, post.images?.length || 0)}
//                         disabled={activeIndices[post.id] === (post.images?.length || 0) - 1}>&gt;
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               ) : null}

//               {/* actions */}
//               <CardFooter className="flex justify-around border-t">
//                 <Button variant="ghost" size="sm">
//                   <Heart className="h-4 w-4 mr-1" /> Like
//                 </Button>
//                 <Button variant="ghost" size="sm">
//                   <MessageCircle className="h-4 w-4 mr-1" /> Comment
//                 </Button>
//                 <Button variant="ghost" size="sm">
//                   <Share2 className="h-4 w-4 mr-1" /> Share
//                 </Button>
//               </CardFooter>
//             </Card>
//           );
//         })}
//       </div>
//     </>
//   );
// }



'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Navbar } from '@/src/components/navbar/navbar';
import Image from 'next/image';
import InfiniteScroll from '@/src/components/ui/infinite-scroll'; // Infinite scroll component
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/* =========================
   Types for Post and User
========================= */
interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[]; // Optional images array
  createdAt: string;
  user: User;
  time?: string;
  comments?: string[]; // Adding a comments array for each post
}

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

/* =========================
   Fetch Posts from API
========================= */
const fetchPosts = async (page: number): Promise<{ posts: Post[]; hasMore: boolean }> => {
  try {
    const res = await fetch(`/api/posts?page=${page}&limit=5`);

    // Check if the response is successful (status code 200)
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.statusText}`);
    }

    const data = await res.json();

    // Ensure the data is in the correct format
    if (!data || !Array.isArray(data.posts)) {
      throw new Error('Unexpected response format from the server');
    }

    // Calculate if there are more posts
    const hasMore = data.posts.length === 5; // If less than 5 posts are returned, there are no more posts

    return { posts: data.posts, hasMore };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('An error occurred while fetching posts');
  }
};

/* =========================
   Feed Page Component
========================= */
export default function FeedPage() {
  /* -------------------------
     State Variables
  ------------------------- */
  const [page, setPage] = useState(1);              // Current page number for pagination
  const [allPosts, setAllPosts] = useState<Post[]>([]); // Accumulated posts to display
  const [hasMore, setHasMore] = useState(true);     // Flag to determine if more posts are available
  const [isDelayLoading, setIsDelayLoading] = useState(false); // Simulate delay loader
  const [activeIndices, setActiveIndices] = useState<{ [key: string]: number }>({}); // Active index for image carousel

  /* -------------------------
     Fetch Posts using React Query
  ------------------------- */
  const { data, isFetching, error } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts(page), // Function to fetch posts
    placeholderData: (previousData) => previousData, // Prevent UI jump by using previous data if available
  });

  /* -------------------------
     Handle New Data and Loading
  ------------------------- */
  useEffect(() => {
    if (!data) return;

    console.log("Fetched data:", data);

    setIsDelayLoading(true);

    const timer = setTimeout(() => {
      if (Array.isArray(data.posts) && data.posts.length > 0) {
        console.log("Appending posts:", data.posts);
        setAllPosts((prev) => [...prev, ...data.posts]); // Append newly fetched posts
        setHasMore(data.hasMore);                         // Update hasMore based on the response
      } else {
        console.log("No more posts, setting hasMore to false");
        setHasMore(false); // If no posts are returned, disable further loading
      }
      setIsDelayLoading(false);
    }, 4000); // Delay to simulate loading effect

    return () => clearTimeout(timer); // Clean up timer on component unmount
  }, [data]);

  /* -------------------------
     Load More Posts on Scroll
  ------------------------- */
  const loadMorePosts = () => {
    if (!isFetching && hasMore && !isDelayLoading) {
      setPage((prev) => prev + 1); // Increment page number to load the next set of posts
    }
  };

  /* -------------------------
     Initial Loading State
  ------------------------- */
  if (page === 1 && allPosts.length === 0 && isFetching) {
    return (
      <div className="text-center py-6">
        <Loader2 className="my-4 h-8 w-8 animate-spin" />
        Loading posts...
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="text-center py-6 text-red-600">
        {/* Display error message if an error occurs */}
        {error.message}
      </div>
    );
  }

  /* =========================
     Render Feed Page
  ========================= */
  return (
    <>
      <Navbar /> {/* Render the navigation bar */}

      {/* Infinite Scroll Component */}
      <InfiniteScroll
        next={loadMorePosts} // Function to load more posts
        hasMore={hasMore} // Whether there are more posts to load
        isLoading={isFetching || isDelayLoading} // Loading state
        loader={
          <div className="text-center py-4" key="loader">
            <Loader2 className="my-4 h-8 w-8 animate-spin" />
            Loading posts...
          </div>
        }
        endMessage={
          <p className="text-center py-4 text-muted-foreground" key="end">
            No more posts to show.
          </p>
        }
      >
        <div className="mx-auto max-w-xl flex flex-col gap-6 py-6">
          {allPosts.map((post) => {
            const firstName = post.user.firstName ?? 'Anonymous';
            const lastName = post.user.lastName ?? '';

            // Initialize activeIndex for image carousel if not already set
            if (activeIndices[post.id] === undefined) {
              setActiveIndices((prev) => ({
                ...prev,
                [post.id]: 0, // Initialize first image as active
              }));
            }

            return (
              <Card key={post.id} className="shadow-md">
                {/* Header with User Info */}
                <CardHeader className="flex flex-row items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {firstName[0] ?? post.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <p className="text-sm font-semibold">{firstName} {lastName}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.time ?? new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <CardContent className="text-sm p-0 mt-1">{post.content}</CardContent>
                  </div>
                </CardHeader>

                {/* Image Carousel */}
                {post.images?.length ? (
                  <div className="relative w-full h-[300px]">
                    <Image
                      src={post.images[activeIndices[post.id]]}
                      alt={`Post image ${activeIndices[post.id]}`}
                      fill
                      className="object-cover"
                      onClick={() => toast.info(`Viewing image ${activeIndices[post.id] + 1} of ${post.images?.length}`)}
                    />
                  </div>
                ) : null}

                {/* Actions like Like, Comment, Share */}
                <CardFooter className="flex justify-around border-t">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4 mr-1" /> Like
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" /> Comment
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </InfiniteScroll>
    </>
  );
}
