'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface ImageViewerProps {
  images: { id: number }[]
  orderId: number
}

export function ImageViewer({ images, orderId }: ImageViewerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const showPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const showNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') showPrevious()
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <DialogTrigger
            key={image.id}
            onClick={() => setCurrentIndex(index)}
            asChild
          >
            <div className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src={`/api/orders/${orderId}/images/${image.id}`}
                alt={`Order image ${image.id}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </DialogTrigger>
        ))}
      </div>

      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogTitle asChild>
          <VisuallyHidden>
            Order Image {currentIndex + 1} of {images.length}
          </VisuallyHidden>
        </DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center bg-black/95">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 text-white hover:bg-white/20"
            onClick={showPrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 text-white hover:bg-white/20"
            onClick={showNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Current image */}
          <div className="relative w-full h-full p-4">
            <Image
              src={`/api/orders/${orderId}/images/${images[currentIndex].id}`}
              alt={`Order image ${images[currentIndex].id}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Image counter */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
