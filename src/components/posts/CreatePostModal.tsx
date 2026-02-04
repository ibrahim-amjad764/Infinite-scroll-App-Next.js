// "use client";

// import { useState, useRef } from "react"; // Purpose: React hooks for state + file reference
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Purpose: modal UI
// import { Button } from "@/components/ui/button"; // Purpose: action buttons
// import { Textarea } from "@/components/ui/textarea"; // Purpose: post text input
// import Image from "next/image"; // Purpose: optimized image preview
// import { toast } from "sonner"; // Purpose: toast notifications
// import { useQueryClient } from "@tanstack/react-query"; // Purpose: refetch posts after creation

// // Purpose: component props contract
// interface Props {
//   open: boolean; // Purpose: control modal visibility
//   onClose: () => void; // Purpose: close modal
//   onSuccess?: () => void; // Purpose: optional callback after success
// }

// // Purpose: convert file → base64 for instant preview
// const fileToBase64 = (file: File): Promise<string> =>
//   new Promise((resolve, reject) => {
//     const reader = new FileReader(); // Browser file reader API
//     reader.onload = () => resolve(reader.result as string); // Resolve base64 string
//     reader.onerror = reject; // Reject on error
//     reader.readAsDataURL(file); // Convert file to base64
//   });

// export function CreatePostModal({ open, onClose, onSuccess }: Props) {
//   // Purpose: textarea content state
//   const [content, setContent] = useState("");

//   // Purpose: image preview list (base64)
//   const [images, setImages] = useState<string[]>([]);

//   // Purpose: submit loading state
//   const [loading, setLoading] = useState(false);

//   // Purpose: hidden file input reference
//   const fileRef = useRef<HTMLInputElement>(null);

//   // Purpose: react-query cache control
//   const queryClient = useQueryClient();

//   // Purpose: handle textarea changes
//   const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setContent(e.target.value);
//   };

//   // Purpose: handle real image selection
//   const handleFiles = async (files: FileList | null) => {
//     if (!files) return;

//     // Purpose: frontend image limit validation
//     if (files.length + images.length > 6) {
//       toast.error("Max 6 images allowed");
//       return;
//     }

//     // Purpose: convert selected files to base64 previews
//     const base64Images = await Promise.all(
//       Array.from(files).map(fileToBase64)
//     );

//     setImages((prev) => [...prev, ...base64Images]);
//   };

//   // Purpose: submit post to backend
//   const handleSubmit = async () => {
//     if (!content.trim()) {
//       toast.error("Post content is required");
//       return;
//     }

//     setLoading(true);

//     const res = await fetch("/api/posts", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ content, images }), // images are base64 for now
//     });

//     setLoading(false);

//     if (!res.ok) {
//       toast.error("Something went wrong");
//       return;
//     }

//     toast.success("Post created successfully");

//     // Purpose: refetch feed posts
//     queryClient.invalidateQueries({ queryKey: ["posts"] });

//     // Purpose: reset modal state
//     setContent("");
//     setImages([]);

//     onClose();
//     onSuccess?.();
//   };

//   return (
//     <Dialog isOpen={open} onClose={onClose}>
//       <DialogContent className="max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Create Post</DialogTitle>
//         </DialogHeader>

//         {/* Post text input */}
//         <Textarea
//           placeholder="What's on your mind?"
//           value={content}
//           onChange={handleContentChange}
//           rows={4}
//         />

//         {/* Hidden file input */}
//         <input
//           type="file"
//           accept="image/*"
//           multiple
//           hidden
//           ref={fileRef}
//           onChange={(e) => handleFiles(e.target.files)}
//         />

//         {/* Image previews */}
//         <div className="flex gap-2 flex-wrap mt-2">
//           {images.map((img, i) => (
//             <Image
//               key={i}
//               src={img}
//               alt={`Post image ${i + 1}`}
//               width={80}
//               height={80}
//               className="rounded object-cover"
//             />
//           ))}
//         </div>

//         {/* Actions */}
//         <div className="flex justify-between mt-4">
//           <Button
//             variant="secondary"
//             onClick={() => fileRef.current?.click()} // open file picker
//           >
//             Add Image
//           </Button>

//           <Button onClick={handleSubmit} disabled={loading}>
//             {loading ? "Posting..." : "Post"}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }



// "use client";

// import { useState, useRef } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import Image from "next/image";
// import { toast } from "sonner";
// import { useQueryClient } from "@tanstack/react-query";
// import axios from "axios";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   onSuccess?: () => void;
// }

