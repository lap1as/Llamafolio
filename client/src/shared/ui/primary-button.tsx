import { FC } from 'react'

import styles from './primary-button.module.css'

interface PrimaryButtonProps {
  text: string
  type: 'button' | 'reset' | 'submit' | 'link'
  href?: string
  className: string
}

export const PrimaryButton: FC<PrimaryButtonProps> = ({ text, type, href, className }) => {
  switch (type) {
    case 'link':
      return (
        <a className={`${styles.link} ${className} transition`} href={href}>
          {text}
        </a>
      )
    default:
      return (
        <button className={`${styles.button} ${className} transition`} type={type}>
          {text}
        </button>
      )
  }
}
