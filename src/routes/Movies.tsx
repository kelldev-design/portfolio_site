import React, { type FunctionComponent, Suspense } from 'react'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'

const MoviesContent = React.lazy(async () => await import('../components/page-content/movies-content/MoviesContent'))

export const Movies: FunctionComponent = () =>
  <Suspense fallback={<LoadingOverlay />}>
    <MoviesContent />
  </Suspense>
