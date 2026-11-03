import { type FunctionComponent } from 'react'
import styled from 'styled-components'
import { ProjectImageStyles } from './ProjectImageStyles'
import { deriveAspectRatioFromImageUrl } from '../../../utils/helpers'
import { Spacer } from '../../layout/spacer/Spacer'
import { Image } from '../image/Image'
import { LoadingContent } from '../loading-content/LoadingContent'

const ProjectImageStyled = styled.div`${ProjectImageStyles}`

interface ProjectImagePropsType {
  imageUrl: string
  altText: string
  isEager?: boolean
  isLoaded: boolean
  isNavigating: boolean
}

export const ProjectImage: FunctionComponent<ProjectImagePropsType> = ({
  altText,
  imageUrl,
  isEager,
  isLoaded,
  isNavigating
}) => {
  const aspectRatio = deriveAspectRatioFromImageUrl(imageUrl)

  return (
    <ProjectImageStyled aspectRatio={aspectRatio}>
      <Spacer
        b={2.5}
        l={0}
        r={0}
        t={0}
      >
        <div className={`shadow fade-in relative-wrapper ${isNavigating ? 'fade-out' : ''}`}>
          <div className={`image-wrapper ${isLoaded ? 'fade-in' : ''}`}>
            <Image
              altText={altText}
              aspectRatio={aspectRatio ?? undefined}
              isEager={isEager}
              src={imageUrl}
            />
          </div>
          { !isLoaded && <LoadingContent /> }
        </div>
      </Spacer>
    </ProjectImageStyled>
  )
}
