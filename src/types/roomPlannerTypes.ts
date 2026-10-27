/* All lengths are in inches. */

/* One rectangle of a shape, measured from the shape's top left corner. Overlapping or
   touching rectangles merge into a single outline. */
export interface RectType {
  x: number
  y: number
  width: number
  depth: number
}

/* Quarter turns clockwise. An L shaped piece looks different in each of the four. */
export type RotationType = 0 | 90 | 180 | 270

export interface FurnitureType {
  id: string
  name: string
  color: string
  rects: RectType[]
}

/* One piece of furniture placed in a room. x and y are the top left corner of its
   rotated bounding box, measured from the room's top left corner. */
export interface PlacementType {
  id: string
  furnitureId: string
  x: number
  y: number
  rotation: RotationType
}

export type OrientationType = 'horizontal' | 'vertical'

/* A doorway in one of a room's walls. x and y are the end of the opening nearest the room's
   top left; it runs width inches along the wall from there. A swing door's leaf hangs from
   the hinge end and swings into or out of the room; an opening is an entryway with no door,
   so hinge and swing are kept but unused, ready if it is turned back into a door. */
export interface DoorType {
  id: string
  kind: 'swing' | 'opening'
  x: number
  y: number
  orientation: OrientationType
  width: number
  hinge: 'start' | 'end'
  swing: 'in' | 'out'
}

export interface RoomType {
  id: string
  name: string
  rects: RectType[]
  placements: PlacementType[]
  doors: DoorType[]
}

export interface RoomPlannerStateType {
  furniture: FurnitureType[]
  rooms: RoomType[]
  selectedRoomId: string
}
