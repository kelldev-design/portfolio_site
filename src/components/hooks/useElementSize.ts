import { type RefObject, useEffect, useState } from 'react'

interface ElementSizeType {
  width: number
  height: number
}

/* The rendered size of an element, kept current as it resizes. 0 by 0 until measured. */
export const useElementSize = (ref: RefObject<Element>): ElementSizeType => {
  const [ size, setSize ] = useState<ElementSizeType>({ height: 0, width: 0 })

  useEffect(
    () => {
      const element = ref.current

      if (!element) return

      const observer = new ResizeObserver(([ entry ]) => {
        setSize({ height: entry.contentRect.height, width: entry.contentRect.width })
      })

      observer.observe(element)

      return () => { observer.disconnect() }
    },
    [ ref ]
  )

  return size
}
