import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const invalidFile = files.find(file => !validTypes.includes(file.type))
    if (invalidFile) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Process images
    const images = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        return prisma.orderImage.create({
          data: {
            orderId: Number(params.id),
            image: buffer
          }
        })
      })
    )

    return NextResponse.json(images[0], { status: 201 })
  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string; imageId: string } }
) {
  try {
    const image = await prisma.orderImage.findUnique({
      where: {
        id: Number(params.imageId),
        orderId: Number(params.orderId)
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    await prisma.orderImage.delete({
      where: {
        id: Number(params.imageId)
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
