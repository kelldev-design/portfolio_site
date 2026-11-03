import {
  type FunctionComponent,
  type ReactElement,
  useContext
} from 'react'
import styled from 'styled-components'
import { ContactContentStyles } from './ContactContentStyles'
import { LinkCustom } from '../../common/link-custom/LinkCustom'
import { TagH } from '../../common/tag-h/TagH'
import { TagP } from '../../common/tag-p/TagP'
import { Container } from '../../layout/container/Container'
import { FlexWrapper } from '../../layout/flex-wrapper/FlexWrapper'
import { PageRow } from '../../layout/page-row/PageRow'
import { Pure } from '../../layout/pure/Pure'
import { PureUnit } from '../../layout/pure-unit/PureUnit'
import { Spacer } from '../../layout/spacer/Spacer'
import { PortfolioContext } from '../../wrappers/PortfolioContextProvider'

const ContactContentStyled = styled.div`${ContactContentStyles}`

const ContactContent: FunctionComponent = () => {
  const { isNavigating } = useContext(PortfolioContext)

  const renderGithubLink = (): ReactElement =>
    <LinkCustom
      hasLinkStyling
      isExternal
      target='_blank'
      to='https://github.com/kelleghan1/'
    >
      Github
    </LinkCustom>

  const renderImageKitLink = (): ReactElement =>
    <LinkCustom
      hasLinkStyling
      isExternal
      target='_blank'
      to='https://imagekit.io/'
    >
      imagekit.io
    </LinkCustom>

  const renderContact = (): ReactElement =>
    <FlexWrapper
      backgroundColor='#fff'
      hasShadow
    >
      <Spacer
        b={2.5}
        isFlex
        l={2.5}
        r={2.5}
        t={2.5}
      >
        <FlexWrapper flexColumn>
          <div className='flex-grow'>
            <Spacer
              b={2}
              l={0}
              r={0}
              t={0}
            >
              <TagH
                fontSize='16px'
                size={1}
              >
                Contact
              </TagH>
            </Spacer>
            <Spacer
              l={0}
              r={0}
              t={0}
            >
              <TagP>
                Like my work? I create websites, online storefronts, mobile apps, logos, print material, advertisements and more.
                Connect with me on <span>{ renderGithubLink() }</span> or tell me about your project at:
              </TagP>
            </Spacer>
          </div>
          <LinkCustom
            hasLinkStyling
            isExternal
            to='mailto:coleman@kelldev.design'
          >
            coleman@kelldev.design
          </LinkCustom>
        </FlexWrapper>
      </Spacer>
    </FlexWrapper>

  const renderAbout = (): ReactElement =>
    <FlexWrapper
      backgroundColor='#fff'
      hasShadow
    >
      <Spacer
        b={2.5}
        isFlex
        l={2.5}
        r={2.5}
        t={2.5}
      >
        <FlexWrapper flexColumn>
          <div className='flex-grow'>
            <Spacer
              b={2}
              l={0}
              r={0}
              t={0}
            >
              <TagH size={2}>
                About this website
              </TagH>
            </Spacer>
            <TagP>
              This website is a React and TypeScript single-page app built with Vite and styled-components, served as a static bundle from S3 through CloudFront. Its projects come from a GraphQL API built with Apollo Server and Prisma on SQLite, running on an AWS EC2 instance behind CloudFront and nginx, and are managed from an admin area behind a JWT login. The markets page charts Federal Reserve economic data from FRED with Recharts, and images are served by the { renderImageKitLink() } CDN. All of the infrastructure is defined in Terraform and deployed by GitHub Actions, with lint, typecheck and build checks before every release. See how this website was built by checking out the code:
            </TagP>
          </div>
          <Spacer
            b={0}
            l={0}
            r={0}
            t={2}
          >
            <LinkCustom
              hasLinkStyling
              isExternal
              target='_blank'
              to='https://github.com/kelldev-design/portfolio_site'
            >
              View the website code on GitHub
            </LinkCustom>
          </Spacer>
          <Spacer
            b={0}
            l={0}
            r={0}
            t={1}
          >
            <LinkCustom
              hasLinkStyling
              isExternal
              target='_blank'
              to='https://github.com/kelldev-design/portfolio_api'
            >
              View the API code on GitHub
            </LinkCustom>
          </Spacer>
        </FlexWrapper>
      </Spacer>
    </FlexWrapper>

  const renderColumns = (): ReactElement =>
    <Spacer
      l={1.75}
      r={1.75}
      t={0}
    >
      <Pure>
        <PureUnit
          isFlex
          pureClass='u-1 u-md-1-2'
        >
          <Spacer
            b={2.5}
            isFlex
            l={1.25}
            r={1.25}
            t={0}
          >
            { renderContact() }
          </Spacer>
        </PureUnit>
        <PureUnit
          isFlex
          pureClass='u-1 u-md-1-2'
        >
          <Spacer
            b={2.5}
            isFlex
            l={1.25}
            r={1.25}
            t={0}
          >
            { renderAbout() }
          </Spacer>
        </PureUnit>
      </Pure>
    </Spacer>

  return (
    <PageRow>
      <Container>
        <ContactContentStyled className={`fade-in ${isNavigating ? 'fade-out' : ''}`}>
          { renderColumns() }
        </ContactContentStyled>
      </Container>
    </PageRow>
  )
}

export default ContactContent
