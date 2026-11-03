import React, { type FunctionComponent, Suspense } from 'react'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'
import { usePageMeta } from '../components/hooks/usePageMeta'
import { kelldevDesignLogo } from '../utils/constants/imageLinksCdn'

const ContactContent = React.lazy(async () => await import('../components/page-content/contact-content/ContactContent'))

export const Contact: FunctionComponent = () => {
  usePageMeta({
    title: 'Contact | Kelldev.Design',
    description: 'Get in touch with Coleman Kelleghan about websites, online storefronts, mobile apps, logos and print material.',
    canonicalPath: '/contact',
    image: kelldevDesignLogo
  })

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <ContactContent />
    </Suspense>
  )
}
