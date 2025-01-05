import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'
import { validateId } from '@/lib/validations/middleware'

interface Params {
  params: {
    id: string
    imageId: string
  }
}

// GET /api/orders/[id]/images/[imageId] - Get image
export async function GET(request: Request, { params }: Params) {
  const orderValidation = validateId(params.id)
  const imageValidation = validateId(params.imageId)

  if (!orderValidation.success || !imageValidation.success) {
    return new Response('Invalid ID', { status: 400 })
  }

  try {
    const image = await prisma.orderImage.findUnique({
      where: {
        id: imageValidation.id,
        orderId: orderValidation.id
      }
    })

    if (!image) {
      return new Response('Image not found', { status: 404 })
    }

    return new Response(image.image, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('Error fetching image:', error)
    return new Response('Failed to fetch image', { status: 500 })
  }
}
