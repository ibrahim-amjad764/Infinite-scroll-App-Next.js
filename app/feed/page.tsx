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

import React, { useState, useEffect , useRef} from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/src/components/navbar/navbar';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'; // Skeleton Loader Component
import { renderUser } from '@/src/types/renderUser'; // User Rendering Helper
import InfiniteScroll from 'react-infinite-scroll-component'; // Infinite Scroll Component
import { Loader2 } from 'lucide-react'; // Loader icon

// User Type
interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[]; // undefined
  createdAt: string;
  user: User;
  time?: string;
}

interface FetchPostsResponse {
  posts: Post[];
  hasMore: boolean;
}

// Page with pagination
const fetchPosts = async (page: number): Promise<FetchPostsResponse> => {
  const res = await fetch(`/api/posts?page=${page}&limit=5`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  const data = await res.json();
  if (Array.isArray(data)) return { posts: data, hasMore: true }; // If response is an array, assume more posts might exist
  return { posts: data.posts || [], hasMore: data.hasMore || false };
};

// Feed Page Component
export default function FeedPage() {
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({}); // State to manage active image index for each post
  const [delayedLoading, setDelayedLoading] = useState(true); // State to manage delayed loading for skeleton UI
  const [page, setPage] = useState(1); // State to manage current page for pagination
  const [hasMore, setHasMore] = useState(true); // State to manage if more posts are available for infinite scroll
  const [loading, setLoading] = useState(false); // State to manage loading state for infinite scroll
  const [allPosts, setAllPosts] = useState<Post[]>([]); // State to store all fetched posts
  const scrollContainerRef = useRef<HTMLDivElement | null>(null); // Ref to manage the scroll container

  const { data, isLoading, isError } = useQuery<FetchPostsResponse>({
    queryKey: ["posts", page], // Unique query key that includes page number for caching
    queryFn: () => fetchPosts(page), // Query function that fetches posts based on current page
    retry: 2, // Retry failed requests up to 2 times
    placeholderData: (previousData) => previousData, // Keeps previous data while loading new page
  });

  useEffect(() => {
    if (data?.posts) {
      setAllPosts((prev) => [...prev ,...data.posts]); // Append new posts to the top
      setHasMore(data.hasMore); // Update hasMore based on API response
    }
  }, [data]);

  // Simulate a loading delay
  useEffect(() => {
    if (!isLoading && !isError) {
      const timer = setTimeout(() => {
        setDelayedLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isError]);

  const nextImage = (postId: string, length: number) => {
    setActiveIndices((prev) => ({
      ...prev,
      [postId]: Math.min((prev[postId] ?? 0) + 1, length - 1),
    }));
  }; // Function to handle next image in carousel

  const prevImage = (postId: string) => {
    setActiveIndices((prev) => ({
      ...prev,
      [postId]: Math.max((prev[postId] ?? 0) - 1, 0),
    }));
  }; // Function to handle previous image in carousel

  // Function to load more posts when the user scrolls to the end
  const loadMorePosts = () => {
    if (!loading && hasMore) {
      setLoading(true);
      setTimeout(() => {
        setPage((prev) => prev + 1); // Increment page number to fetch the next set of posts
        setLoading(false);
      }, 1000); // Simulate a slight delay before loading new posts
    }
  };

  if (isLoading || delayedLoading) return <SkeletonLoader />; // Show skeleton loader while loading or if loading takes too long
  if (isError) return <p className="text-center py-10">Something Went Wrong.</p>;
  if (data?.posts.length === 0) return <p className="text-center py-10">No posts yet.</p>;

  // const posts = data?.posts || []; // Extract posts from query data
  const posts = allPosts; // Use allPosts state which contains all fetched posts
  const hasMoreData = data?.hasMore || false; // Extract hasMore from query data

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-xl flex flex-col gap-6 py-6" ref= {scrollContainerRef}>
        <InfiniteScroll
          dataLength={posts.length}
          next={loadMorePosts}
          hasMore={hasMoreData}
          loader={
            <div className="flex justify-center my-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
          endMessage={<p className="flex justify-center py-4">No more posts to show</p>}
          scrollThreshold={0.9}
        >
          {posts.map((post, index) => {
            console.log("Post ID: ", post.id);
            const activeIndex = activeIndices[post.id] ?? 0;
            const safeUser = {
              ...post.user,
              firstName: post.user.firstName ?? 'Anonymous',
              lastName: post.user.lastName ?? '',
            };

            return (
             <Card key={`${post.id}-${index}`} className="shadow-md">
                <CardHeader className="flex flex-row items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{safeUser.email[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold">{renderUser(safeUser)}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.time ?? new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <CardContent className="text-sm p-0 mt-1">{post.content}</CardContent>
                  </div>
                </CardHeader>

                {post.images?.length ? (
                  <div className="relative w-full h-[300px]">
                    <Image
                      src={post.images[activeIndex]}
                      alt="Post image"
                      fill
                      loading="eager"
                      className="object-cover"
                    />
                    {post.images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between px-2">
                        <Button size="sm" variant="secondary" onClick={() => prevImage(post.id)} disabled={activeIndex === 0}>
                          ‹
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => nextImage(post.id, post.images!.length)}
                          disabled={activeIndex === post.images.length - 1}
                        >
                          ›
                        </Button>
                      </div>
                    )}
                  </div>
                ) : null}

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
        </InfiniteScroll>
      </div>
    </>
  );
}




