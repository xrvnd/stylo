"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle, // componenet for visual aid
  DialogTrigger,
} from "@/components/ui/dialog";

export type ImageProp = {
  id?: number;
  url: string;
  file?: File;
};

interface ImageUploadProps {
  images: ImageProp[];
  onImagesChange: (images: ImageProp[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function ImageUpload({
  images = [],
  onImagesChange,
  maxFiles = 25,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImageProps: ImageProp[] = acceptedFiles.map(file => ({
        file: file,
        url: URL.createObjectURL(file),
      }));
      
      const combined = [...images, ...newImageProps];
      onImagesChange(combined.slice(0, maxFiles));
    },
    [images, onImagesChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: Math.max(0, maxFiles - images.length),
    maxSize: maxSizeMB * 1024 * 1024,
  });

  const removeImage = (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];
    if (imageToRemove.file) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer",
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
        )}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-600">
          {isDragActive ? "Drop the files here..." : "Drag & drop, or click to select"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {maxFiles - images.length > 0
            ? `${maxFiles - images.length} more images can be added.`
            : 'Maximum number of images reached.'}
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((image, index) => (
            <Dialog key={image.id || image.url}>
              <div className="relative group aspect-square">
                <DialogTrigger asChild>
                  <img
                    src={image.url}
                    alt={image.file?.name || `Image ${image.id}`}
                    className="w-full h-full object-cover rounded-lg border cursor-pointer transition-transform hover:scale-105"
                  />
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-2 sm:p-4">
                  {/* --- FIX: Add the visually hidden title for accessibility --- */}
                  <DialogTitle className="sr-only">Image Preview</DialogTitle>
                  <img
                    src={image.url}
                    alt={image.file?.name || `Image ${image.id}`}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  />
                </DialogContent>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  ✕
                </button>
              </div>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
