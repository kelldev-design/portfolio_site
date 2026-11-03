import React, { type FunctionComponent, Suspense } from 'react'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'
import { usePageMeta } from '../components/hooks/usePageMeta'

const MarketsContent = React.lazy(async () => await import('../components/page-content/markets-content/MarketsContent'))

export const Markets: FunctionComponent = () => {
  usePageMeta({
    title: 'Markets | Kelldev.Design',
    noindex: true
  })

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <MarketsContent />
    </Suspense>
  )
}
