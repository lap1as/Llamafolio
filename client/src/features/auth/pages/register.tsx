import { FC, useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { PrimaryButton } from '@shared/ui'

import { ErrorMessage, Input, Or, Prompt, SocialAuthButton, Title } from '../components/ui'
import styles from './register.module.css'

interface RegisterFormInputs {
  email: string
}

export const Register: FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | undefined>()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormInputs>()

  useEffect(() => {
    if (errors.email) {
      setError(errors.email.message)
    } else {
      setError(undefined)
    }
  }, [errors.email])

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    console.log('Form data:', data)
    localStorage.setItem('register-email', data.email)
    await navigate('/register/verification')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Title text='Create account' />

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

          <PrimaryButton type='submit' text='Next' className={styles.button} />
        </form>

        <Or />
        <SocialAuthButton social='Google' />
      </div>

      <Prompt question='Already have an account?' answer='Log in' link='login' />
    </div>
  )
}
