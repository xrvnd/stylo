import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { validateId } from '@/lib/validations/middleware'

interface Params {
  params: Promise<{
    id: string
    imageId: string
  }>
}

//getting/serving the binary image data--> GET request
export async function GET(request: Request, { params }: Params) {
  const { id, imageId } = await params
  
  const customerValidation = validateId(id)
  const imageValidation = validateId(imageId)

  if (!customerValidation.success || !imageValidation.success) {
    return new Response('Invalid ID', { status: 400 })
  }

  try {
    const customerImage = await prisma.customerImage.findUnique({
      where: {
        id: imageValidation.id,
        customerId: customerValidation.id,
      },
      select: {
        image: true,
      },
    })

    if (!customerImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return new Response(customerImage.image, {
      status: 200,
      headers: {
        'Content-Type': 'image/*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })

  } catch (error) {
    console.error(`Error fetching image ${imageId} for customer ${id}:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove an image
export async function DELETE(request: Request, { params }: Params) {
  const { id, imageId } = await params
  
  const customerValidation = validateId(id)
  const imageValidation = validateId(imageId)

  if (!customerValidation.success || !imageValidation.success) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    await prisma.customerImage.delete({
      where: {
        id: imageValidation.id,
        customerId: customerValidation.id,
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}