"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle, // Import the title component
  DialogTrigger,
} from "@/components/ui/dialog";

interface ImageViewerProps {
  images: string[];
}

export function ImageViewer({ images }: ImageViewerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((imgSrc, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div className="border rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105">
              <img
                src={imgSrc}
                alt={`Order image ${index + 1}`}
                className="w-full h-48 object-cover"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-2 sm:p-4">
            {/* --- FIX: Add a visually hidden title for accessibility --- */}
            <DialogTitle className="sr-only">Order Image {index + 1}</DialogTitle>
            <img
              src={imgSrc}
              alt={`Order image ${index + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}