// export function CreatePostModal({ open, onClose, onSuccess }: Props) {
//   const [content, setContent] = useState("");
//   const [images, setImages] = useState<string[]>([]);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [uploadingImages, setUploadingImages] = useState<
//     { file: File; url?: string; progress: number }[]>([]);
//   const fileRef = useRef<HTMLInputElement>(null);
//   const queryClient = useQueryClient();
  

//   // handle content change in the textarea
//   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setContent(e.target.value);
//   };

//   // filter out invalid or empty images
//   const sanitizedImages = images.filter((img): img is string => Boolean(img));

//   // function upload image to Cloudinary
//   // const uploadImageToCloudinary = async (file: File) => {
//   //   const formData = new FormData();
//   //   formData.append("file", file);

//   //   const response = await fetch("/api/upload", { method: "POST", body: formData });
//   //   if (!response.ok) {
//   //     const data = await response.json();
//   //     console.error("Upload failed:", data);
//   //     throw new Error(data?.error || "Image upload failed");
//   //   }

//   //   const data = await response.json();
//   //   console.log("Uploaded image URL:", data.urls);
//   //   return data.urls[0];
//   // };
//     // ------------------------------
//   // Upload image with progress
//   // ------------------------------
//   const uploadImageToCloudinaryWithProgress = async (
//     file: File,
//     onProgress: (percent: number) => void
//   ) => {
//     const formData = new FormData();
//     formData.append("file", file);

//     const response = await axios.post("/api/upload", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//       onUploadProgress: (progressEvent) => {
//         const percentCompleted = Math.round(
//           (progressEvent.loaded * 100) / (progressEvent.total || 1)
//         );
//         onProgress(percentCompleted);
//       },
//     });

//     return response.data.urls[0];
//   };

//   // handle file selection and upload
//   const handleFiles = async (files: FileList | null) => {
//     if (!files) return;

//     // Check if the number of images exceeds the limit of 6
//     if (files.length + images.length > 6) {
//       toast.error("Max 6 images allowed");
//       return;
//     }

//     const newUploads = Array.from(files).map((file) => ({ file, progress: 0 }));
//     setUploadingImages((prev) => [...prev, ...newUploads]);

//     try {
//       const uploadPromises = Array.from(files).map((file) => uploadImageToCloudinaryWithProgress(file, (progress) => {
//         setUploadingImages((prev) => {
//           const updated = [...prev];
//           const index = updated.findIndex((u) => u.file === file);
//           if (index !== -1) {
//             updated[index] = { ...updated[index], progress };
//           }
//           return updated;
//         });
//       }));
//       const uploadedImages = await Promise.all(uploadPromises);
//       setImages((prev) => [...prev, ...uploadedImages]);
//     } catch (err: any) {
//       console.error("handleFiles error:", err);
//       toast.error(err?.message || "Image upload failed");
//     }
//   };

//   // Submit the post data (content and images)
//   const handleSubmit = async () => {
//     if (!content.trim()) {
//       toast.error("Post content is required");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch("/api/posts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content, images }),
//       });

//       const data = await res.json();
//       console.log("POST /api/posts response:", data);

//       if (!res.ok) {
//         toast.error(data?.error || "Something went wrong");
//         return;
//       }

//       toast.success("Post created successfully!");
//       queryClient.invalidateQueries({ queryKey: ["posts"] });

//       setContent("");
//       setImages([]);
//       setActiveIndex(0);
//       onClose();
//       if (onSuccess) onSuccess();
//     } catch (err: any) {
//       console.error("handleSubmit error:", err);
//       toast.error(err?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // function navigate next img
//   const nextImage = () => {
//     if (activeIndex < sanitizedImages.length - 1) {
//       setActiveIndex(activeIndex + 1);
//     }
//   };

//   // function navigate previous img
//   const prevImage = () => {
//     if (activeIndex > 0) {
//       setActiveIndex(activeIndex - 1);
//     }
//   };

//   return (
//     <Dialog isOpen={open} onClose={onClose}>
//       <DialogContent className="max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Create Post</DialogTitle>
//         </DialogHeader>

//         {/* post content */}
//         <Textarea
//           placeholder="What's on your mind?"
//           value={content}
//           onChange={handleChange}
//           rows={4}
//         />

//         {/* file input */}
//         <input
//           type="file"
//           accept="image/*"
//           multiple
//           hidden
//           ref={fileRef}
//           onChange={(e) => handleFiles(e.target.files)}
//         />

//         {/* image carousel */}
//         {sanitizedImages.length > 0 && (
//           <div className="flex justify-center items-center mt-2">
//             <Button
//               variant="secondary"
//               onClick={prevImage}
//               disabled={activeIndex === 0}
//               className="mr-2"
//             >
//               &lt;
//             </Button>

