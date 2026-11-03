import { type FunctionComponent, type ReactEventHandler } from 'react'
import styled from 'styled-components'
import { ImageStyles } from './ImageStyles'

const ImageStyled = styled.img`${ImageStyles}`

interface ImageProps {
  src: string
  width?: string
  onLoad?: ReactEventHandler
  altText: string
  aspectRatio?: string
  isEager?: boolean
}

export const Image: FunctionComponent<ImageProps> = ({
  src,
  width = '100%',
  onLoad,
  altText,
  aspectRatio,
  isEager = false
}) => (
  <ImageStyled
    alt={altText}
    aspectRatio={aspectRatio}
    cssWidth={width}
    decoding='async'
    loading={isEager ? 'eager' : 'lazy'}
    onLoad={onLoad}
    src={src}
  />
)
