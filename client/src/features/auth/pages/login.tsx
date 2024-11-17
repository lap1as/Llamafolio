import { FC, useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { PrimaryButton } from '@shared/ui'

import { Prompt } from '../components/ui'
import { ErrorMessage, Input, Or, SocialAuthButton, Title } from '../components/ui'
import styles from './login.module.css'

interface LoginFormInputs {
  email: string
  password: string
}

export const Login: FC = () => {
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
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Title text='Log in' />

        <form
          className={styles.form}
          autoComplete='off'
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit(onSubmit)(e)
          }}
        >
          {error && <ErrorMessage message={error} />}

          <Input
            type='text'
            text='Email address'
            forgotPassword={false}
            {...register('email', {
              required: 'Enter your email address.',
              pattern: {
                value:
                  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                message: 'Enter a valid email address.'
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

          <PrimaryButton type='submit' text='Log in' className={styles.button} />
        </form>

        <Or />
        <SocialAuthButton social='Google' />
      </div>

      <Prompt question='New to Llamafolio?' answer='Create account' link='/register' />
    </div>
  )
}
