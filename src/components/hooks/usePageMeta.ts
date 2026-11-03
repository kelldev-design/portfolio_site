import { useEffect } from 'react'
import { SITE_ORIGIN } from '../../utils/constants/site'

interface PageMetaOptions {
  title: string
  description?: string
  canonicalPath?: string
  image?: string
  noindex?: boolean
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown>
}

const JSON_LD_SELECTOR = 'script[type="application/ld+json"][data-page-json-ld]'

const upsertMeta = (
  selectorAttr: 'name' | 'property',
  name: string,
  content: string | undefined
): void => {
  const selector = `meta[${selectorAttr}="${name}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (content === undefined) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(
      selectorAttr,
      name
    )
    document.head.appendChild(element)
  }

  element.setAttribute(
    'content',
    content
  )
}

const upsertCanonical = (href: string | undefined): void => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (href === undefined) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('link')
    element.setAttribute(
      'rel',
      'canonical'
    )
    document.head.appendChild(element)
  }

  element.setAttribute(
    'href',
    href
  )
}

export const usePageMeta = ({
  title,
  description,
  canonicalPath,
  image,
  noindex = false,
  type = 'website',
  jsonLd
}: PageMetaOptions): void => {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : undefined

  useEffect(
    () => {
      const url = canonicalPath === undefined ? undefined : `${SITE_ORIGIN}${canonicalPath}`

      document.title = title
      upsertMeta(
        'name',
        'description',
        description
      )
      upsertCanonical(url)
      upsertMeta(
        'property',
        'og:title',
        title
      )
      upsertMeta(
        'property',
        'og:description',
        description
      )
      upsertMeta(
        'property',
        'og:url',
        url
      )
      upsertMeta(
        'property',
        'og:image',
        image
      )
      upsertMeta(
        'property',
        'og:type',
        type
      )
      upsertMeta(
        'name',
        'twitter:title',
        title
      )
      upsertMeta(
        'name',
        'twitter:description',
        description
      )
      upsertMeta(
        'name',
        'twitter:image',
        image
      )
      upsertMeta(
        'name',
        'robots',
        noindex ? 'noindex, nofollow' : undefined
      )
    },
    [
      title,
      description,
      canonicalPath,
      image,
      noindex,
      type
    ]
  )

  useEffect(
    () => {
      if (jsonLdString === undefined) return undefined

      const script = document.createElement('script')

      script.type = 'application/ld+json'
      script.setAttribute(
        'data-page-json-ld',
        ''
      )
      script.textContent = jsonLdString
      document.head.appendChild(script)

      return () => {
        document.head.querySelector(JSON_LD_SELECTOR)?.remove()
      }
    },
    [ jsonLdString ]
  )
}
