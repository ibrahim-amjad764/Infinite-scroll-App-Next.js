import CommentSection from './comments/CommentSection';
import { LikeButton } from './likes/LikeButton';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
}

interface PostData {
  id: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
}

interface PostProps {
  postId: string;
  currentUser: User;
}

export default function Post({ postId, currentUser }: PostProps) {
  const [post, setPost] = useState<PostData | null>(null);

  useEffect(() => {
    async function fetchPost() {
      const res = await fetch(`/api/posts?mine=1`);
      const data = await res.json();

      // find the correct post from array
      const foundPost = data.posts.find((p: PostData) => p.id === postId);
      setPost(foundPost || null);
    }

    fetchPost();
  }, [postId]);

  if (!post) return <p>Loading...</p>;

  return (
    <div className="post-card p-4 border rounded-lg">
      <p>{post.content}</p>

      <LikeButton
        postId={post.id}
        userId={currentUser.id}
        initialIsLiked={post.isLikedByUser}
        initialLikesCount={post.likesCount}
      />

      <CommentSection
        postId={post.id}
        userId={currentUser.id}
      />
    </div>
  );
}