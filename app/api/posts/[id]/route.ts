// // app/api/posts/[id]/route.ts
// import { NextResponse, NextRequest } from "next/server";
// import cloudinary from "../../../../src/lib/cloudinary";
// import { AppDataSource } from "../../../../src/db/data-source";
// import { Post } from "../../../../src/entities/post";
// import { getCurrentUser } from "../../../../src/lib/auth";

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;

//   // Validate input parameter
//   if (!id || typeof id !== 'string') {
//     console.log(`[Delete] Invalid post ID provided: ${id}`);
//     return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
//   }

//   try {
//     // 1️⃣ Authenticate and authorize user
//     console.log(`[Delete] Authenticating user for post deletion: ${id}`);
//     const currentUser = await getCurrentUser(req);
    
//     if (!currentUser) {
//       console.log(`[Delete] Unauthorized access attempt - no user found`);
//       return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
//     }

//     // Ensure database connection is initialized
//     if (!AppDataSource?.isInitialized) {
//       console.error("[Delete] Database not initialized");
//       return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
//     }

//     const postRepo = AppDataSource.getRepository(Post);

//     // 2️⃣ Fetch post from DB with user relation
//     console.log(`[Delete] Fetching post: ${id}`);
//     const post = await postRepo.findOne({
//       where: { id },
//       relations: ["user"] // Include user to check ownership
//     });

//     if (!post) {
//       console.log(`[Delete] Post not found: ${id}`);
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     // 3️⃣ Authorization check - only post owner can delete
//     if (post.user.id !== currentUser.id) {
//       console.log(`[Delete] Unauthorized deletion attempt - User ${currentUser.id} trying to delete post owned by ${post.user.id}`);
//       return NextResponse.json({ 
//         error: "Forbidden - You can only delete your own posts" 
//       }, { status: 403 });
//     }

//     console.log(`[Delete] Authorization successful - User ${currentUser.id} deleting own post: ${id}`);

//     // 2️⃣ Delete media from Cloudinary with improved error handling
//     // post.images is stored as simple array of URLs: ["url1", "url2"]
//     const imageUrls: string[] = Array.isArray(post.images) ? post.images : [];
    
//     if (imageUrls.length > 0) {
//       console.log(`[Delete] Processing ${imageUrls.length} images for deletion`);
      
//       // Process image deletions in parallel for better performance
//       const deletePromises = imageUrls.map(async (imageUrl, index) => {
//         // Validate image URL
//         if (!imageUrl || typeof imageUrl !== 'string') {
//           console.warn(`[Delete] Skipping invalid image URL:`, imageUrl);
//           return null;
//         }

//         // Extract public_id from Cloudinary URL with improved regex
//         const cloudinaryRegex = /\/(?:v\d+\/)?([^/]+)\.[a-zA-Z0-9]+$/;
//         const match = imageUrl.match(cloudinaryRegex);
        
//         if (!match) {
//           console.warn(`[Delete] Could not extract public_id from URL: ${imageUrl}`);
//           return null;
//         }

//         const public_id = match[1];
        
//         try {
//           const result = await cloudinary.uploader.destroy(public_id, {
//             resource_type: 'image',
//             invalidate: true, // Invalidate CDN cache
//           });
          
//           console.log(`[Delete] Successfully removed image: ${public_id} (result: ${result.result})`);
//           return { success: true, public_id, type: 'image' };
//         } catch (err) {
//           console.error(`[Delete] Failed to remove image from Cloudinary:`, err);
//           return { success: false, public_id, type: 'image', error: err };
//         }
//       });

//       // Wait for all image deletions to complete
//       const deleteResults = await Promise.allSettled(deletePromises);
      
//       // Log summary of image deletion results
//       const successful = deleteResults.filter(r => 
//         r.status === 'fulfilled' && r.value?.success
//       ).length;
//       const failed = deleteResults.length - successful;
      
//       console.log(`[Delete] Image deletion summary: ${successful} successful, ${failed} failed`);
//     }

//     // 3️⃣ Delete post from DB with transaction-like behavior
//     console.log(`[Delete] Removing post from database: ${id}`);
//     await postRepo.remove(post);
//     console.log(`[Delete] Post successfully deleted: ${id}`);

//     return NextResponse.json({ 
//       success: true, 
//       message: "Post deleted successfully",
//       deletedId: id 
//     });

//   } catch (err: any) {
//     console.error("[Delete] Post delete failed:", {
//       error: err.message,
//       stack: err.stack,
//       postId: id
//     });
    
//     return NextResponse.json(
//       { 
//         error: "Delete failed", 
//         message: err.message || "An unexpected error occurred",
//         postId: id
//       },
//       { status: 500 }
//     );
//   }
// }