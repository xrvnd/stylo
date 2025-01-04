import { NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'

export function validateRequest(schema: ZodSchema) {
  return async function (request: Request) {
    try {
      const json = await request.json()
      const validatedData = schema.parse(json)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          error: NextResponse.json(
            {
              error: 'Validation failed',
              details: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
              }))
            },
            { status: 400 }
          )
        }
      }
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Invalid request data' },
          { status: 400 }
        )
      }
    }
  }
}

export function validateId(id: string) {
  const parsedId = parseInt(id)
  if (isNaN(parsedId) || parsedId <= 0) {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }
  }
  return { success: true, id: parsedId }
}
