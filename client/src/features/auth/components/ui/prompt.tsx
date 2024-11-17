import { FC } from 'react'

import styles from './prompt.module.css'

interface PromptProps {
  question: string
  answer: string
  link: string
}

export const Prompt: FC<PromptProps> = ({ question, answer, link }) => {
  return (
    <div className={styles.wrapper}>
      {question}{' '}
      <a className={styles.link} href={link}>
        {answer}
      </a>
    </div>
  )
}
