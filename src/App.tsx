import { type FunctionComponent } from 'react'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider
} from 'react-router-dom'
import styled from 'styled-components'
import { appStyles } from './AppStyles'
import { Header } from './components/layout/header/Header'
import KeyCommandProvider from './components/wrappers/KeyCommandProvider'
import { PortfolioContextProvider } from './components/wrappers/PortfolioContextProvider'
import ProtectedRoute from './components/wrappers/ProtectedRoute'
import { Admin } from './routes/Admin'
import { Contact } from './routes/Contact'
import { Home } from './routes/Home'
import { Login } from './routes/Login'
import { Markets } from './routes/Markets'
import { Movies } from './routes/Movies'
import { Project } from './routes/Project'
import { ProjectDemo } from './routes/ProjectDemo'
import { RoomPlanner } from './routes/RoomPlanner'

const AppStyled = styled.div`${appStyles}`

const router = createBrowserRouter([
  {
    element: (
      <PortfolioContextProvider>
        <KeyCommandProvider>
          <AppStyled>
            <div className='scroll-spacer' />
            <Header />
            <Outlet />
          </AppStyled>
        </KeyCommandProvider>
      </PortfolioContextProvider>
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
        path: '/markets',
        element: <Markets />
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
      }
    ]
  },
  /* Standalone pages that need no portfolio data, so they sit outside its provider and
     never wait on the portfolio query. The header reads that provider, so they have none. */
  {
    element: (
      <KeyCommandProvider>
        <AppStyled>
          <Outlet />
        </AppStyled>
      </KeyCommandProvider>
    ),
    children: [
      {
        path: '/room-planner',
        element: <RoomPlanner />
      }
    ]
  }
])

export const App: FunctionComponent = () => <RouterProvider router={router} />
