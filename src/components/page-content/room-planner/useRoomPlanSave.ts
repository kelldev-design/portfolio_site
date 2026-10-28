import {
  useEffect,
  useMemo,
  useState
} from 'react'
import { useMutation } from '@apollo/client'
import { saveSyncMeta } from './roomPlannerStorage'
import { SAVE_ROOM_PLAN } from '../../../queries/graphQL'
import { type SaveRoomPlanResponse } from '../../../types/generatedGQLTypes'
import { type RoomPlannerStateType } from '../../../types/roomPlannerTypes'

/* A version saved on the server since this browser's plan was loaded or saved. */
export interface ServerPlanType {
  plan: RoomPlannerStateType
  updatedAt: string
}

/* Where the plan stood against the server's when the page opened. */
export interface InitialSyncType {
  /** The plan as the server has it, as JSON, or '' when the server has none or is unknown. */
  cleanJson: string
  baseUpdatedAt: string | null
  /** Set when this browser kept its unsaved edits over a newer server version. */
  newerServer: ServerPlanType | null
  /** False when the server's plan could not be loaded. */
  isServerReachable: boolean
}

interface SaveRoomPlanDataType {
  saveRoomPlan: SaveRoomPlanResponse
}

interface RoomPlanSaveType {
  isDirty: boolean
  isSaving: boolean
  isServerReachable: boolean
  /** The last save's error, cleared by the next success. */
  error: string
  newerServer: ServerPlanType | null
  savedAt: string | null
  save: () => void
  /** Drops this browser's edits for the newer server version, returning it to show. */
  takeServerVersion: () => RoomPlannerStateType | null
}

/* Saves the plan to the server when asked, and tracks whether this browser holds edits the
   server does not have. Edits are always kept in this browser regardless. */
export const useRoomPlanSave = (
  plannerState: RoomPlannerStateType,
  initial: InitialSyncType
): RoomPlanSaveType => {
  const [ cleanJson, setCleanJson ] = useState(initial.cleanJson)
  const [ baseUpdatedAt, setBaseUpdatedAt ] = useState(initial.baseUpdatedAt)
  const [ newerServer, setNewerServer ] = useState(initial.newerServer)
  const [ isServerReachable, setIsServerReachable ] = useState(initial.isServerReachable)
  const [ isSaving, setIsSaving ] = useState(false)
  const [ error, setError ] = useState('')
  const [ saveRoomPlan ] = useMutation<SaveRoomPlanDataType>(SAVE_ROOM_PLAN)

  const json = useMemo(
    () => JSON.stringify(plannerState),
    [ plannerState ]
  )
  // Compared rather than flagged on each change, so undoing an edit by hand counts as clean.
  const isDirty = json !== cleanJson

  useEffect(
    () => {
      saveSyncMeta({
        baseUpdatedAt,
        isDirty
      })
    },
    [
      baseUpdatedAt,
      isDirty
    ]
  )

  const save = (): void => {
    setIsSaving(true)
    saveRoomPlan({ variables: { data: json } })
      .then(({ data }) => {
        const response = data?.saveRoomPlan

        if (!response?.success) throw new Error(response?.message ?? 'The server did not save the plan.')

        setCleanJson(json)
        setBaseUpdatedAt(response.roomPlan?.updatedAt ?? null)
        setNewerServer(null)
        setIsServerReachable(true)
        setError('')
      })
      .catch((saveError: Error) => { setError(saveError.message) })
      .finally(() => { setIsSaving(false) })
  }

  const takeServerVersion = (): RoomPlannerStateType | null => {
    if (!newerServer) return null

    setCleanJson(JSON.stringify(newerServer.plan))
    setBaseUpdatedAt(newerServer.updatedAt)
    setNewerServer(null)

    return newerServer.plan
  }

  return {
    error,
    isDirty,
    isSaving,
    isServerReachable,
    newerServer,
    save,
    savedAt: baseUpdatedAt,
    takeServerVersion
  }
}
