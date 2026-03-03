import { useEffect, useState, useRef, useCallback } from "react";
import { AppDataSource } from '@/db/data-source';
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar"
import { Button } from "../../../../components/ui/button"
import { Textarea } from "../../../../components/ui/textarea"

interface Props {
   postId: string;
   userId: string;
   }
   
interface Comment {
  id: string;
  postId: string;
  user: {
    id?: string;
    firstName: string;
    lastName?: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt?: string;
}
interface CommentSectionProps {
  postId: string;
  userId: string;
}
interface TextareaButtonProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function TextareaButton({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
  placeholder = "Type your message here.",
}: TextareaButtonProps) {
  return (
    <div className="grid w-full gap-2">
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={onKeyDown} />
      <Button onClick={onSend} disabled={disabled || !value.trim()} className="transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
        Send message
      </Button>
    </div>
  );
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";
const CommentSection = ({ postId, userId }: CommentSectionProps) => {
  // State management
  const [comments, setComments] = useState<Comment[]>([]); // List of comments
  const [content, setContent] = useState<string>(""); // Input field value
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for initial fetch
  const [isSending, setIsSending] = useState<boolean>(false); // Sending state for submit button
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

  const wsRef = useRef<WebSocket | null>(null);


  const fetchComments = useCallback(async () => {
    console.log("[Comments] Fetching comments for post:", postId);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/comment?postId=${postId}`);
      const data = await response.json();
      console.log("[Comments] Fetched", data.comments?.length || 0, "comments");
      setComments(data.comments || []);
    } catch (error) {
      console.error("[Comments] Fetch error");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  // const saveComment = async (postId: string, content: string, userId: string) => {
  //     console.log("[Comment] ========== SAVING COMMENT ==========");
  //     console.log("[Comment] PostId:", postId);
  //     console.log("[Comment] UserId:", userId);
  //     console.log("[Comment] Content:", content.substring(0, 50) + "...");

  //     const queryRunner = AppDataSource!.createQueryRunner();

  //     try {
  //         // Checking post existence
  //         console.log("[Comment] Checking if post exists...");
  //         const postResult = await queryRunner.query(
  //             `SELECT id FROM posts WHERE id = $1`, [postId]
  //         );
  //         if (!postResult || postResult.length === 0) {
  //             console.error("[Comment] ERROR: Post not found:", postId);
  //             throw new Error("Post not found");
  //         }
  //         console.log("[Comment] Post found ");

  //         // Checking user existence
  //         console.log("[Comment] Checking if user exists...");
  //         const userResult = await queryRunner.query(
  //             `SELECT id, "firstName", "lastName", "avatarUrl" FROM users WHERE id = $1`, [userId]
  //         );
  //         if (!userResult || userResult.length === 0) {
  //             console.error("[Comment] ERROR: User not found:", userId);
  //             throw new Error("User not found");
  //         }
  //         console.log("[Comment] User found ");

  //         // Insert comment into database
  //         console.log("[Comment] Inserting comment...");
  //         const insertResult = await queryRunner.query(
  //             `INSERT INTO comments (content, "postId", "userId", "createdAt")
  //              VALUES ($1, $2, $3, NOW())
  //              RETURNING id, content, "createdAt"`,
  //             [content, postId, userId]
  //         );
  //         const savedComment = insertResult[0];
  //         console.log("[Comment] Comment saved successfully:", savedComment.id);

  //         // Return the saved comment for broadcasting
  //         return {
  //             id: savedComment.id,
  //             postId,
  //             content: savedComment.content,
  //             createdAt: savedComment.createdAt,
  //             user: {
  //                 id: userId,
  //                 firstName: userResult[0].firstName,
  //                 lastName: userResult[0].lastName,
  //                 avatarUrl: userResult[0].avatarUrl,
  //             },
  //         };
  //     } catch (error) {
  //         // Handle the 'unknown' error type correctly
  //         if (error instanceof Error) {
  //             console.error("[Comment] Error during saving:", error.message);
  //             throw error;  // Re-throw the error after logging
  //         } else {
  //             console.error("[Comment] Unknown error occurred:", error);
  //             throw new Error("An unknown error occurred during saving.");
  //         }
  //     } finally {
  //         await queryRunner.release();
  //     }
  // };

  useEffect(() => {
    let isActive = true; // prevents state updates after cleanup

    console.log(`[WebSocket] 🔄 Effect triggered for postId: ${postId}`);

    fetchComments();

    console.log("[WebSocket] 🌐 Connecting to ws://localhost:3000/ws...");

    const ws = new WebSocket("ws://localhost:3000/ws");
    wsRef.current = ws;

    // -------------------------
    // OPEN
    // -------------------------
    ws.onopen = () => {
      if (!isActive) return;

      console.log("[WebSocket]  Connection established");
      setConnectionStatus("connected");
    };

    // -------------------------
    // MESSAGE
    // -------------------------
    ws.onmessage = (event) => {
  if (!isActive) return;

  console.log("[WebSocket]  Raw message received:", event.data);

  try {
    const response = JSON.parse(event.data);

    if (response.error) {
      console.error("[WebSocket] ❌ Server error:", response.error);
      setIsSending(false);
      return;
    }

    const newComment: Comment = response;

    console.log(`[WebSocket] 📨 Parsed comment (id: ${newComment.id}) for post: ${newComment.postId}`);

    // Only update if this socket instance is still current
    if (wsRef.current !== ws) {
      console.warn("[WebSocket] ⚠️ Stale socket message ignored");
      return;
    }

    if (newComment.postId === postId) {
      // Update the comment section with new comment (without duplicates)
      setComments((prev) => {
        if (prev.some((c) => c.id === newComment.id)) return prev; // Avoid duplicates
        return [newComment, ...prev]; // Add new comment at the top
      });
    }

    setIsSending(false);
  } catch (error) {
    console.error("[WebSocket] ❌ JSON parse error:", error);
    setIsSending(false);
  }
};

    // -------------------------
    // ERROR
    // -------------------------
    ws.onerror = (error) => {
      if (!isActive) return;

      console.error("[WebSocket] 🚨 Connection error:", error);
      setConnectionStatus("error");
    };

    // -------------------------
    // CLOSE
    // -------------------------
    ws.onclose = (event) => {
      if (!isActive) return;

      console.log(
        `[WebSocket] 🔌 Connection closed (code: ${event.code}, reason: ${event.reason})`
      );

      setConnectionStatus("disconnected");
    };

    // -------------------------
    // CLEANUP (ROBUST)
    // -------------------------
    return () => {
      console.log(
        `[WebSocket] 🧹 Cleaning up connection for postId: ${postId}`
      );

      isActive = false;

      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      // Always close — safe even if CONNECTING
      ws.close();
    };
  }, [postId, fetchComments]);

  const postComment = async () => {
    if (!content.trim()) {
      console.warn("[Comments] Cannot post empty comment");
      return;
    }

    const ws = wsRef.current;

    // Check if WebSocket is connected
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("[WebSocket] Not connected.");
      setConnectionStatus("disconnected"); // Update UI to reflect disconnection
      return;
    }
    console.log("[WebSocket] Sending comment...");

    // Set sending state to true when we are sending the comment
    setIsSending(true);

    try {
      // Send comment to the WebSocket server
      ws.send(
        JSON.stringify({ postId, content: content.trim(), userId })
      );

      // Clear the input field after sending the comment for better UX
      setContent("");
       await fetchComments();  // Add this line to fetch updated comments
    } catch (error) {
      console.error("[WebSocket] Error sending comment:", error);
      setIsSending(false);
    }
  };

  // Handle the WebSocket response when the server confirms the comment
  //         ws.onmessage = (event) => {
  //             try {
  //                 const response = JSON.parse(event.data);
  //                 console.log("[WebSocket] Response from server:", response);

  //                 if (response.commentId) {
  //                     setIsSending(false); 
  //                     setComments((prevComments) => {
  //                         // Ensure no duplicate comments by checking the comment ID
  //                         const commentExists = prevComments.some((comment) => comment.id === response.commentId);
  //                         if (!commentExists) {
  //                             console.log("[WebSocket] New comment added:", response.commentId);
  //                             return [response, ...prevComments]; 
  //                         }
  //                         console.log("[WebSocket] Comment already exists, skipping...");
  //                         return prevComments;
  //                     });
  //                 }
  //             } catch (error) {
  //                 console.error("[WebSocket] Error processing message:", error);
  //                 setIsSending(false); 
  //             }
  //         };
  //     } catch (error) {
  //         console.error("[WebSocket] Error sending comment:", error);
  //         setIsSending(false); 
  //     }
  // };

  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter" && !e.shiftKey) {
  //     e.preventDefault();
  //     postComment();
  //     handleCommentButtonClick(); // Call the same function as clicking the button
  //   }
  // };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentButtonClick();
    }
  };

  // const handleCommentButtonClick = () => {
  //   if (!isSending && content.trim()) {
  //     postComment();
  //   }
  //   setIsSending(!isSending);
  // };
  const handleCommentButtonClick = () => {
    if (isSending) return;
    if (!content.trim()) return;

    postComment();
  };

  return (
    <div className="comment-section bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 space-y-4">
      <hr />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Comments</h3>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${connectionStatus === "connected"
            ? "bg-green-500 text-white"
            : connectionStatus === "connecting"
              ? "bg-yellow-500 text-white"
              : "bg-red-500 text-white"} transition-all duration-300`}
        >
          {connectionStatus === "connected"
            ? "● Live"
            : connectionStatus === "connecting"
              ? "Connecting..."
              : "Disconnected"}
        </span>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex gap-4 animate-pulse">
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-2 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex gap-3 items-start p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>{comment.user.firstName[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex gap-1 items-center">
                      <strong className="text-sm font-medium text-gray-800 dark:text-white">
                        {comment.user.firstName} {comment.user.lastName || ""}
                      </strong>
                      {comment.createdAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
              {/* Add hr between comments except after the last one */}
              {index !== comments.length - 1 && (
                <hr className="border-gray-300 dark:border-gray-600" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Comment input form */}
      {/* <div className="mt-6 flex gap-4 items-center">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment... (Press Enter to send)"
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white transition-all duration-200 ease-in-out"
          rows={3}
          disabled={connectionStatus !== "connected" || isSending}
          onKeyDown={handleKeyPress}
        />
        <Button
          onClick={handleCommentButtonClick}
          disabled={!content.trim() || connectionStatus !== "connected" || isSending}
          className="px-6 py-1.5 bg-blue-600 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
        >
          {isSending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-3 h-3 border-4 border-t-4 border-white rounded-full"></div>
              <span>Sending...</span>
            </div>
          ) : (
            "Post"
          )}
        </Button>
      </div> */}

      <div className="mt-6 ">
        <TextareaButton
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onSend={handleCommentButtonClick}
          disabled={connectionStatus !== "connected" || isSending}
          onKeyDown={handleKeyPress}
          placeholder="Write a comment... (Press Enter to send)"
        />
      </div>
    </div>
  );
}

export default CommentSection;