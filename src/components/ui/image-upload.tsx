'use client'

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X } from 'lucide-react'
import Image from 'next/image'
import { Button } from './button'

interface ImageUploadProps {
  images: { id?: number; url: string }[]
  onImagesChange: (images: { id?: number; url: string }[]) => void
  maxFiles?: number
}

export function ImageUpload({ images, onImagesChange, maxFiles = 5 }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file
    }))
    
    // Combine existing images with new ones, respecting maxFiles
    const updatedImages = [...images, ...newImages].slice(0, maxFiles)
    onImagesChange(updatedImages)
  }, [images, onImagesChange, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: Math.max(0, maxFiles - images.length),
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag & drop images here, or click to select</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          PNG, JPG up to 5MB (max {maxFiles} files)
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={image.url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
