'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'

interface ImageMeta {
  id: number
  createdAt: string
}

export function CustomerImageGallery({ customerId }: { customerId: number }) {
  const [images, setImages] = useState<ImageMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchImages()
  }, [customerId])

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}/images`)
      if (res.ok) {
        const data = await res.json()
        setImages(data)
      }
    } catch (error) {
      console.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (images.length >= 6) {
      toast.error('Maximum limit of 6 images reached')
      return
    }

    // Reset input
    e.target.value = ''

    const formData = new FormData()
    formData.append('image', file)

    try {
      setUploading(true)
      const res = await fetch(`/api/customers/${customerId}/images`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      toast.success('Image uploaded')
      fetchImages() // Refresh list
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const res = await fetch(`/api/customers/${customerId}/images/${imageId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Image deleted')
        setImages((prev) => prev.filter((img) => img.id !== imageId))
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast.error('Error deleting image')
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Reference Images ({images.length}/6)
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= 6}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Add Image'}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : images.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                {/* View Image Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full h-full cursor-pointer transition-opacity hover:opacity-90">
                      <img
                        src={`/api/customers/${customerId}/images/${img.id}`}
                        alt="Reference"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <DialogTitle className="sr-only">Image Preview</DialogTitle>
                    <img
                      src={`/api/customers/${customerId}/images/${img.id}`}
                      alt="Full size reference"
                      className="w-full h-auto max-h-[85vh] object-contain rounded-md"
                    />
                  </DialogContent>
                </Dialog>

                {/* Delete Button here--> */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(img.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
