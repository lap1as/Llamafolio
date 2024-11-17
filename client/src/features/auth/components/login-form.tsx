import { FC, useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { PrimaryButton } from '@shared/ui'

import styles from './login-form.module.css'
import { ErrorMessage, Input, Or, SocialAuthButton, Title } from './ui'

interface LoginFormInputs {
  email: string
  password: string
}

export const LoginForm: FC = () => {
  const [error, setError] = useState<string | null>()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInputs>()

  useEffect(() => {
    if (errors.email?.message) {
      setError(errors.email.message)
    } else if (errors.password?.message) {
      setError(errors.password.message)
    } else {
      setError(null)
    }
  }, [errors.email, errors.password])

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    console.log('Form data:', data)
  }

  return (
    <form
      className={styles.form}
      autoComplete='off'
      onSubmit={(e) => {
        e.preventDefault()
        void handleSubmit(onSubmit)(e)
      }}
    >
      <Title text='Log in' />

      <div className={styles.container}>
        {error && <ErrorMessage message={error} />}

        <Input
          type='text'
          text='Email address'
          forgotPassword={false}
          {...register('email', {
            required: 'Please enter your email address.',
            pattern: {
              value:
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              message: 'Please enter a valid email address.'
            }
          })}
        />

        <Input
          type='password'
          text='Password'
          forgotPassword={true}
          {...register('password', {
            required: 'Please enter your password.'
          })}
        />
      </div>

      <PrimaryButton type='submit' text='Log in' className={styles.button} />

      <Or />

      <SocialAuthButton social='Google' />
    </form>
  )
}
