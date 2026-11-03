import {
  type FunctionComponent,
  type ReactElement,
  useContext
} from 'react'
import styled from 'styled-components'
import { ProjectContentStyles } from './ProjectContentStyles'
import { ProjectDescription } from '../../common/project-description/ProjectDescription'
import { ProjectImage } from '../../common/project-image/ProjectImage'
import { Container } from '../../layout/container/Container'
import { PageRow } from '../../layout/page-row/PageRow'
import { Pure } from '../../layout/pure/Pure'
import { PureUnit } from '../../layout/pure-unit/PureUnit'
import { Spacer } from '../../layout/spacer/Spacer'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'

const ProjectContentStyled = styled.div`${ProjectContentStyles}`

interface ProjectContentProps {
  projectId: string
}

const ProjectContent: FunctionComponent<ProjectContentProps> = ({ projectId }) => {
  const {
    portfolioMap,
    isNavigating,
    projectImagesPreloaded
  } = useContext(PortfolioContext)

  const portfolioItem = portfolioMap[projectId]

  const {
    description,
    projectImages,
    name,
    primaryImage,
    products,
    productLinks,
    githubLinks,
    year
  } = portfolioItem

  const renderColumnView = (): ReactElement => {
    const column1 = [
      renderProjectImage(
        `${name} primary image`,
        primaryImage.imageUrl
      )
    ]

    const column2 = [
      <div
        className='column-description'
        key={`${name} description`}
      >
        { renderProjectDescription() }
      </div>
    ]

    projectImages.forEach((
      { imageUrl },
      index
    ) => {
      if (index % 2 === 0) {
        column2.push(
          renderProjectImage(
            `${name} image ${index}`,
            imageUrl
          )
        )
      } else {
        column1.push(
          renderProjectImage(
            `${name} image ${index}`,
            imageUrl
          )
        )
      }
    })

    return (
      <div className='columns-wrapper'>
        <div className='block-description'>
          <Spacer
            b={0}
            l={3}
            r={3}
            t={0}
          >
            { renderProjectDescription() }
          </Spacer>
        </div>
        {
          [ ...projectImages, primaryImage ].length < 2
            ? renderSingleImageContent(
              column1,
              column2
            )
            : renderPureColumns(
              column1,
              column2
            )
        }
      </div>
    )
  }

  const renderProjectDescription = (): ReactElement =>
    <ProjectDescription
      description={description}
      githubLinks={githubLinks ?? []}
      isNavigating={isNavigating}
      name={name}
      productLinks={productLinks ?? []}
      products={products.map(product => product.name)}
      year={year}
    />

  const renderProjectImage = (
    altText: string,
    imageUrl: string
  ): ReactElement =>
    <ProjectImage
      altText={altText}
      imageUrl={imageUrl}
      isLoaded={projectImagesPreloaded[imageUrl]}
      isNavigating={isNavigating}
      key={imageUrl}
    />

  const renderPureColumns = (
    column1: ReactElement[],
    column2: ReactElement[]
  ): ReactElement =>
    <Pure>
      <PureUnit pureClass='u-sm-1-2'>
        <Spacer
          l={3}
          r={1.25}
          t={0}
        >
          { column1 }
        </Spacer>
      </PureUnit>
      <PureUnit pureClass='u-sm-1-2'>
        <Spacer
          l={1.25}
          r={3}
          t={0}
        >
          { column2 }
        </Spacer>
      </PureUnit>
    </Pure>

  const renderSingleImageContent = (
    column1: ReactElement[],
    column2: ReactElement[]
  ): ReactElement =>
    <>
      <div className='single-image-tablet-columns'>
        <Spacer
          l={3}
          r={3}
          t={0}
        >
          { column1 }
        </Spacer>
      </div>
      <div className='single-image-desktop-columns'>
        {
          renderPureColumns(
            column1,
            column2
          )
        }
      </div>
    </>

  const renderListView = (): ReactElement =>
    <div className='list-wrapper'>
      <Spacer
        l={3}
        r={3}
        t={0}
      >
        { renderProjectDescription() }
        {
          renderProjectImage(
            `${name} primary image`,
            primaryImage.imageUrl
          )
        }
        {
          projectImages.map((
            { imageUrl },
            index
          ) => (
            renderProjectImage(
              `${name} image ${index}`,
              imageUrl
            )
          ))
        }
      </Spacer>
    </div>

  return (
    <PageRow>
      <Container>
        <ProjectContentStyled>
          { renderColumnView() }
          { renderListView() }
        </ProjectContentStyled>
      </Container>
    </PageRow>
  )
}

export default ProjectContent
