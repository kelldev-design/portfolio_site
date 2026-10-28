import {
  type FunctionComponent,
  useMemo
} from 'react'
import { useQuery } from '@apollo/client'
import { RoomPlannerContent } from './RoomPlannerContent'
import {
  hasStoredPlan,
  loadRoomPlanner,
  loadSyncMeta,
  parseRoomPlanner,
  saveRoomPlanner
} from './roomPlannerStorage'
import { type InitialSyncType } from './useRoomPlanSave'
import { GET_ROOM_PLAN } from '../../../queries/graphQL'
import { type RoomPlan } from '../../../types/generatedGQLTypes'
import { type RoomPlannerStateType } from '../../../types/roomPlannerTypes'
import { LoadingOverlay } from '../../common/loading-overlay/LoadingOverlay'

interface RoomPlanDataType {
  roomPlan?: RoomPlan | null
}

interface StartType {
  state: RoomPlannerStateType
  sync: InitialSyncType
}

const readServerPlan = (roomPlan: RoomPlan | null | undefined): { plan: RoomPlannerStateType, updatedAt: string } | null => {
  if (!roomPlan) return null

  try {
    return { plan: parseRoomPlanner(roomPlan.data), updatedAt: roomPlan.updatedAt }
  } catch {
    return null
  }
}

/* Chooses the plan to open. This browser's plan wins while it holds unsaved edits, so they
   are never lost; otherwise the server's does, so saves from other browsers show up. When
   both changed, the edits stay and the newer server version is offered alongside. */
const choosePlan = (roomPlan: RoomPlan | null | undefined): StartType => {
  const server = readServerPlan(roomPlan)
  const meta = loadSyncMeta()
  const serverJson = server ? JSON.stringify(server.plan) : ''

  if (!hasStoredPlan() || !meta.isDirty) {
    const state = server?.plan ?? loadRoomPlanner()

    saveRoomPlanner(state)

    return {
      state,
      sync: { baseUpdatedAt: server?.updatedAt ?? null, cleanJson: serverJson, isServerReachable: true, newerServer: null }
    }
  }

  const isServerNewer = !!server && server.updatedAt !== meta.baseUpdatedAt

  return {
    state: loadRoomPlanner(),
    sync: {
      baseUpdatedAt: meta.baseUpdatedAt,
      cleanJson: isServerNewer ? '' : serverJson,
      isServerReachable: true,
      newerServer: isServerNewer ? server : null
    }
  }
}

/* With the server unreachable the plan opens from this browser, still dirty or clean as
   it was left. */
const offlinePlan = (): StartType => {
  const state = loadRoomPlanner()
  const meta = loadSyncMeta()

  return {
    state,
    sync: {
      baseUpdatedAt: meta.baseUpdatedAt,
      cleanJson: meta.isDirty ? '' : JSON.stringify(state),
      isServerReachable: false,
      newerServer: null
    }
  }
}

/* Loads the saved plan from the server before opening the planner. */
const RoomPlannerPage: FunctionComponent = () => {
  const { data, error, loading } = useQuery<RoomPlanDataType>(
    GET_ROOM_PLAN,
    { fetchPolicy: 'network-only' }
  )
  const start = useMemo(
    () => {
      if (loading) return null

      return error ? offlinePlan() : choosePlan(data?.roomPlan)
    },
    [
      data,
      error,
      loading
    ]
  )

  if (!start) return <LoadingOverlay />

  return (
    <RoomPlannerContent
      initialState={start.state}
      initialSync={start.sync}
    />
  )
}

export default RoomPlannerPage
