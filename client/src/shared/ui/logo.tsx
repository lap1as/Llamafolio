import { FC } from 'react'

import { Logo as LogoIcon } from '@shared/icons'

import styles from './logo.module.css'

interface LogoProps {
  width: number
}

export const Logo: FC<LogoProps> = ({ width }) => {
  return (
    <a className={styles.link} style={{ width }} href='/'>
      <LogoIcon className={styles.logo} />
    </a>
  )
}
