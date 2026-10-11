import {
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
  useContext,
  useState
} from 'react'
import { useMutation } from '@apollo/client'
import styled from 'styled-components'
import { AdminContentStyles } from './AdminContentStyles'
import { PortfolioItemForm } from './PortfolioItemForm'
import {
  DragHandle,
  SortableItem,
  SortableList
} from './SortableList'
import {
  GET_PORTFOLIO_ITEMS,
  REORDER_PORTFOLIO_ITEMS
} from '../../../queries/graphQL'
import { type ReorderPortfolioItemsResponse } from '../../../types/generatedGQLTypes'
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

interface ReorderMutationDataType {
  reorderPortfolioItems: ReorderPortfolioItemsResponse
}

const AdminContent: FunctionComponent = () => {
  const { isNavigating, projectIds, portfolioMap } = useContext(PortfolioContext)

  // The projectId of the item being edited, or '' while creating a new one.
  const [ selectedProjectId, setSelectedProjectId ] = useState('')
  const selectedItem = selectedProjectId ? portfolioMap[selectedProjectId] : undefined

  // The order just dropped, shown until the refetched list arrives in that order, so the
  // list does not jump back while the save is in flight. Cleared if the save fails.
  const [ pendingOrder, setPendingOrder ] = useState<string[] | null>(null)
  const [ orderError, setOrderError ] = useState('')
  const orderedProjectIds = pendingOrder ?? projectIds

  const [ reorderPortfolioItems ] = useMutation<ReorderMutationDataType>(
    REORDER_PORTFOLIO_ITEMS,
    {
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_PORTFOLIO_ITEMS }]
    }
  )

  const handleReorder = (newOrder: string[]): void => {
    setPendingOrder(newOrder)
    setOrderError('')

    void reorderPortfolioItems({ variables: { ids: newOrder.map(projectId => portfolioMap[projectId].id) } })
      .then(({ data }) => {
        const response = data?.reorderPortfolioItems

        if (!response?.success) setOrderError(response?.message ?? 'The new order could not be saved.')
      })
      .catch((error: Error) => { setOrderError(error.message) })
      .finally(() => { setPendingOrder(null) })
  }

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

  const renderProjectRow = (projectId: string): ReactElement => {
    const projectItem = portfolioMap[projectId]
    const isSelected = projectId === selectedProjectId

    return (
      <SortableItem
        id={projectId}
        key={projectId}
      >
        { handleProps =>
          <div className={`admin-project-row ${isSelected ? 'is-selected' : ''}`}>
            <DragHandle
              handleProps={handleProps}
              label={`Reorder ${projectItem.name}`}
            />
            <button
              aria-current={isSelected}
              className='admin-project'
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
          </div> }
      </SortableItem>
    )
  }

  const renderProjects = (): ReactElement =>
    <>
      <div className={`admin-project-row ${!selectedItem ? 'is-selected' : ''}`}>
        <button
          aria-current={!selectedItem}
          className='admin-project admin-project-new'
          onClick={() => { setSelectedProjectId('') }}
          type='button'
        >
          + New project
        </button>
      </div>
      <div className='admin-project-hint'>Drag ⠿ to reorder. The site shows projects in this order.</div>
      { orderError && <div className='admin-order-error'>{ orderError }</div> }
      <div className='admin-project-list'>
        <SortableList
          ids={orderedProjectIds}
          onReorder={handleReorder}
        >
          { orderedProjectIds.map(renderProjectRow) }
        </SortableList>
      </div>
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
