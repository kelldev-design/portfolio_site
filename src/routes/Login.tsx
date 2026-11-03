import React, { type FunctionComponent, Suspense } from 'react'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'
import { usePageMeta } from '../components/hooks/usePageMeta'

const LoginContent = React.lazy(async () => await import('../components/page-content/login-content/LoginContent'))

export const Login: FunctionComponent = () => {
  usePageMeta({
    title: 'Login | Kelldev.Design',
    noindex: true
  })

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <LoginContent />
    </Suspense>
  )
}
