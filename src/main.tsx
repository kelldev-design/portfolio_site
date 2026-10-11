import React from 'react'
import {
  ApolloClient,
  ApolloProvider,
  from,
  HttpLink,
  InMemoryCache,
  type NormalizedCacheObject
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import ReactDOM from 'react-dom/client'
// import ReactGA from 'react-ga4'
import { App } from './App.tsx'
import './index.css'
import {
  clearAuthToken,
  getAuthToken
} from './utils/auth.ts'
import { PORTFOIO_API_URL } from './utils/constants/environment.ts'

// ReactGA.initialize('G-DNVN8G3N5Q')

const httpLink = new HttpLink({ uri: PORTFOIO_API_URL })

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken()

  if (!token) return { headers }

  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`
    }
  }
})

const errorLink = onError(({ graphQLErrors }) => {
  if (!graphQLErrors) return

  const isUnauthenticated = graphQLErrors.some(({ extensions }) => extensions?.code === 'UNAUTHENTICATED')

  if (!isUnauthenticated) return

  clearAuthToken()

  if (window.location.pathname !== '/login') window.location.assign('/login')
})

const apolloCLient = new ApolloClient<NormalizedCacheObject>({
  cache: new InMemoryCache(),
  link: from([
    errorLink,
    authLink,
    httpLink
  ])
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApolloProvider client={apolloCLient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
