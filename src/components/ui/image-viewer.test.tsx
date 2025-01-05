import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { ImageViewer } from './image-viewer'

const mockImages = [
  { id: 1, image: new Uint8Array([1, 2, 3]) },
  { id: 2, image: new Uint8Array([4, 5, 6]) }
]

describe('ImageViewer', () => {
  it('displays images correctly', () => {
    render(<ImageViewer images={mockImages} orderId={1} />)
    
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(mockImages.length)
  })

  it('shows no images message when empty', () => {
    render(<ImageViewer images={[]} orderId={1} />)
    expect(screen.getByText(/no images/i)).toBeInTheDocument()
  })

  it('shows dialog controls', () => {
    render(<ImageViewer images={mockImages} orderId={1} />)
    
    const viewButton = screen.getByText(/view images/i)
    expect(viewButton).toBeInTheDocument()
  })
})
