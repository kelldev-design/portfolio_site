import {
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
  useContext,
  useState
} from 'react'
import styled from 'styled-components'
import { AdminContentStyles } from './AdminContentStyles'
import { PortfolioItemForm } from './PortfolioItemForm'
import { Image } from '../../common/image/Image'
import { TagH } from '../../common/tag-h/TagH'
import { Container } from '../../layout/container/Container'
import { FlexWrapper } from '../../layout/flex-wrapper/FlexWrapper'
import { PageRow } from '../../layout/page-row/PageRow'
import { Pure } from '../../layout/pure/Pure'
import { PureUnit } from '../../layout/pure-unit/PureUnit'
import { Spacer } from '../../layout/spacer/Spacer'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'

const AdminContentStyled = styled.div`${AdminContentStyles}`

const AdminContent: FunctionComponent = () => {
  const { isNavigating, projectIds, portfolioMap } = useContext(PortfolioContext)

  // The projectId of the item being edited, or '' while creating a new one.
  const [ selectedProjectId, setSelectedProjectId ] = useState('')
  const selectedItem = selectedProjectId ? portfolioMap[selectedProjectId] : undefined

  const renderPanel = (
    pureClass: string,
    title: string,
    children: ReactNode
  ): ReactElement =>
    <PureUnit
      isFlex
      pureClass={pureClass}
    >
      <Spacer
        b={2.5}
        isFlex
        l={1.25}
        r={1.25}
        t={0}
      >
        <FlexWrapper
          backgroundColor='#fff'
          hasShadow
        >
          <Spacer
            b={2.5}
            l={2.5}
            r={2.5}
            t={2.5}
          >
            <Spacer
              b={2}
              l={0}
              r={0}
              t={0}
            >
              <TagH size={2}>
                { title }
              </TagH>
            </Spacer>
            { children }
          </Spacer>
        </FlexWrapper>
      </Spacer>
    </PureUnit>

  const renderProjectButton = (projectId: string): ReactElement => {
    const projectItem = portfolioMap[projectId]
    const isSelected = projectId === selectedProjectId

    return (
      <li key={projectId}>
        <button
          aria-current={isSelected}
          className={`admin-project ${isSelected ? 'is-selected' : ''}`}
          onClick={() => { setSelectedProjectId(projectId) }}
          type='button'
        >
          <Image
            altText={projectItem.name}
            src={projectItem.primaryImage.imageUrl}
            width='40px'
          />
          <span>{ projectItem.name }</span>
        </button>
      </li>
    )
  }

  const renderProjects = (): ReactElement =>
    <>
      <button
        aria-current={!selectedItem}
        className={`admin-project admin-project-new ${!selectedItem ? 'is-selected' : ''}`}
        onClick={() => { setSelectedProjectId('') }}
        type='button'
      >
        + New project
      </button>
      <ul className='admin-project-list'>
        { projectIds.map(renderProjectButton) }
      </ul>
    </>

  return (
    <PageRow>
      <Container>
        <AdminContentStyled className={`fade-in ${isNavigating ? 'fade-out' : ''}`}>
          <Spacer
            l={1.75}
            r={1.75}
            t={0}
          >
            <Pure>
              { renderPanel(
                'u-1 u-md-1-3',
                'Projects',
                renderProjects()
              ) }
              { renderPanel(
                'u-1 u-md-2-3',
                selectedItem ? `Edit ${selectedItem.name}` : 'Create',
                // Keyed by the item's database id, so selecting another item starts a fresh
                // form, while saving a changed projectId keeps this one and its message.
                <PortfolioItemForm
                  key={selectedItem?.id ?? 'new'}
                  onSaved={setSelectedProjectId}
                  portfolioItem={selectedItem}
                />
              ) }
            </Pure>
          </Spacer>
        </AdminContentStyled>
      </Container>
    </PageRow>
  )
}

export default AdminContent
