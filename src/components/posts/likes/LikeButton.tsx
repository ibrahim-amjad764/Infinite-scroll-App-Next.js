"use client";

import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LikeButtonProps {
  postId: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
  userId: string;
}
interface LikeButtonMutationContext {
  previousIsLiked: boolean;
  previousLikesCount: number;
}

export const LikeButton = ({
  postId,
  initialIsLiked,
  initialLikesCount,
  userId,
}: LikeButtonProps) => {
  const queryClient = useQueryClient();

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  const likeMutation = useMutation({
    mutationFn: async () => {
      console.log(`\n[LikeButton] Sending request to server for post: ${postId}, user: ${userId}`);

      const res = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId, userId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[LikeButton] Server responded with status ${res.status}:`, errorText);
        throw new Error("Failed to update like");
      }

      const data = await res.json();
      console.log(`[LikeButton] Server response for post ${postId}:`, data);
      return data;
    },

    onMutate: async () => {
      const previousState: LikeButtonMutationContext = {
        previousIsLiked: isLiked,
        previousLikesCount: likesCount,
      };
       
      const nextIsLiked = !isLiked;
      setIsLiked(nextIsLiked);
      setLikesCount((prev) => prev + (nextIsLiked ? 1 : -1));
      console.log(`[Like] Post: ${postId}, User: ${userId}, Optimistic isLiked: ${nextIsLiked}`);
      return previousState;
    },

    onSuccess: (data) => {
      setIsLiked(data.action === "liked");
      setLikesCount(data.likesCount);
      console.log(`[Like] Post: ${postId}, User: ${userId}, Action: ${data.action}, Likes: ${data.likesCount}`);
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },

    onError: (error, _, context) => {
      console.error(`[LikeButton] Mutation failed for post ${postId}, user ${userId}:`, error);

      if (context) {
        setIsLiked(context.previousIsLiked);
        setLikesCount(context.previousLikesCount);
        console.error(`[Like] Post: ${postId}, User: ${userId}, Mutation failed`);
      }
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() =>
  //      {
  // if (isLiked) {
  //   console.log(`[LikeButton] User ${userId} already liked post ${postId}`);
  //   return; // early exit
  // }}
  likeMutation.mutate()}
  
      disabled={likeMutation.isPending}
      className={isLiked ? "text-red-500" : undefined}>
      <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
      {likesCount} {likesCount === 1 ? "Like" : "Likes"}
    </Button>
  );
};