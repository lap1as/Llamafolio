import { forwardRef, InputHTMLAttributes } from 'react'

import styles from './checkbox.module.css'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  inputClassName: string
  text: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ inputClassName, text, ...rest }, ref) => {
  return (
    <div className={styles.checkbox}>
      <input
        className={`${styles.input} ${inputClassName}`}
        type='checkbox'
        name={text.toLowerCase().replace(/\s+/g, '-')}
        ref={ref}
        {...rest}
      />
      <label className={styles.label} htmlFor={text.toLowerCase().replace(/\s+/g, '-')}>
        {text}
      </label>
    </div>
  )
})
