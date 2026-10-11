import {
  type ChangeEventHandler,
  type FormEventHandler,
  type ReactElement,
  useContext,
  useState
} from 'react'
import { useMutation } from '@apollo/client'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { LoginContentStyles } from './LoginContentStyles'
import { LOGIN } from '../../../queries/graphQL'
import { type PortfolioContextValueType } from '../../../types/contextTypes'
import { type AuthResponse } from '../../../types/generatedGQLTypes'
import { InputCustom } from '../../common/input-custom/InputCustom'
import { Container } from '../../layout/container/Container'
import { PageRow } from '../../layout/page-row/PageRow'
import { Spacer } from '../../layout/spacer/Spacer'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'

const LoginContentStyled = styled.div`${LoginContentStyles}`

interface LoginMutationDataType {
  login: AuthResponse
}

interface LocationStateType {
  from?: {
    pathname?: string
  }
}

const LoginContent = (): ReactElement => {
  const {
    handleLogin,
    isNavigating
  } = useContext(PortfolioContext) as PortfolioContextValueType

  const [ errorMessage, setErrorMessage ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ username, setUsername ] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const [ login, { loading }] = useMutation<LoginMutationDataType>(LOGIN)

  const handleUsernameChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = event => {
    setUsername(event.target.value)
  }

  const handlePasswordChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = event => {
    setPassword(event.target.value)
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault()

    if (loading) return

    setErrorMessage('')

    void login({
      variables: {
        password,
        username
      }
    })
      .then(({ data }) => {
        const authResponse = data?.login

        if (!authResponse?.success || !authResponse.token) {
          setErrorMessage(authResponse?.message ?? 'Unable to log in.')

          return
        }

        handleLogin(authResponse.token)

        const locationState = location.state as LocationStateType | null

        navigate(locationState?.from?.pathname ?? '/admin')
      })
      .catch((error: Error) => { setErrorMessage(error.message) })
  }

  const renderForm = (): ReactElement =>
    <Spacer
      l={1.75}
      r={1.75}
      t={0}
    >
      <form
        className='login-form'
        onSubmit={handleSubmit}
      >
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          <InputCustom
            autoComplete='username'
            id='login-username'
            label='Username'
            onChange={handleUsernameChange}
            value={username}
          />
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          <InputCustom
            autoComplete='current-password'
            id='login-password'
            label='Password'
            onChange={handlePasswordChange}
            type='password'
            value={password}
          />
        </Spacer>
        { errorMessage && <div className='login-error'>{ errorMessage }</div> }
        <Spacer
          b={0}
          l={0}
          r={0}
          t={1}
        >
          <button
            className='login-submit'
            disabled={loading}
            type='submit'
          >
            { loading ? 'Logging in…' : 'Login' }
          </button>
        </Spacer>
      </form>
    </Spacer>

  return (
    <PageRow>
      <Container>
        <LoginContentStyled className={`fade-in ${isNavigating ? 'fade-out' : ''}`}>
          { renderForm() }
        </LoginContentStyled>
      </Container>
    </PageRow>
  )
}

export default LoginContent
