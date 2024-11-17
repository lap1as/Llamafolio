import { forwardRef, InputHTMLAttributes, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

import styles from './input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type: 'text' | 'password'
  text: string
  forgotPassword: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ type, text, forgotPassword, ...rest }, ref) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const toggleVisibility = () => setIsVisible(!isVisible)

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={text.toLowerCase().replace(/\s+/g, '-')}>
        {text}
      </label>

      {forgotPassword && (
        <a className={styles.link} href='/'>
          Forgot password?
        </a>
      )}

      <div className={styles['input-container']}>
        <input
          className={styles.input}
          style={{ paddingRight: type === 'password' ? '2rem' : '0.725rem' }}
          type={isVisible ? 'text' : type}
          name={text.toLowerCase().replace(/\s+/g, '-')}
          ref={ref}
          {...rest}
        />

        {type === 'password' && (
          <button type='button' className={styles.eyeButton} onClick={toggleVisibility}>
            {isVisible ? <FaEye className={styles.eye} /> : <FaEyeSlash className={styles.eye} />}
          </button>
        )}
      </div>
    </div>
  )
})
