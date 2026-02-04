// // /components/ui/dialog.tsx
// import * as React from "react"
// import { cn } from "@/src/lib/utils"  // Utility function for conditional classes
// import { Textarea } from "@/components/ui/textarea"  // The Textarea component we created earlier

// interface DialogProps {
//   isOpen: boolean
//   onClose: () => void
//   onPostSubmit: (content: string, images: string[]) => void
// }

// const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, onPostSubmit }) => {
//   if (!isOpen) return null

//   const [content, setContent] = React.useState<string>("")
//   const [images, setImages] = React.useState<File[]>([])

//   // Handle image file selection
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setImages([...images, ...Array.from(e.target.files)])
//     }
//   }

//   // Handle form submit
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     // Convert images to object URLs (you could also upload these to a server)
//     const imageUrls = images.map((image) => URL.createObjectURL(image))

//     // Pass content and images to the parent component
//     onPostSubmit(content, imageUrls)

//     // Reset the form fields after submission
//     setContent("")
//     setImages([])
//     onClose()  // Close the dialog after posting
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
//         <button
//           className="absolute top-2 right-2 text-xl font-bold"
//           onClick={onClose}
//         >
//           ×
//         </button>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="post-content" className="block text-sm font-medium text-gray-700">
//               Post Content
//             </label>
//             <Textarea
//               id="post-content"
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               placeholder="What's on your mind?"
//             />
//           </div>

//           <div>
//             <label htmlFor="post-images" className="block text-sm font-medium text-gray-700">
//               Select Images
//             </label>
//             <input
//               type="file"
//               id="post-images"
//               accept="image/*"
//               multiple
//               onChange={handleImageChange}
//               className="file:border-0 file:bg-transparent file:text-sm"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
//           >
//             Post
//           </button>
//         </form>
//       </div>
//     </div>
//   )
// }

// interface DialogContentProps {
//   children: React.ReactNode
// }

// const DialogContent: React.FC<DialogContentProps> = ({ children }) => {
//   return <div className="p-4">{children}</div>
// }

// interface DialogHeaderProps {
//   children: React.ReactNode
// }

// const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
//   return <div className="text-xl font-semibold">{children}</div>
// }

// interface DialogTitleProps {
//   children: React.ReactNode
// }

// const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
//   return <div className="text-2xl font-bold mb-4">{children}</div>
// }

// export { Dialog, DialogContent, DialogHeader, DialogTitle }

import * as React from "react";
import { cn } from "@/src/lib/utils"; // Utility function for conditional classes

// DialogProps to accept children and onClose callback
interface DialogProps {
  isOpen: boolean; // Renamed from `open` to `isOpen` for consistency
  onClose: () => void;
  children: React.ReactNode; // Allow Dialog to accept children
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Hide the dialog if not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <button
          className="absolute top-2 right-2 text-xl font-bold"
          onClick={onClose} // Close the modal
        >
          ×
        </button>
        {children} {/* Render children passed to Dialog */}
      </div>
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string; // Optional className for styling purposes
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return <div className={cn("p-4", className)}>{children}</div>; // Allow dynamic classes
};

interface DialogHeaderProps {
  children: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="text-xl font-semibold">{children}</div>;
};

interface DialogTitleProps {
  children: React.ReactNode;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <div className="text-2xl font-bold mb-4">{children}</div>;
};

export { Dialog, DialogContent, DialogHeader, DialogTitle };
