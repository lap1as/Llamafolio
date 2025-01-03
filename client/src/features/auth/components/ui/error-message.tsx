import { FC } from 'react'

import styles from './error-message.module.css'

interface ErrorMessageProps {
  message: string
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ message }) => {
  return <div className={styles['error-message']}>{message}</div>
}
