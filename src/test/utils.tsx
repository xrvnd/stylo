import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'

function render(ui: ReactElement, options = {}) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, {
      wrapper: ({ children }) => children,
      ...options,
    }),
  }
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { render }
