import {
  type ChangeEventHandler,
  type FormEventHandler,
  type FunctionComponent,
  type ReactElement,
  useContext,
  useState
} from 'react'
import { useMutation } from '@apollo/client'
import styled from 'styled-components'
import { PortfolioItemFormStyles } from './PortfolioItemFormStyles'
import {
  DragHandle,
  SortableItem,
  SortableList
} from './SortableList'
import {
  CREATE_PORTFOLIO_ITEMS,
  GET_PORTFOLIO_ITEMS,
  UPDATE_PORTFOLIO_ITEM
} from '../../../queries/graphQL'
import { type PortfolioContextValueType } from '../../../types/contextTypes'
import {
  type CreatePortfolioItemInput,
  type CreatePortfolioItemResponse,
  type PortfolioItem,
  type UpdatePortfolioItemResponse
} from '../../../types/generatedGQLTypes'
import { ButtonCustom } from '../../common/button-custom/ButtonCustom'
import { CheckboxCustom } from '../../common/checkbox-custom/CheckboxCustom'
import { Image } from '../../common/image/Image'
import { InputCustom } from '../../common/input-custom/InputCustom'
import { LinkCustom } from '../../common/link-custom/LinkCustom'
import { Spacer } from '../../layout/spacer/Spacer'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'

const PortfolioItemFormStyled = styled.div`${PortfolioItemFormStyles}`

interface LinkRowType {
  isInternal: boolean
  label: string
  url: string
}

/** A gallery image row. `key` stays with the row as it is dragged, unlike its index. */
interface ImageRowType {
  key: string
  url: string
}

interface FormStateType {
  categories: string[]
  description: string
  githubLinks: LinkRowType[]
  homeImage: string
  name: string
  primaryImage: string
  productLinks: LinkRowType[]
  products: string[]
  projectId: string
  projectImages: ImageRowType[]
}

interface CreateMutationDataType {
  createPortfolioItem: CreatePortfolioItemResponse
}

interface UpdateMutationDataType {
  updatePortfolioItem: UpdatePortfolioItemResponse
}

interface PortfolioItemFormPropsType {
  /** The item to edit. Without one the form creates a new item. */
  portfolioItem?: PortfolioItem
  /** Called with the item's projectId after an edit is saved, which may have changed it. */
  onSaved?: (projectId: string) => void
}

type FormErrorsType = Record<string, string>

const CATEGORY_OPTIONS = [ 'design', 'development' ]
const PROJECT_ID_PATTERN = /^[a-zA-Z0-9-]+$/

const emptyLinkRow: LinkRowType = {
  isInternal: false,
  label: '',
  url: ''
}

const initialFormState: FormStateType = {
  categories: [],
  description: '',
  githubLinks: [],
  homeImage: '',
  name: '',
  primaryImage: '',
  productLinks: [],
  products: [],
  projectId: '',
  projectImages: []
}

const toLinkRows = (links: PortfolioItem['githubLinks']): LinkRowType[] =>
  (links ?? []).map(({ isInternal, label, url }) => ({
    isInternal,
    label,
    url
  }))

const toFormState = (portfolioItem: PortfolioItem): FormStateType => ({
  categories: portfolioItem.categories.map(({ name }) => name),
  description: portfolioItem.description,
  githubLinks: toLinkRows(portfolioItem.githubLinks),
  homeImage: portfolioItem.homeImage.imageUrl,
  name: portfolioItem.name,
  primaryImage: portfolioItem.primaryImage.imageUrl,
  productLinks: toLinkRows(portfolioItem.productLinks),
  products: portfolioItem.products.map(({ name }) => name),
  projectId: portfolioItem.projectId,
  projectImages: portfolioItem.projectImages.map(({ imageUrl }) => newImageRow(imageUrl))
})

let nextImageRowKey = 0

const newImageRow = (url = ''): ImageRowType => ({
  key: `image-${nextImageRowKey++}`,
  url
})

const isAbsoluteUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value)

    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export const PortfolioItemForm: FunctionComponent<PortfolioItemFormPropsType> = ({
  onSaved,
  portfolioItem
}) => {
  const {
    portfolioMap,
    projectIds
  } = useContext(PortfolioContext) as PortfolioContextValueType

  const [ errors, setErrors ] = useState<FormErrorsType>({})
  const [ formState, setFormState ] = useState<FormStateType>(() => portfolioItem ? toFormState(portfolioItem) : initialFormState)
  const [ submitError, setSubmitError ] = useState('')
  const [ savedProjectId, setSavedProjectId ] = useState('')
  const isEditing = !!portfolioItem

  const [ createPortfolioItem, { loading: isCreating }] = useMutation<CreateMutationDataType>(
    CREATE_PORTFOLIO_ITEMS,
    { refetchQueries: [{ query: GET_PORTFOLIO_ITEMS }] }
  )

  // Awaited so the list has the saved values, including a changed projectId, before
  // onSaved selects the item by it.
  const [ updatePortfolioItem, { loading: isUpdating }] = useMutation<UpdateMutationDataType>(
    UPDATE_PORTFOLIO_ITEM,
    {
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_PORTFOLIO_ITEMS }]
    }
  )

  const loading = isCreating || isUpdating

  const setField = (
    field: keyof FormStateType,
    value: FormStateType[keyof FormStateType]
  ): void => {
    setFormState(prevState => ({ ...prevState, [field]: value }))
  }

  const handleTextChange = (
    field: 'description' | 'homeImage' | 'name' | 'primaryImage' | 'projectId'
  ): ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    event => {
      setField(
        field,
        event.target.value
      )
    }

  const handleCategoryChange = (category: string): ChangeEventHandler<HTMLInputElement> =>
    event => {
      const { categories } = formState

      setField(
        'categories',
        event.target.checked
          ? [ ...categories, category ]
          : categories.filter(value => value !== category)
      )
    }

  const handleStringRowChange = (
    field: 'products',
    index: number
  ): ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    event => {
      const rows = [ ...formState[field] ]

      rows[index] = event.target.value

      setField(
        field,
        rows
      )
    }

  const handleStringRowAdd = (field: 'products') =>
    (): void => {
      setField(
        field,
        [ ...formState[field], '' ]
      )
    }

  const handleStringRowRemove = (
    field: 'products',
    index: number
  ) =>
    (): void => {
      setField(
        field,
        formState[field].filter((_, rowIndex) => rowIndex !== index)
      )
    }

  const handleImageRowChange = (key: string): ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    event => {
      setField(
        'projectImages',
        formState.projectImages.map(row => row.key === key ? { ...row, url: event.target.value } : row)
      )
    }

  const handleImageRowAdd = (): void => {
    setField(
      'projectImages',
      [ ...formState.projectImages, newImageRow() ]
    )
  }

  const handleImageRowRemove = (key: string) =>
    (): void => {
      setField(
        'projectImages',
        formState.projectImages.filter(row => row.key !== key)
      )
    }

  const handleImageReorder = (keys: string[]): void => {
    setField(
      'projectImages',
      keys.map(key => formState.projectImages.find(row => row.key === key) as ImageRowType)
    )
  }

  const handleLinkRowChange = (
    field: 'githubLinks' | 'productLinks',
    index: number,
    key: keyof LinkRowType
  ): ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    event => {
      const rows = [ ...formState[field] ]
      const value = key === 'isInternal'
        ? (event.target as HTMLInputElement).checked
        : event.target.value

      rows[index] = { ...rows[index], [key]: value }

      setField(
        field,
        rows
      )
    }

  const handleLinkRowAdd = (field: 'githubLinks' | 'productLinks') =>
    (): void => {
      setField(
        field,
        [ ...formState[field], { ...emptyLinkRow }]
      )
    }

  const handleLinkRowRemove = (
    field: 'githubLinks' | 'productLinks',
    index: number
  ) =>
    (): void => {
      setField(
        field,
        formState[field].filter((_, rowIndex) => rowIndex !== index)
      )
    }

  const buildInput = (): CreatePortfolioItemInput => {
    const cleanLinks = (rows: LinkRowType[]): LinkRowType[] =>
      rows
        .map(({ isInternal, label, url }) => ({
          isInternal,
          label: label.trim(),
          url: url.trim()
        }))
        .filter(({ label, url }) => label !== '' || url !== '')

    return {
      categories: formState.categories,
      description: formState.description.trim(),
      githubLinks: cleanLinks(formState.githubLinks).map(({ label, url }) => ({
        isInternal: false,
        label,
        url
      })),
      homeImage: formState.homeImage.trim(),
      name: formState.name.trim(),
      primaryImage: formState.primaryImage.trim(),
      productLinks: cleanLinks(formState.productLinks),
      products: formState.products.map(product => product.trim()).filter(product => product !== ''),
      projectId: formState.projectId.trim(),
      projectImages: formState.projectImages.map(({ url }) => url.trim()).filter(imageUrl => imageUrl !== '')
    }
  }

  const validateLinks = (
    field: 'githubLinks' | 'productLinks',
    links: CreatePortfolioItemInput['githubLinks'],
    formErrors: FormErrorsType
  ): void => {
    links.forEach((
      { isInternal, label, url },
      index
    ) => {
      if (label === '') formErrors[`${field}-${index}-label`] = 'A label is required.'

      if (isInternal) {
        if (!url.startsWith('/')) formErrors[`${field}-${index}-url`] = 'An internal link must start with "/".'
      } else if (!isAbsoluteUrl(url)) {
        formErrors[`${field}-${index}-url`] = 'Enter a full url starting with http:// or https://.'
      }
    })
  }

  const validate = (input: CreatePortfolioItemInput): FormErrorsType => {
    const formErrors: FormErrorsType = {}
    // The item being edited is allowed to keep its own name and projectId.
    const nameExists = projectIds.some(projectId =>
      projectId !== portfolioItem?.projectId && portfolioMap[projectId].name === input.name)

    if (input.name === '') formErrors.name = 'A name is required.'
    else if (nameExists) formErrors.name = 'A project with this name already exists.'

    if (input.projectId === '') formErrors.projectId = 'A project id is required.'
    else if (!PROJECT_ID_PATTERN.test(input.projectId)) formErrors.projectId = 'Only letters, numbers and hyphens are allowed.'
    else if (portfolioMap[input.projectId] && input.projectId !== portfolioItem?.projectId) formErrors.projectId = 'A project with this project id already exists.'

    if (input.description === '') formErrors.description = 'A description is required.'
    if (input.categories.length === 0) formErrors.categories = 'Select at least one category.'

    if (input.homeImage === '') formErrors.homeImage = 'A home image url is required.'
    else if (!isAbsoluteUrl(input.homeImage)) formErrors.homeImage = 'Enter a full url starting with http:// or https://.'

    if (input.primaryImage === '') formErrors.primaryImage = 'A primary image url is required.'
    else if (!isAbsoluteUrl(input.primaryImage)) formErrors.primaryImage = 'Enter a full url starting with http:// or https://.'

    // Keyed by row rather than index, so an error stays on its row if the rows are dragged.
    const seenImageUrls = new Set<string>()

    formState.projectImages.forEach(({ key, url }) => {
      const imageUrl = url.trim()

      if (imageUrl === '') return

      if (!isAbsoluteUrl(imageUrl)) formErrors[`projectImages-${key}`] = 'Enter a full url starting with http:// or https://.'
      else if (seenImageUrls.has(imageUrl)) formErrors[`projectImages-${key}`] = 'This image is already in the gallery.'

      seenImageUrls.add(imageUrl)
    })

    validateLinks(
      'githubLinks',
      input.githubLinks,
      formErrors
    )

    validateLinks(
      'productLinks',
      input.productLinks,
      formErrors
    )

    return formErrors
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault()

    if (loading) return

    const input = buildInput()
    const formErrors = validate(input)

    setSavedProjectId('')
    setSubmitError('')
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) return

    if (portfolioItem) {
      void updatePortfolioItem({
        variables: {
          id: portfolioItem.id,
          input
        }
      })
        .then(({ data }) => {
          const response = data?.updatePortfolioItem

          if (!response?.success) {
            setSubmitError(response?.message ?? 'The project could not be saved.')

            return
          }

          setSavedProjectId(input.projectId)
          onSaved?.(input.projectId)
        })
        .catch((error: Error) => { setSubmitError(error.message) })

      return
    }

    void createPortfolioItem({ variables: { input } })
      .then(({ data }) => {
        const response = data?.createPortfolioItem

        if (!response?.success) {
          setSubmitError(response?.message ?? 'The project could not be created.')

          return
        }

        setSavedProjectId(input.projectId)
        setFormState(initialFormState)
      })
      .catch((error: Error) => { setSubmitError(error.message) })
  }

  const renderImageRows = (): ReactElement =>
    <>
      <div className='form-field-label'>Project images</div>
      <div className='form-hint'>Shown on the project page in this order. Drag ⠿ to reorder.</div>
      <SortableList
        ids={formState.projectImages.map(({ key }) => key)}
        onReorder={handleImageReorder}
      >
        { formState.projectImages.map(({ key, url }, index) => (
          <SortableItem
            id={key}
            key={key}
          >
            { handleProps =>
              <Spacer
                b={0.5}
                l={0}
                r={0}
                t={0.5}
              >
                <div className='form-row form-row-centered'>
                  <div className='form-row-action'>
                    <DragHandle
                      handleProps={handleProps}
                      label={`Reorder project image ${index + 1}`}
                    />
                  </div>
                  <div className='form-row-thumbnail'>
                    { isAbsoluteUrl(url.trim()) &&
                      <Image
                        altText={`Project image ${index + 1}`}
                        src={url.trim()}
                        width='40px'
                      /> }
                  </div>
                  <div className='form-row-field'>
                    <InputCustom
                      error={errors[`projectImages-${key}`]}
                      id={`projectImages-${key}`}
                      isLabelHidden
                      label={`Project image ${index + 1}`}
                      onChange={handleImageRowChange(key)}
                      value={url}
                    />
                  </div>
                  <div className='form-row-action'>
                    <ButtonCustom
                      onClick={handleImageRowRemove(key)}
                      title={`Remove project image ${index + 1}`}
                    >
                      Remove
                    </ButtonCustom>
                  </div>
                </div>
              </Spacer> }
          </SortableItem>
        )) }
      </SortableList>
      <Spacer
        b={0}
        l={0}
        r={0}
        t={0.5}
      >
        <div className='form-add-action'>
          <ButtonCustom
            onClick={handleImageRowAdd}
            title='Add project image'
          >
            Add project image
          </ButtonCustom>
        </div>
      </Spacer>
    </>

  const renderStringRows = (
    field: 'products',
    label: string,
    addLabel: string
  ): ReactElement =>
    <>
      <div className='form-field-label'>{ label }</div>
      { formState[field].map((
        value,
        index
      ) => (
        <Spacer
          b={1}
          key={`${field}-${index}`}
          l={0}
          r={0}
          t={0.5}
        >
          <div className='form-row'>
            <div className='form-row-field'>
              <InputCustom
                error={errors[`${field}-${index}`]}
                id={`${field}-${index}`}
                isLabelHidden
                label={`${label} ${index + 1}`}
                onChange={handleStringRowChange(
                  field,
                  index
                )}
                value={value}
              />
            </div>
            <div className='form-row-action'>
              <ButtonCustom
                onClick={handleStringRowRemove(
                  field,
                  index
                )}
                title={`Remove ${label} ${index + 1}`}
              >
                Remove
              </ButtonCustom>
            </div>
          </div>
        </Spacer>
      )) }
      <div className='form-add-action'>
        <ButtonCustom
          onClick={handleStringRowAdd(field)}
          title={addLabel}
        >
          { addLabel }
        </ButtonCustom>
      </div>
    </>

  const renderLinkRows = (
    field: 'githubLinks' | 'productLinks',
    label: string,
    addLabel: string
  ): ReactElement =>
    <>
      <div className='form-field-label'>{ label }</div>
      { formState[field].map((
        link,
        index
      ) => (
        <Spacer
          b={1}
          key={`${field}-${index}`}
          l={0}
          r={0}
          t={0.5}
        >
          <div className='form-row'>
            <div className='form-row-field'>
              <InputCustom
                error={errors[`${field}-${index}-label`]}
                id={`${field}-${index}-label`}
                isLabelHidden={index > 0}
                label='Label'
                onChange={handleLinkRowChange(
                  field,
                  index,
                  'label'
                )}
                value={link.label}
              />
            </div>
            <div className='form-row-field'>
              <InputCustom
                error={errors[`${field}-${index}-url`]}
                id={`${field}-${index}-url`}
                isLabelHidden={index > 0}
                label='Url'
                onChange={handleLinkRowChange(
                  field,
                  index,
                  'url'
                )}
                value={link.url}
              />
            </div>
            {
              field === 'productLinks' &&
              <div className='form-row-action'>
                <CheckboxCustom
                  id={`${field}-${index}-isInternal`}
                  isChecked={link.isInternal}
                  label='Internal'
                  onChange={handleLinkRowChange(
                    field,
                    index,
                    'isInternal'
                  )}
                />
              </div>
            }
            <div className='form-row-action'>
              <ButtonCustom
                onClick={handleLinkRowRemove(
                  field,
                  index
                )}
                title={`Remove ${label} ${index + 1}`}
              >
                Remove
              </ButtonCustom>
            </div>
          </div>
        </Spacer>
      )) }
      <div className='form-add-action'>
        <ButtonCustom
          onClick={handleLinkRowAdd(field)}
          title={addLabel}
        >
          { addLabel }
        </ButtonCustom>
      </div>
    </>

  return (
    <PortfolioItemFormStyled>
      <form onSubmit={handleSubmit}>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          <InputCustom
            error={errors.name}
            id='portfolio-item-name'
            label='Name'
            onChange={handleTextChange('name')}
            value={formState.name}
          />
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          <InputCustom
            error={errors.projectId}
            id='portfolio-item-project-id'
            label='Project id'
            onChange={handleTextChange('projectId')}
            placeholder='letters, numbers and hyphens only'
            value={formState.projectId}
          />
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          <InputCustom
            error={errors.description}
            id='portfolio-item-description'
            label='Description'
            onChange={handleTextChange('description')}
            rows={12}
            value={formState.description}
          />
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          <div className='form-field-label'>Categories</div>
          <Spacer
            b={0}
            l={0}
            r={0}
            t={0.5}
          >
            <div className='form-checkbox-group'>
              { CATEGORY_OPTIONS.map(category => (
                <CheckboxCustom
                  id={`portfolio-item-category-${category}`}
                  isChecked={formState.categories.includes(category)}
                  key={category}
                  label={category}
                  onChange={handleCategoryChange(category)}
                />
              )) }
            </div>
          </Spacer>
          { errors.categories && <div className='form-error'>{ errors.categories }</div> }
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          { renderStringRows(
            'products',
            'Products',
            'Add product'
          ) }
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          <InputCustom
            error={errors.homeImage}
            id='portfolio-item-home-image'
            label='Home image url'
            onChange={handleTextChange('homeImage')}
            value={formState.homeImage}
          />
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          <InputCustom
            error={errors.primaryImage}
            id='portfolio-item-primary-image'
            label='Primary image url'
            onChange={handleTextChange('primaryImage')}
            value={formState.primaryImage}
          />
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          { renderImageRows() }
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          { renderLinkRows(
            'githubLinks',
            'Github links',
            'Add github link'
          ) }
        </Spacer>
        <Spacer
          b={1}
          l={0}
          r={0}
          t={0}
        >
          { renderLinkRows(
            'productLinks',
            'Product links',
            'Add product link'
          ) }
        </Spacer>
        { submitError && <div className='form-error'>{ submitError }</div> }
        {
          savedProjectId &&
          <div className='form-success'>
            <span>{ isEditing ? 'Changes saved. ' : 'Project created. ' }</span>
            <LinkCustom
              hasLinkStyling
              to={`/project/${savedProjectId}`}
            >
              { `View /project/${savedProjectId}` }
            </LinkCustom>
          </div>
        }
        <Spacer
          b={0}
          l={0}
          r={0}
          t={1}
        >
          <button
            className='form-submit'
            disabled={loading}
            type='submit'
          >
            { isEditing
              ? loading ? 'Saving…' : 'Save changes'
              : loading ? 'Creating…' : 'Create project' }
          </button>
        </Spacer>
      </form>
    </PortfolioItemFormStyled>
  )
}
