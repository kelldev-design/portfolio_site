import React from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider, type NormalizedCacheObject } from '@apollo/client'
import ReactDOM from 'react-dom/client'
// import ReactGA from 'react-ga4'
import { App } from './App.tsx'
import './index.css'
import { PORTFOIO_API_URL } from './utils/constants/environment.ts'

// ReactGA.initialize('G-DNVN8G3N5Q')

const apolloCLient = new ApolloClient<NormalizedCacheObject>({
  uri: PORTFOIO_API_URL,
  cache: new InMemoryCache()
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApolloProvider client={apolloCLient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
