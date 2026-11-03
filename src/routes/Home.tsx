import React, { type FunctionComponent, Suspense } from 'react'
import { useParams } from 'react-router'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'
import { usePageMeta } from '../components/hooks/usePageMeta'
import { kelldevDesignLogo } from '../utils/constants/imageLinksCdn'

const PortfolioGrid = React.lazy(async () => await import('../components/page-content/portfolio-grid/PortfolioGrid'))

type ParamsType = Record<'filter', 'design' | 'development' | undefined>

const META_BY_FILTER: Record<string, { title: string, description: string, canonicalPath: string }> = {
  all: {
    title: 'Kelldev.Design — Design & Development Portfolio',
    description: 'Portfolio of web development, apps, branding and print design by Coleman Kelleghan.',
    canonicalPath: '/'
  },
  design: {
    title: 'Design Portfolio | Kelldev.Design',
    description: 'Portfolio of branding, logo and print design by Coleman Kelleghan.',
    canonicalPath: '/design'
  },
  development: {
    title: 'Development Portfolio | Kelldev.Design',
    description: 'Portfolio of web development and app projects by Coleman Kelleghan.',
    canonicalPath: '/development'
  }
}

export const Home: FunctionComponent = () => {
  const { filter } = useParams<ParamsType>()
  const filterToLowerCase = filter?.toLowerCase()

  const meta = Object.prototype.hasOwnProperty.call(
    META_BY_FILTER,
    filterToLowerCase ?? 'all'
  )
    ? META_BY_FILTER[filterToLowerCase ?? 'all']
    : undefined

  usePageMeta({
    title: meta?.title ?? META_BY_FILTER.all.title,
    description: meta?.description ?? META_BY_FILTER.all.description,
    canonicalPath: meta?.canonicalPath,
    image: kelldevDesignLogo,
    noindex: !meta
  })

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <PortfolioGrid filter={filterToLowerCase} />
    </Suspense>
  )
}
