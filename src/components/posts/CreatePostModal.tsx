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
  const [uploadingImages, setUploadingImages] = useState<{ file: File; url?: string; progress: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const sanitizedImages = images.filter((img): img is string => Boolean(img));

  // Upload image with progress

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
    console.log("Cloudinary response:", response.data);
    console.log("Uploaded image URL / token:", response.data.urls[0]);

    return response.data.urls[0];
  };

  // Handle selected files

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    if (files.length + images.length > 6) {
      toast.error("Max 6 images allowed");
      return;
    }

    const newUploads = Array.from(files).map((file) => ({ file, progress: 0 }));
    setUploadingImages((prev) => [...prev, ...newUploads]);
    //mutliple file upload with progress
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
        //image uploaded progress
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

  // Render

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
