import { DEFAULT_ROOM_PLANNER } from './defaultRoomPlanner'
import {
  type FurnitureType,
  type PlacementType,
  type RectType,
  type RoomPlannerStateType,
  type RoomType
} from '../../../types/roomPlannerTypes'

export const ROOM_PLANNER_KEY = 'kelldev-room-planner'

export const EMPTY_STATE: RoomPlannerStateType = {
  furniture: [],
  rooms: [],
  selectedRoomId: ''
}

export const createId = (): string => window.crypto.randomUUID()

/* The first version saved plain rectangles: a width and depth, and a rotated flag on
   placements. Those load as one rectangle shapes. */
interface LegacyShapeType {
  rects?: RectType[]
  width?: number
  depth?: number
}

const toRects = ({ depth, rects, width }: LegacyShapeType): RectType[] => rects ?? [{
  depth: depth ?? 0,
  width: width ?? 0,
  x: 0,
  y: 0
}]

const toPlacement = (placement: PlacementType & { isRotated?: boolean }): PlacementType => ({
  furnitureId: placement.furnitureId,
  id: placement.id,
  rotation: placement.rotation ?? (placement.isRotated ? 90 : 0),
  x: placement.x,
  y: placement.y
})

export const loadRoomPlanner = (): RoomPlannerStateType => {
  try {
    const stored = window.localStorage.getItem(ROOM_PLANNER_KEY)

    // A browser with no plan saved starts from the default plan, saved straight away so it
    // is this browser's own from then on.
    if (stored === null) {
      saveRoomPlanner(DEFAULT_ROOM_PLANNER)

      return DEFAULT_ROOM_PLANNER
    }

    const parsed = JSON.parse(stored) as Partial<RoomPlannerStateType>
    const furniture = Array.isArray(parsed.furniture) ? parsed.furniture : []
    const rooms = Array.isArray(parsed.rooms) ? parsed.rooms : []

    return {
      furniture: furniture.map((item: FurnitureType & LegacyShapeType) => ({
        color: item.color,
        id: item.id,
        name: item.name,
        rects: toRects(item)
      })),
      rooms: rooms.map((room: RoomType & LegacyShapeType) => ({
        // Rooms saved before doors existed have none, and doors saved before entryways
        // existed are all swing doors.
        doors: Array.isArray(room.doors) ? room.doors.map(door => ({ ...door, kind: door.kind ?? 'swing' })) : [],
        id: room.id,
        name: room.name,
        placements: room.placements.map(toPlacement),
        rects: toRects(room)
      })),
      selectedRoomId: parsed.selectedRoomId ?? ''
    }
  } catch {
    return EMPTY_STATE
  }
}

export const saveRoomPlanner = (state: RoomPlannerStateType): void => {
  try {
    window.localStorage.setItem(
      ROOM_PLANNER_KEY,
      JSON.stringify(state)
    )
  } catch {
    /* storage unavailable */
  }
}

/* Which sidebar sections are collapsed, remembered per browser. Kept apart from the plans,
   since it is a viewing preference, not part of a plan. */
const SECTIONS_KEY = 'kelldev-room-planner-sections'

export const loadCollapsedSections = (): Record<string, boolean> => {
  try {
    const stored = window.localStorage.getItem(SECTIONS_KEY)

    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export const saveCollapsedSections = (collapsed: Record<string, boolean>): void => {
  try {
    window.localStorage.setItem(
      SECTIONS_KEY,
      JSON.stringify(collapsed)
    )
  } catch {
    /* storage unavailable */
  }
}

/* Keeps a value inside [0, max], or at 0 when the piece is larger than the room. */
export const clamp = (
  value: number,
  max: number
): number => Math.max(
  0,
  Math.min(
    value,
    max
  )
)

/* Formats inches for display, e.g. 72 → 72″ (6′ 0″). */
export const formatInches = (inches: number): string => {
  const feet = Math.floor(inches / 12)
  const remainder = Math.round((inches - feet * 12) * 10) / 10

  return feet ? `${inches}″ (${feet}′ ${remainder}″)` : `${inches}″`
}
