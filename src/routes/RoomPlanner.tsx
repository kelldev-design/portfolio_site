import React, { type FunctionComponent, Suspense } from 'react'
import { LoadingOverlay } from '../components/common/loading-overlay/LoadingOverlay'

const RoomPlannerContent = React.lazy(async () => await import('../components/page-content/room-planner/RoomPlannerContent'))

export const RoomPlanner: FunctionComponent = () =>
  <Suspense fallback={<LoadingOverlay />}>
    <RoomPlannerContent />
  </Suspense>
