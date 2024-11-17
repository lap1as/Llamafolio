import { FC } from 'react'
import { Outlet } from 'react-router-dom'

import { Logo } from '@shared/ui'

import styles from './layout.module.css'

export const Layout: FC = () => {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Logo width={150} />
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
