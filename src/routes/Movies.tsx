import React, { type FunctionComponent, Suspense } from 'react'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'
import { usePageMeta } from '../components/hooks/usePageMeta'

const MoviesContent = React.lazy(async () => await import('../components/page-content/movies-content/MoviesContent'))

export const Movies: FunctionComponent = () => {
  usePageMeta({
    title: 'Movies | Kelldev.Design',
    noindex: true
  })

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <MoviesContent />
    </Suspense>
  )
}
