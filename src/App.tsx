import { type FunctionComponent } from 'react'
import { LoginCallback } from '@okta/okta-react'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider
} from 'react-router-dom'
import styled from 'styled-components'
import { appStyles } from './AppStyles'
import { Header } from './components/layout/header/Header'
import KeyCommandProvider from './components/wrappers/KeyCommandProvider'
import OktaProvider from './components/wrappers/OktaProvider'
import { PortfolioContextProvider } from './components/wrappers/PortfolioContextProvider'
import ProtectedRoute from './components/wrappers/ProtectedRoute'
import { Admin } from './routes/Admin'
import { Contact } from './routes/Contact'
import { Home } from './routes/Home'
import { Login } from './routes/Login'
import { Movies } from './routes/Movies'
import { Project } from './routes/Project'
import { ProjectDemo } from './routes/ProjectDemo'

const AppStyled = styled.div`${appStyles}`

const router = createBrowserRouter([
  {
    element: (
      <OktaProvider>
        <PortfolioContextProvider>
          <KeyCommandProvider>
            <AppStyled>
              <div className='scroll-spacer' />
              <Header />
              <Outlet />
            </AppStyled>
          </KeyCommandProvider>
        </PortfolioContextProvider>
      </OktaProvider>
    ),
    children: [
      {
        path: '/',
        element: <Home />,
        children: [
          {
            path: ':filter',
            element: <Home />
          }
        ]
      },
      {
        path: '/contact',
        element: <Contact />
      },
      {
        path: '/movies',
        element: <Movies />
      },
      {
        path: '/project/:projectId',
        element: <Project />
      },
      {
        path: '/project/:projectId/demo',
        element: <ProjectDemo />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/admin',
        element: <ProtectedRoute><Admin /></ProtectedRoute>
      },
      {
        path: '/login/callback',
        element: <LoginCallback />
      }
    ]
  }
])

export const App: FunctionComponent = () => <RouterProvider router={router} />
