import { FC, useEffect, useState } from 'react'

import { Expand } from '@theme-toggles/react'

import { useTheme } from './index'

import '@theme-toggles/react/css/Expand.css'

interface ThemeToggleProps {
  className: string
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ className }) => {
  const { theme, setTheme } = useTheme()
  const [isToggled, setToggle] = useState<boolean>(theme === 'dark')

  useEffect(() => {
    setToggle(theme === 'dark')
  }, [theme])

  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    <Expand duration={200} toggled={isToggled} toggle={handleToggle} className={className} />
  )
}
