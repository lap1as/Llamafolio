import { FC } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { router as AuthRouter } from '@features/auth'

const router = createBrowserRouter([AuthRouter], {
  future: {
    v7_startTransition: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
})

export const Router: FC = () => {
  return <RouterProvider router={router} />
}
