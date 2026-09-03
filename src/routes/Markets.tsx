import React, { type FunctionComponent, Suspense } from 'react'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'

const MarketsContent = React.lazy(async () => await import('../components/page-content/markets-content/MarketsContent'))

export const Markets: FunctionComponent = () =>
  <Suspense fallback={<LoadingOverlay />}>
    <MarketsContent />
  </Suspense>
