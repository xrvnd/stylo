import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateId } from '@/lib/validations/middleware';

interface Params {
  params: {
    id: string;
    imageId: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  // Destructure the ids from params first
  const { id, imageId } = params;
  
  // Now pass the destructured variables to your validation function
  const orderValidation = validateId(id);
  const imageValidation = validateId(imageId);

  if (!orderValidation.success || !imageValidation.success) {
    return new Response('Invalid ID', { status: 400 });
  }

  try {
    const orderImage = await prisma.orderImage.findUnique({
      where: {
        id: imageValidation.id,
        orderId: orderValidation.id,
      },
      select: {
        image: true,
      },
    });

    if (!orderImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return new NextResponse(orderImage.image, {
      status: 200,
      headers: {
        'Content-Type': 'image/*',
      },
    });

  } catch (error) {
    console.error(`Error fetching image ${imageId} for order ${id}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
