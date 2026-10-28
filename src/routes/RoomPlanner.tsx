import React, { type FunctionComponent, Suspense } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'
import { hasValidAuthToken } from '../utils/auth'

const RoomPlannerPage = React.lazy(async () => await import('../components/page-content/room-planner/RoomPlannerPage'))

/* Admin only. The page sits outside the portfolio provider that ProtectedRoute reads, so it
   checks the saved token itself; login brings the admin back here. */
export const RoomPlanner: FunctionComponent = () => {
  const location = useLocation()

  if (!hasValidAuthToken()) {
    return (
      <Navigate
        replace
        state={{ from: location }}
        to='/login'
      />
    )
  }

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <RoomPlannerPage />
    </Suspense>
  )
}
