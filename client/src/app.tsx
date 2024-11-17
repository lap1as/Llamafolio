import { FC } from 'react'

import { ThemeProvider } from '@features/theme'

import { Router } from './router'

export const App: FC = () => {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  )
}
