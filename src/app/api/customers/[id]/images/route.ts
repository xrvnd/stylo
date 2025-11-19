import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'
import { validateId } from '@/lib/validations/middleware'

interface Params {
  params: Promise<{ id: string }>
}

// GET: Fetch list of image IDs for a customer
export async function GET(request: Request, { params }: Params) {
  const { id } = await params
  const validation = validateId(id)
  if (!validation.success) return validation.error

  try {
    // fetch only IDs to keep the payload light. 
    // The actual binary data is loaded via the specific [imageId] route.
    const images = await prisma.customerImage.findMany({
      where: { customerId: validation.id },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching customer images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}

//uploading a new image
export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const validation = validateId(id)
  if (!validation.success) return validation.error

  try {
    // 1. Check Limit (setting max 6 images here)
    const count = await prisma.customerImage.count({
      where: { customerId: validation.id }
    })

    if (count >= 6) {
      return NextResponse.json(
        { error: 'Maximum limit of 6 images reached' },
        { status: 400 }
      )
    }

    // 2. Process File
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    //basic type check
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // 3. Save to DB here
    const newImage = await prisma.customerImage.create({
      data: {
        customerId: validation.id,
        image: buffer
      }
    })

    return NextResponse.json({ id: newImage.id }, { status: 201 })

  } catch (error) {
    console.error('Error uploading customer image:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}