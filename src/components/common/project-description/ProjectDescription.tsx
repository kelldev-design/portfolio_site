import { type FunctionComponent, type ReactElement } from 'react'
import styled from 'styled-components'
import { ProjectDescriptionStyles } from './ProjectDescriptionStyles'
import { type Link } from '../../../types/generatedGQLTypes'
import { splitParagraphs } from '../../../utils/helpers'
import { Spacer } from '../../layout/spacer/Spacer'
import { TagH } from '../tag-h/TagH'
import { TagP } from '../tag-p/TagP'
import { TileLink } from '../tile-link/TileLink'

const ProjectDescriptionStyled = styled.div`${ProjectDescriptionStyles}`

interface ProjectDescriptionProps {
  isNavigating: boolean
  name: string
  products: string[]
  description: string
  productLinks: Link[]
  githubLinks: Link[]
  year?: number | null
}

export const ProjectDescription: FunctionComponent<ProjectDescriptionProps> = ({
  description,
  isNavigating,
  name,
  products,
  productLinks,
  githubLinks,
  year
}) => {
  const renderLinks = (): ReactElement | null => {
    const linkItems = [
      ...(productLinks ?? []),
      ...(githubLinks ?? [])
    ]

    if (!linkItems.length) return null

    return (
      <Spacer
        b={0}
        l={0}
        r={0}
        t={2}
      >
        {
          linkItems.map((
            {
              url,
              label,
              isInternal = false
            },
            index
          ) => (
            <TileLink
              hasBottomSpacing={!(index === linkItems.length - 1)}
              isInternal={isInternal}
              key={url}
              label={label}
              url={url}
            />
          ))
        }
      </Spacer>
    )
  }

  return (
    <ProjectDescriptionStyled className={`fade-in ${isNavigating ? 'fade-out' : ''}`}>
      <Spacer
        b={2.5}
        l={0}
        r={0}
        t={0}
      >
        <div className='description-wrapper'>
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
              <TagH size={1}>
                { name }
              </TagH>
            </Spacer>
            <Spacer
              b={2}
              l={0}
              r={0}
              t={0}
            >
              <TagH
                fontSize='16px'
                size={2}
              >
                { [ ...products, ...(year ? [ year.toString() ] : []) ].join(' • ') }
              </TagH>
            </Spacer>
            {
              splitParagraphs(description).map((paragraph, index, paragraphs) => (
                <Spacer
                  b={index === paragraphs.length - 1 ? 0 : 1.5}
                  key={index}
                  l={0}
                  r={0}
                  t={0}
                >
                  <TagP>
                    { paragraph }
                  </TagP>
                </Spacer>
              ))
            }
            { renderLinks() }
          </Spacer>
        </div>
      </Spacer>
    </ProjectDescriptionStyled>
  )
}
