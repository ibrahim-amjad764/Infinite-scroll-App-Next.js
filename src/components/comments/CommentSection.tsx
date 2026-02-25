import { useEffect, useState, useRef, useCallback } from "react";
import { AppDataSource } from '@/db/data-source';
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"


// Define the shape of the comment object for better type safety
interface Comment {
    id: string; // Unique comment identifier
    postId: string; // The post this comment belongs to
    user: {
        id?: string;
        firstName: string;
        lastName?: string;
        avatarUrl?: string;
    };
    content: string; // The actual comment text
    createdAt?: string; // Timestamp of comment creation
}

interface CommentSectionProps {
    postId: string; // Post ID to fetch/add comments for
    userId: string; // Current user ID for posting comments
}

// WebSocket connection states for UI feedback
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

const CommentSection = ({ postId, userId }: CommentSectionProps) => {
    // State management
    const [comments, setComments] = useState<Comment[]>([]); // List of comments
    const [content, setContent] = useState<string>(""); // Input field value
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for initial fetch
    const [isSending, setIsSending] = useState<boolean>(false); // Sending state for submit button
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

    // Use ref to avoid stale closure issues with WebSocket
    const wsRef = useRef<WebSocket | null>(null);

    // Fetch existing comments from API
    const fetchComments = useCallback(async () => {
        console.log("[Comments] Fetching comments for post:", postId);
        setIsLoading(true);

        try {
            const response = await fetch(`/api/posts/comment?postId=${postId}`);
            const data = await response.json();
            console.log("[Comments] Fetched", data.comments?.length || 0, "comments");
            setComments(data.comments || []);
        } catch (error) {
            console.error("[Comments] Error fetching comments:", error);
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    // Function to save comment to the server (new method provided)
    const saveComment = async (postId: string, content: string, userId: string) => {
        console.log("[Comment] ========== SAVING COMMENT ==========");
        console.log("[Comment] PostId:", postId);
        console.log("[Comment] UserId:", userId);
        console.log("[Comment] Content:", content.substring(0, 50) + "...");

        const queryRunner = AppDataSource!.createQueryRunner();

        try {
            // Checking post existence
            console.log("[Comment] Checking if post exists...");
            const postResult = await queryRunner.query(
                `SELECT id FROM posts WHERE id = $1`, [postId]
            );
            if (!postResult || postResult.length === 0) {
                console.error("[Comment] ERROR: Post not found:", postId);
                throw new Error("Post not found");
            }
            console.log("[Comment] Post found ✓");

            // Checking user existence
            console.log("[Comment] Checking if user exists...");
            const userResult = await queryRunner.query(
                `SELECT id, "firstName", "lastName", "avatarUrl" FROM users WHERE id = $1`, [userId]
            );
            if (!userResult || userResult.length === 0) {
                console.error("[Comment] ERROR: User not found:", userId);
                throw new Error("User not found");
            }
            console.log("[Comment] User found ✓");

            // Insert comment into database
            console.log("[Comment] Inserting comment...");
            const insertResult = await queryRunner.query(
                `INSERT INTO comments (content, "postId", "userId", "createdAt")
                 VALUES ($1, $2, $3, NOW())
                 RETURNING id, content, "createdAt"`,
                [content, postId, userId]
            );

            const savedComment = insertResult[0];
            console.log("[Comment] Comment saved successfully:", savedComment.id);

            // Return the saved comment for broadcasting
            return {
                id: savedComment.id,
                postId,
                content: savedComment.content,
                createdAt: savedComment.createdAt,
                user: {
                    id: userId,
                    firstName: userResult[0].firstName,
                    lastName: userResult[0].lastName,
                    avatarUrl: userResult[0].avatarUrl,
                },
            };
        } catch (error) {
            // Handle the 'unknown' error type correctly
            if (error instanceof Error) {
                console.error("[Comment] Error during saving:", error.message);
                throw error;  // Re-throw the error after logging
            } else {
                console.error("[Comment] Unknown error occurred:", error);
                throw new Error("An unknown error occurred during saving.");
            }
        } finally {
            await queryRunner.release();
        }
    };

    // Set up WebSocket connection and event handlers
    useEffect(() => {
        // Fetch existing comments on mount
        fetchComments();

        // Create WebSocket connection to /ws endpoint
        console.log("[WebSocket] Connecting to ws://localhost:3000/ws...");
        const ws = new WebSocket("ws://localhost:3000/ws");
        wsRef.current = ws;

        // Connection opened successfully
        ws.onopen = () => {
            console.log("[WebSocket] Connection established");
            setConnectionStatus("connected");
        };

        // Handle incoming messages (new comments from server)
        ws.onmessage = (event) => {
            console.log("[WebSocket] Received message:", event.data);
            const response = JSON.parse(event.data);

            try {
                if (response.error) {
                    console.error("[WebSocket] Server error:", response.error);
                    setIsSending(false);
                    return;
                }

                const newComment: Comment = response;
                console.log("[WebSocket] New comment received for post:", newComment.postId);

                if (newComment.postId === postId) {
                    setComments((prevComments) => {
                        const exists = prevComments.some((c) => c.id === newComment.id);
                        if (exists) {
                            console.log("[WebSocket] Comment already exists, skipping");
                            return prevComments;
                        }
                        console.log("[WebSocket] Adding new comment to list");
                        return [newComment, ...prevComments];
                    });
                }

                setIsSending(false);
            } catch (error) {
                console.error("[WebSocket] Error parsing message:", error);
                setIsSending(false);
            }
        };

        // Handle connection errors
        ws.onerror = (error) => {
            console.error("[WebSocket] Connection error:", error);
            setConnectionStatus("error");
        };

        // Handle connection close
        ws.onclose = () => {
            console.log("[WebSocket] Connection closed");
            setConnectionStatus("disconnected");
        };

        // Cleanup: close WebSocket when component unmounts or postId changes
        return () => {
            console.log("[WebSocket] Cleaning up connection...");
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            wsRef.current = null;
        };
    }, [postId, fetchComments]);

    // Handle posting a new comment via WebSocket
    const postComment = async () => {
        // Early return if the comment input is empty
        if (!content.trim()) {
            console.warn("[Comments] Cannot post empty comment");
            return;
        }

        const ws = wsRef.current;

        // Check if WebSocket is connected
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("[WebSocket] Not connected. Unable to send comment.");
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

            // Handle the WebSocket response when the server confirms the comment
            ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    console.log("[WebSocket] Response from server:", response);

                    // If the response contains commentId, update the UI and stop the sending state
                    if (response.commentId) {
                        setIsSending(false); // Stop the "sending..." state
                        setComments((prevComments) => {
                            // Ensure no duplicate comments by checking the comment ID
                            const commentExists = prevComments.some((comment) => comment.id === response.commentId);
                            if (!commentExists) {
                                console.log("[WebSocket] New comment added:", response.commentId);
                                return [response, ...prevComments]; // Add the new comment to the list
                            }
                            console.log("[WebSocket] Comment already exists, skipping...");
                            return prevComments;
                        });
                    }
                } catch (error) {
                    console.error("[WebSocket] Error processing message:", error);
                    setIsSending(false); // Ensure we stop sending if an error occurs
                }
            };
        } catch (error) {
            console.error("[WebSocket] Error sending comment:", error);
            setIsSending(false); // Stop sending state if something goes wrong
        }
    };

    // Handle Enter key to submit comment
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            postComment();
            handleCommentButtonClick(); // Call the same function as clicking the button
        }
    };

    const handleCommentButtonClick = () => {
        if (!isSending && content.trim()) {
            postComment();
        }
        setIsSending(!isSending);
    };

    return (
        <div className="comment-section bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 space-y-4">
            {/* Header with connection status */}
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
            <div className="mt-6 flex gap-4 items-center">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a comment... (Press Enter to send)"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white transition-all duration-200 ease-in-out"
                    rows={3}
                    disabled={connectionStatus !== "connected" || isSending}
                    onKeyDown={handleKeyPress}
                />
                <button
                    onClick={handleCommentButtonClick}
                    disabled={!content.trim() || connectionStatus !== "connected" || isSending}
                    className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
                >
                    {isSending ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin w-3 h-3 border-4 border-t-4 border-white rounded-full"></div>
                            <span>Sending...</span>
                        </div>
                    ) : (
                        "Post"
                    )}
                </button>
            </div>
        </div>
    );
};

export default CommentSection;
