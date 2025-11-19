'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { customerSchema } from '@/lib/validations/schema'
import { Upload, X, ImageIcon } from 'lucide-react'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Text Form Data
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    address: '',
    paperCutting: false
  })

  // Image Upload State
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value === 'true' }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // --- Image Handling Functions ---
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const totalImages = selectedImages.length + newFiles.length

    if (totalImages > 6) {
      toast.error('You can only add up to 6 images')
      return
    }

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))

    setSelectedImages(prev => [...prev, ...newFiles])
    setImagePreviews(prev => [...prev, ...newPreviews])
    
    // Reset input so same file can be selected again if needed
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      // Revoke URL to prevent memory leaks
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }
  // -------------------------------

  const validateForm = () => {
    try {
      const cleanedData = {
        ...formData,
        nickname: formData.nickname || null,
        email: formData.email || null,
        address: formData.address || null
      }
      customerSchema.parse(cleanedData)
      setErrors({})
      return true
    } catch (error: any) {
      const newErrors: Record<string, string> = {}
      error.errors.forEach((err: { path: string[]; message: string }) => {
        newErrors[err.path[0]] = err.message
      })
      setErrors(newErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      const firstError = Object.values(errors)[0]
      if (firstError) toast.error(firstError)
      return
    }

    const cleanedData = {
      ...formData,
      nickname: formData.nickname || null,
      email: formData.email || null,
      address: formData.address || null
    }

    try {
      setLoading(true)
      
      // 1. Create Customer
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add customer')
      }

      const newCustomerId = data.id

      // 2. Upload Images (if any)
      if (selectedImages.length > 0) {
        try {
          // Upload images one by one
          await Promise.all(selectedImages.map(file => {
            const imageFormData = new FormData()
            imageFormData.append('image', file)
            return fetch(`/api/customers/${newCustomerId}/images`, {
              method: 'POST',
              body: imageFormData
            })
          }))
          toast.success('Customer and images added successfully')
        } catch (imgError) {
          console.error('Image upload error:', imgError)
          toast.warning('Customer added, but some images failed to upload')
        }
      } else {
        toast.success('Customer added successfully')
      }

      router.push('/customers')

    } catch (error: any) {
      console.error('Error adding customer:', error)
      toast.error(error.message || 'Error adding customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add New Customer</h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* --- Existing Fields --- */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="Enter nickname (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paperCutting">Paper Cutting</Label>
                <Select
                  value={formData.paperCutting.toString()}
                  onValueChange={(value) => handleSelectChange('paperCutting', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select paper cutting option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* --- NEW: Image Upload Section --- */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Reference Images ({selectedImages.length}/6)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={selectedImages.length >= 6}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Images
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                  />
                </div>

                {/* Image Grid */}
                {selectedImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative aspect-square group border rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={src}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-lg bg-gray-50/50">
                    <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">No images selected</p>
                  </div>
                )}
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating Customer...' : 'Create Customer'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}