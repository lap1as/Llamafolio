import { FC } from 'react'

import styles from './title.module.css'

interface TitleProps {
  text: string
}

export const Title: FC<TitleProps> = ({ text }) => {
  return <h1 className={styles.title}>{text}</h1>
}
