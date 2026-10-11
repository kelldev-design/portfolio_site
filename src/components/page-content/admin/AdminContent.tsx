import {
  type FunctionComponent,
  type ReactElement,
  useContext
} from 'react'
import styled from 'styled-components'
import { AdminContentStyles } from './AdminContentStyles'
import { CreatePortfolioItemForm } from './CreatePortfolioItemForm'
import { Image } from '../../common/image/Image'
import { TagH } from '../../common/tag-h/TagH'
import { TagLi } from '../../common/tag-li/TagLi'
import { TagUl } from '../../common/tag-ul/TagUl'
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

  const renderProjectListItem = (projectId: string): ReactElement => {
    const projectItem = portfolioMap[projectId]

    return (
      <TagLi key={projectId}>
        <Spacer l={0}>
          <FlexWrapper>
            <div>
              <Spacer
                b={0}
                l={0}
                r={1}
                t={0}
              >
                <Image
                  altText={projectItem.name}
                  src={projectItem.primaryImage.imageUrl}
                  width='40px'
                />
              </Spacer>
            </div>
            <div>
              { projectItem.name }
            </div>
          </FlexWrapper>
        </Spacer>
      </TagLi>
    )
  }

  const renderCreateForm = (): ReactElement =>
    <Pure>
      <PureUnit
        isFlex
        pureClass='u-1'
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
                  Create
                </TagH>
              </Spacer>
              <CreatePortfolioItemForm />
            </Spacer>
          </FlexWrapper>
        </Spacer>
      </PureUnit>
    </Pure>

  const renderProjects = (): ReactElement =>
    <Pure>
      <PureUnit
        isFlex
        pureClass='u-1'
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
                  Projects
                </TagH>
              </Spacer>
              <div>
                <div>
                  <TagUl>
                    <>
                      { projectIds.map(renderProjectListItem) }
                    </>
                  </TagUl>
                </div>
              </div>
            </Spacer>
          </FlexWrapper>
        </Spacer>
      </PureUnit>
    </Pure>

  return (
    <PageRow>
      <Container>
        <AdminContentStyled className={`fade-in ${isNavigating ? 'fade-out' : ''}`}>
          <Spacer
            l={1.75}
            r={1.75}
            t={0}
          >
            { renderProjects() }
            { renderCreateForm() }
          </Spacer>
        </AdminContentStyled>
      </Container>
    </PageRow>
  )
}

export default AdminContent
