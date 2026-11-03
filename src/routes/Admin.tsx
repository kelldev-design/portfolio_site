import React, { type FunctionComponent, Suspense } from 'react'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'
import { usePageMeta } from '../components/hooks/usePageMeta'

const AdminContent = React.lazy(async () => await import('../components/page-content/admin/AdminContent'))

export const Admin: FunctionComponent = () => {
  usePageMeta({
    title: 'Admin | Kelldev.Design',
    noindex: true
  })

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <AdminContent />
    </Suspense>
  )
}