//             <div className="relative w-64 h-64">
//               <Image
//                 src={sanitizedImages[activeIndex]}
//                 alt={`Post image ${activeIndex + 1}`}
//                 fill
//                 className="object-cover"
//               />
//             </div>

//             <Button
//               variant="secondary"
//               onClick={nextImage}
//               disabled={activeIndex === sanitizedImages.length - 1}
//               className="ml-2"
//             >
//               &gt;
//             </Button>
//           </div>
//         )}

//         {/* thumbnail preview  */}
//         <div className="flex gap-2 flex-wrap mt-2">
//           {sanitizedImages.map((img: string, i: number) => (
//             <Image
//               key={i}
//               src={img || "/placeholder.png"}
//               alt={`Post image ${i + 1}`}
//               width={80}
//               height={80}
//               className="rounded object-cover"
//             />
//           ))}
//         </div>

//         {/* Button submittion post */}
//         <div className="flex justify-between mt-4">
//           <Button variant="secondary" onClick={() => fileRef.current?.click()}>
//             Add Image
//           </Button>
//           <Button onClick={handleSubmit} disabled={loading}>
//             {loading ? "Posting..." : "Post"}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePostModal({ open, onClose, onSuccess }: Props) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<
    { file: File; url?: string; progress: number }[]
  >([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const sanitizedImages = images.filter((img): img is string => Boolean(img));

  // ------------------------------
  // Upload image with progress
  // ------------------------------
  const uploadImageToCloudinaryWithProgress = async (
    file: File,
    onProgress: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        onProgress(percentCompleted);
      },
    });

    return response.data.urls[0];
  };

  // ------------------------------
  // Handle selected files
  // ------------------------------
  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    if (files.length + images.length > 6) {
      toast.error("Max 6 images allowed");
      return;
    }

    const newUploads = Array.from(files).map((file) => ({ file, progress: 0 }));
    setUploadingImages((prev) => [...prev, ...newUploads]);

    try {
      for (let i = 0; i < files.length; i++) {
        const uploadedUrl = await uploadImageToCloudinaryWithProgress(
          files[i],
          (progress) => {
            setUploadingImages((prev) =>
              prev.map((img, idx) =>
                idx === prev.length - files.length + i
                  ? { ...img, progress }
                  : img
              )
            );
          }
        );

        setImages((prev) => [...prev, uploadedUrl]);
        setUploadingImages((prev) =>
          prev.map((img, idx) =>
            idx === prev.length - files.length + i
              ? { ...img, url: uploadedUrl, progress: 100 }
              : img
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Image upload failed");
    } finally {
      // Remove uploaded images from uploadingImages state
      setUploadingImages((prev) => prev.filter((img) => !img.url));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Post content is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, images }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Something went wrong");
        return;
      }

      toast.success("Post created successfully!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      setContent("");
      setImages([]);
      setActiveIndex(0);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (activeIndex < sanitizedImages.length - 1) setActiveIndex(activeIndex + 1);
  };

  const prevImage = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <Dialog isOpen={open} onClose={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={handleChange}
          rows={4}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          ref={fileRef}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Image Carousel */}
        {sanitizedImages.length > 0 && (
          <div className="flex justify-center items-center mt-2">
            <Button variant="secondary" onClick={prevImage} disabled={activeIndex === 0} className="mr-2">
              &lt;
            </Button>

            <div className="relative w-64 h-64">
              <Image
                src={sanitizedImages[activeIndex]}
                alt={`Post image ${activeIndex + 1}`}
                fill
                className="object-cover"
              />
            </div>

            <Button
              variant="secondary"
              onClick={nextImage}
              disabled={activeIndex === sanitizedImages.length - 1}
              className="ml-2"
            >
              &gt;
            </Button>
          </div>
        )}

        {/* Thumbnails with advanced loading */}
        <div className="flex gap-2 flex-wrap mt-2">
          {/* Uploaded images */}
          {images.map((img, i) => (
            <Image
              key={i}
              src={img}
              alt={`Post image ${i + 1}`}
              width={80}
              height={80}
              className="rounded object-cover"
            />
          ))}

          {/* Uploading images */}
          {uploadingImages.map((img, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded overflow-hidden bg-gray-200 animate-pulse flex items-center justify-center"
            >
              <img
                src={URL.createObjectURL(img.file)}
                alt="Uploading"
                className="w-full h-full object-cover blur-sm"
              />
              <div
                className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all"
                style={{ width: `${img.progress}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                {img.progress}%
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Add Image
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
