import {
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useState
} from 'react'
import styled from 'styled-components'
import { InchesInput } from './InchesInput'
import { RoomPlan } from './RoomPlan'
import { RoomPlannerContentStyles } from './RoomPlannerContentStyles'
import {
  clamp,
  createId,
  formatInches,
  loadCollapsedSections,
  loadRoomPlanner,
  saveCollapsedSections,
  saveRoomPlanner
} from './roomPlannerStorage'
import { ShapeEditor } from './ShapeEditor'
import {
  doorCentre,
  doorWall,
  isWithin,
  placedRects,
  placedSize,
  shapeSize,
  snapToWall
} from './shapeGeometry'
import {
  type DoorType,
  type FurnitureType,
  type PlacementType,
  type RectType,
  type RoomPlannerStateType,
  type RoomType,
  type RotationType
} from '../../../types/roomPlannerTypes'
import {
  GREY3,
  SERIES1,
  SERIES2,
  SERIES3,
  SERIES4,
  SERIES5
} from '../../../utils/constants/colors'
import { TagH } from '../../common/tag-h/TagH'
import { TagP } from '../../common/tag-p/TagP'

const RoomPlannerContentStyled = styled.div`${RoomPlannerContentStyles}`

/* New furniture takes the next colour in turn. */
const FURNITURE_COLORS = [ SERIES1, SERIES2, SERIES3, SERIES4, SERIES5 ]

/* The shape open in the editor. id is '' while creating a new one. */
interface EditingType {
  kind: 'room' | 'furniture'
  id: string
}

const sizeLabel = (rects: RectType[]): string => {
  const { depth, width } = shapeSize(rects)

  return `${width}″ × ${depth}″`
}

/* Pulls a placement back inside the room's bounding box, after the room or piece changed shape. */
const clampPlacement = (
  roomRects: RectType[],
  item: FurnitureType | undefined,
  placement: PlacementType
): PlacementType => {
  if (!item) return placement

  const roomSize = shapeSize(roomRects)
  const size = placedSize(
    item,
    placement.rotation
  )

  return {
    ...placement,
    x: clamp(
      placement.x,
      roomSize.width - size.width
    ),
    y: clamp(
      placement.y,
      roomSize.depth - size.depth
    )
  }
}

/* A common interior door. */
const DOOR_WIDTH = 32

/* New and duplicated pieces step this far down and right until they reach a spot no
   other piece starts at, so copies never land exactly on top of each other. */
const PLACE_OFFSET = 12

const freeSpot = (
  room: RoomType,
  item: FurnitureType,
  placement: PlacementType
): PlacementType => {
  let spot = clampPlacement(
    room.rects,
    item,
    placement
  )

  // Bounded, in case a full or small room leaves nowhere free; the piece then stays put.
  for (let attempt = 0; attempt < 20; attempt++) {
    const { x, y } = spot

    if (!room.placements.some(other => other.x === x && other.y === y)) break

    const next = clampPlacement(
      room.rects,
      item,
      { ...spot, x: x + PLACE_OFFSET, y: y + PLACE_OFFSET }
    )

    if (next.x === x && next.y === y) break

    spot = next
  }

  return spot
}

const RoomPlannerContent: FunctionComponent = () => {
  const [ plannerState, setPlannerState ] = useState<RoomPlannerStateType>(loadRoomPlanner)
  const [ selectedPlacementId, setSelectedPlacementId ] = useState('')
  const [ selectedDoorId, setSelectedDoorId ] = useState('')
  const [ editing, setEditing ] = useState<EditingType | null>(null)
  const [ collapsed, setCollapsed ] = useState(loadCollapsedSections)
  // The sidebar element the shape editor puts its rectangle fields in.
  const [ detailsTarget, setDetailsTarget ] = useState<HTMLDivElement | null>(null)

  const { furniture, rooms, selectedRoomId } = plannerState
  const selectedRoom = rooms.find(({ id }) => id === selectedRoomId)
  const selectedPlacement = selectedRoom?.placements.find(({ id }) => id === selectedPlacementId)
  const selectedDoor = selectedRoom?.doors.find(({ id }) => id === selectedDoorId)

  const furnitureMap = useMemo(
    () => Object.fromEntries(furniture.map(item => [ item.id, item ])) as Record<string, FurnitureType>,
    [ furniture ]
  )

  const editingRoom = editing?.kind === 'room' ? rooms.find(({ id }) => id === editing.id) : undefined
  const editingFurniture = editing?.kind === 'furniture' ? furnitureMap[editing.id] : undefined

  useEffect(
    () => { saveRoomPlanner(plannerState) },
    [ plannerState ]
  )

  useEffect(
    () => { saveCollapsedSections(collapsed) },
    [ collapsed ]
  )

  /* One thing is selected at a time: a piece of furniture or a door. */
  const selectPlacement = (placementId: string): void => {
    setSelectedPlacementId(placementId)
    setSelectedDoorId('')
  }

  const selectDoor = (doorId: string): void => {
    setSelectedDoorId(doorId)
    setSelectedPlacementId('')
  }

  const selectRoom = (roomId: string): void => {
    setEditing(null)
    selectPlacement('')
    setPlannerState(state => ({ ...state, selectedRoomId: roomId }))
  }

  const updatePlacements = (update: (placements: PlacementType[]) => PlacementType[]): void => {
    setPlannerState(state => ({
      ...state,
      rooms: state.rooms.map(room => room.id === state.selectedRoomId
        ? { ...room, placements: update(room.placements) }
        : room)
    }))
  }

  const updatePlacement = (
    placementId: string,
    update: (placement: PlacementType) => PlacementType
  ): void => {
    updatePlacements(placements => placements.map(placement => placement.id === placementId
      ? update(placement)
      : placement))
  }

  const updateDoors = (update: (doors: DoorType[]) => DoorType[]): void => {
    setPlannerState(state => ({
      ...state,
      rooms: state.rooms.map(room => room.id === state.selectedRoomId
        ? { ...room, doors: update(room.doors) }
        : room)
    }))
  }

  const updateDoor = (
    doorId: string,
    changes: Partial<DoorType>
  ): void => {
    updateDoors(doors => doors.map(door => door.id === doorId ? { ...door, ...changes } : door))
  }

  /* Puts a new door or entryway on the wall nearest the middle of the room's top edge. */
  const handleAddDoor = (kind: DoorType['kind']): void => {
    if (!selectedRoom) return

    const spot = snapToWall(
      selectedRoom.rects,
      { x: shapeSize(selectedRoom.rects).width / 2, y: 0 },
      DOOR_WIDTH
    )

    if (!spot) return

    const door: DoorType = { hinge: 'start', id: createId(), kind, swing: 'in', width: DOOR_WIDTH, ...spot }

    updateDoors(doors => [ ...doors, door ])
    selectDoor(door.id)
  }

  /* A new width keeps the door centred where it was, moved along or to another wall if it
     no longer fits. Ignored when no wall is long enough. */
  const handleDoorWidth = (door: DoorType, width: number): void => {
    if (!selectedRoom) return

    const spot = snapToWall(
      selectedRoom.rects,
      doorCentre(door),
      width
    )

    if (spot) {
      updateDoor(
        door.id,
        { ...spot, width }
      )
    }
  }

  /* Moves a door along its wall to the given distance from the wall's start, its left or
     top end, keeping it on the wall. */
  const handleDoorOffset = (door: DoorType, offset: number): void => {
    if (!selectedRoom) return

    const placement = doorWall(
      selectedRoom.rects,
      door
    )

    if (!placement) return

    const { wall } = placement
    const along = clamp(
      offset,
      wall.length - door.width
    )

    updateDoor(
      door.id,
      wall.orientation === 'horizontal' ? { x: wall.x + along } : { y: wall.y + along }
    )
  }

  const handleDoorRemove = (doorId: string): void => {
    selectDoor('')
    updateDoors(doors => doors.filter(({ id }) => id !== doorId))
  }

  const saveRoom = (
    name: string,
    rects: RectType[]
  ): void => {
    if (editingRoom) {
      setPlannerState(state => ({
        ...state,
        rooms: state.rooms.map(room => room.id === editingRoom.id
          ? {
            ...room,
            name,
            // Doors move to the nearest wall of the new shape, and go if none fits them.
            doors: room.doors.flatMap(door => {
              const spot = snapToWall(
                rects,
                doorCentre(door),
                door.width
              )

              return spot ? [{ ...door, ...spot }] : []
            }),
            placements: room.placements.map(placement => clampPlacement(
              rects,
              furnitureMap[placement.furnitureId],
              placement
            )),
            rects
          }
          : room)
      }))
      setEditing(null)

      return
    }

    const room: RoomType = {
      doors: [],
      id: createId(),
      name,
      placements: [],
      rects
    }

    setPlannerState(state => ({
      ...state,
      rooms: [ ...state.rooms, room ],
      selectedRoomId: room.id
    }))
    selectPlacement('')
    setEditing(null)
  }

  const saveFurniture = (
    name: string,
    rects: RectType[]
  ): void => {
    if (editingFurniture) {
      const item = { ...editingFurniture, name, rects }

      setPlannerState(state => ({
        ...state,
        furniture: state.furniture.map(current => current.id === item.id ? item : current),
        rooms: state.rooms.map(room => ({
          ...room,
          placements: room.placements.map(placement => placement.furnitureId === item.id
            ? clampPlacement(
              room.rects,
              item,
              placement
            )
            : placement)
        }))
      }))
      setEditing(null)

      return
    }

    setPlannerState(state => ({
      ...state,
      furniture: [
        ...state.furniture,
        {
          color: FURNITURE_COLORS[state.furniture.length % FURNITURE_COLORS.length],
          id: createId(),
          name,
          rects
        }
      ]
    }))
    setEditing(null)
  }

  const handleRoomDelete = (room: RoomType): void => {
    if (!window.confirm(`Delete ${room.name} and everything placed in it?`)) return

    setEditing(null)
    selectPlacement('')
    setPlannerState(state => {
      const remaining = state.rooms.filter(({ id }) => id !== room.id)

      return {
        ...state,
        rooms: remaining,
        selectedRoomId: state.selectedRoomId === room.id ? remaining[0]?.id ?? '' : state.selectedRoomId
      }
    })
  }

  const handleFurnitureDelete = (item: FurnitureType): void => {
    if (!window.confirm(`Delete ${item.name}? It is removed from every room it is placed in.`)) return

    setEditing(null)
    setPlannerState(state => ({
      ...state,
      furniture: state.furniture.filter(({ id }) => id !== item.id),
      rooms: state.rooms.map(room => ({
        ...room,
        placements: room.placements.filter(({ furnitureId }) => furnitureId !== item.id)
      }))
    }))
  }

  /* Drops a new piece in the middle of the selected room's bounding box, or its top left
     corner when it is larger than the room, moved on if another piece is already there.
     A piece can be placed any number of times. */
  const handlePlace = (item: FurnitureType): void => {
    if (!selectedRoom) return

    const roomSize = shapeSize(selectedRoom.rects)
    const size = shapeSize(item.rects)
    const placement = freeSpot(
      selectedRoom,
      item,
      {
        furnitureId: item.id,
        id: createId(),
        rotation: 0,
        x: Math.round((roomSize.width - size.width) / 2),
        y: Math.round((roomSize.depth - size.depth) / 2)
      }
    )

    setEditing(null)
    updatePlacements(placements => [ ...placements, placement ])
    selectPlacement(placement.id)
  }

  /* Places another copy of a piece, turned the same way, a foot from the original. */
  const handleDuplicate = (placementId: string): void => {
    const original = selectedRoom?.placements.find(({ id }) => id === placementId)
    const item = original && furnitureMap[original.furnitureId]

    if (!selectedRoom || !original || !item) return

    const copy = freeSpot(
      selectedRoom,
      item,
      { ...original, id: createId(), x: original.x + PLACE_OFFSET, y: original.y + PLACE_OFFSET }
    )

    updatePlacements(placements => [ ...placements, copy ])
    selectPlacement(copy.id)
  }

  const handleMove = (
    placementId: string,
    x: number,
    y: number
  ): void => {
    updatePlacement(
      placementId,
      placement => ({ ...placement, x, y })
    )
  }

  /* Turns a quarter turn clockwise about the piece's centre, then keeps it inside the room. */
  const handleRotate = (placementId: string): void => {
    if (!selectedRoom) return

    updatePlacement(
      placementId,
      placement => {
        const item = furnitureMap[placement.furnitureId]

        if (!item) return placement

        const before = placedSize(
          item,
          placement.rotation
        )
        const rotation = (placement.rotation + 90) % 360 as RotationType
        const after = placedSize(
          item,
          rotation
        )

        return clampPlacement(
          selectedRoom.rects,
          item,
          {
            ...placement,
            rotation,
            x: Math.round(placement.x + (before.width - after.width) / 2),
            y: Math.round(placement.y + (before.depth - after.depth) / 2)
          }
        )
      }
    )
  }

  const handleRemove = (placementId: string): void => {
    selectPlacement('')
    updatePlacements(placements => placements.filter(({ id }) => id !== placementId))
  }

  /* Typed positions are clamped the same way as dragged ones. */
  const handlePositionChange = (axis: 'x' | 'y') => (inches: number): void => {
    if (!selectedRoom || !selectedPlacement) return

    updatePlacement(
      selectedPlacement.id,
      placement => clampPlacement(
        selectedRoom.rects,
        furnitureMap[placement.furnitureId],
        { ...placement, [axis]: inches }
      )
    )
  }

  /* A sidebar card whose heading opens and closes it. */
  const renderSection = (
    key: string,
    title: string,
    children: ReactNode
  ): ReactElement => {
    const isOpen = !collapsed[key]

    return (
      <section className='room-planner-card'>
        <h2 className='room-planner-section-heading'>
          <button
            aria-controls={`room-planner-section-${key}`}
            aria-expanded={isOpen}
            className='room-planner-section-toggle'
            onClick={() => { setCollapsed(current => ({ ...current, [key]: isOpen })) }}
            type='button'
          >
            { title }
            <span
              aria-hidden
              className={`room-planner-section-chevron ${isOpen ? 'is-open' : ''}`}
            />
          </button>
        </h2>
        <div
          className='room-planner-section-body'
          hidden={!isOpen}
          id={`room-planner-section-${key}`}
        >
          { children }
        </div>
      </section>
    )
  }

  const renderCard = (
    title: string,
    children: ReactNode,
    className = ''
  ): ReactElement =>
    <section className={`room-planner-card ${className}`}>
      <TagH size={2}>
        { title }
      </TagH>
      { children }
    </section>

  const renderNewRow = (
    kind: EditingType['kind'],
    label: string
  ): ReactElement => {
    const isActive = editing?.kind === kind && !editing.id

    return (
      <div className={`room-planner-row ${isActive ? 'is-selected' : ''}`}>
        <button
          className='room-planner-row-main'
          onClick={() => { setEditing({ id: '', kind }) }}
          type='button'
        >
          { label }
        </button>
      </div>
    )
  }

  const renderEditAction = (
    kind: EditingType['kind'],
    id: string,
    name: string
  ): ReactElement =>
    <button
      className='room-planner-row-action'
      onClick={() => { setEditing({ id, kind }) }}
      title={`Edit ${name}`}
      type='button'
    >
      Edit
    </button>

  const renderRoomRow = (room: RoomType): ReactElement => {
    const isSelected = room.id === selectedRoomId

    return (
      <li
        className={`room-planner-row ${isSelected ? 'is-selected' : ''}`}
        key={room.id}
      >
        <button
          aria-current={isSelected}
          className='room-planner-row-main'
          onClick={() => { selectRoom(room.id) }}
          type='button'
        >
          <span>{ room.name }</span>
          <span className='room-planner-row-size'>{ sizeLabel(room.rects) }</span>
        </button>
        { renderEditAction(
          'room',
          room.id,
          room.name
        ) }
      </li>
    )
  }

  const renderRooms = (): ReactElement =>
    <>
      { renderNewRow(
        'room',
        '+ New room'
      ) }
      { rooms.length
        ? <ul className='room-planner-list'>{ rooms.map(renderRoomRow) }</ul>
        : <p className='room-planner-hint'>No rooms yet.</p> }
    </>

  const renderFurnitureRow = (item: FurnitureType): ReactElement =>
    <li
      className='room-planner-row'
      key={item.id}
    >
      <div className='room-planner-row-main'>
        <span
          className='room-planner-swatch'
          style={{ backgroundColor: item.color }}
        />
        <span>{ item.name }</span>
        <span className='room-planner-row-size'>{ sizeLabel(item.rects) }</span>
      </div>
      <button
        className='room-planner-row-action'
        disabled={!selectedRoom}
        onClick={() => { handlePlace(item) }}
        title={selectedRoom ? `Place ${item.name} in ${selectedRoom.name}` : 'Select a room to place furniture'}
        type='button'
      >
        Place
      </button>
      { renderEditAction(
        'furniture',
        item.id,
        item.name
      ) }
    </li>

  const renderFurniture = (): ReactElement =>
    <>
      { renderNewRow(
        'furniture',
        '+ New furniture'
      ) }
      { furniture.length
        ? <ul className='room-planner-list'>{ furniture.map(renderFurnitureRow) }</ul>
        : <p className='room-planner-hint'>No furniture yet. Create a piece, then place it in a room.</p> }
    </>

  const renderDoorSelection = (door: DoorType): ReactElement => {
    const isOpening = door.kind === 'opening'
    const placement = selectedRoom && doorWall(
      selectedRoom.rects,
      door
    )
    const isHorizontal = door.orientation === 'horizontal'

    return (
      <div className='room-planner-selection'>
        <div className='room-planner-selection-name'>
          { isOpening ? 'Entryway' : 'Door' }
          <span className='room-planner-row-size'>
            { isOpening ? 'No door' : door.swing === 'in' ? 'Opens into the room' : 'Opens out of the room' }
          </span>
        </div>
        <InchesInput
          id='door-width'
          isPositive
          label='Width'
          onChange={width => {
            handleDoorWidth(
              door,
              width
            )
          }}
          value={door.width}
        />
        {
          placement &&
            <>
              <InchesInput
                id='door-offset-start'
                label={isHorizontal ? 'From left' : 'From top'}
                onChange={offset => {
                  handleDoorOffset(
                    door,
                    offset
                  )
                }}
                value={placement.offset}
              />
              <InchesInput
                id='door-offset-end'
                label={isHorizontal ? 'From right' : 'From bottom'}
                onChange={offset => {
                  handleDoorOffset(
                    door,
                    placement.wall.length - door.width - offset
                  )
                }}
                value={placement.wall.length - door.width - placement.offset}
              />
              <p className='room-planner-hint'>
                { `Measured along its ${placement.wall.length}″ wall, to the edges of the opening.` }
              </p>
            </>
        }
        <div className='room-planner-selection-actions'>
          {
            !isOpening &&
              <button
                className='room-planner-submit'
                onClick={() => {
                  updateDoor(
                    door.id,
                    { swing: door.swing === 'in' ? 'out' : 'in' }
                  )
                }}
                type='button'
              >
                { door.swing === 'in' ? 'Swing out' : 'Swing in' }
              </button>
          }
          {
            !isOpening &&
              <button
                className='room-planner-row-action'
                onClick={() => {
                  updateDoor(
                    door.id,
                    { hinge: door.hinge === 'start' ? 'end' : 'start' }
                  )
                }}
                type='button'
              >
                Flip hinge
              </button>
          }
          <button
            className='room-planner-row-action'
            onClick={() => {
              updateDoor(
                door.id,
                { kind: isOpening ? 'swing' : 'opening' }
              )
            }}
            type='button'
          >
            { isOpening ? 'Add a door' : 'Make entryway' }
          </button>
          <button
            className='room-planner-row-action'
            onClick={() => { handleDoorRemove(door.id) }}
            type='button'
          >
            { isOpening ? 'Remove entryway' : 'Remove door' }
          </button>
        </div>
      </div>
    )
  }

  const renderSelection = (): ReactElement => {
    if (selectedDoor) return renderDoorSelection(selectedDoor)

    const item = selectedPlacement && furnitureMap[selectedPlacement.furnitureId]

    if (!selectedRoom) return <p className='room-planner-hint'>Select a room to see its controls here.</p>

    if (!selectedPlacement || !item) {
      return (
        <p className='room-planner-hint'>
          Tap furniture to select it, then drag it to move it, or press and hold to pick it up and drag straight away.
          Arrow keys nudge the selected piece an inch, or a foot with shift held, R rotates it and D duplicates it.
          Doors and entryways work the same way and slide along the walls; select one to change its width or which way a door opens.
        </p>
      )
    }

    const isOutside = !isWithin(
      selectedRoom.rects,
      placedRects(
        item,
        selectedPlacement
      )
    )
    const size = placedSize(
      item,
      selectedPlacement.rotation
    )

    return (
      <div className='room-planner-selection'>
        <div className='room-planner-selection-name'>
          { item.name }
          <span className='room-planner-row-size'>{ `${size.width}″ × ${size.depth}″` }</span>
          { isOutside && <span className='room-planner-warning'>Part of this piece is outside the room.</span> }
        </div>
        <InchesInput
          id='placement-x'
          label='From left'
          onChange={handlePositionChange('x')}
          value={selectedPlacement.x}
        />
        <InchesInput
          id='placement-y'
          label='From top'
          onChange={handlePositionChange('y')}
          value={selectedPlacement.y}
        />
        <div className='room-planner-selection-actions'>
          <button
            className='room-planner-submit'
            onClick={() => { handleRotate(selectedPlacement.id) }}
            type='button'
          >
            Rotate
          </button>
          <button
            className='room-planner-row-action'
            onClick={() => { handleDuplicate(selectedPlacement.id) }}
            type='button'
          >
            Duplicate
          </button>
          <button
            className='room-planner-row-action'
            onClick={() => { handleRemove(selectedPlacement.id) }}
            type='button'
          >
            Remove from room
          </button>
        </div>
      </div>
    )
  }

  const renderPlan = (): ReactElement => {
    if (!selectedRoom) {
      return <p className='room-planner-hint'>Create or select a room to start planning.</p>
    }

    const { depth, width } = shapeSize(selectedRoom.rects)

    return (
      <>
        <div className='room-planner-plan-header'>
          <p className='room-planner-hint'>
            { `${formatInches(width)} wide by ${formatInches(depth)} deep overall. The darkest grid lines are a foot apart, then six inches, then one inch.` }
          </p>
          <div className='room-planner-plan-actions'>
            <button
              className='room-planner-row-action'
              onClick={() => { handleAddDoor('swing') }}
              type='button'
            >
              + Add door
            </button>
            <button
              className='room-planner-row-action'
              onClick={() => { handleAddDoor('opening') }}
              type='button'
            >
              + Add entryway
            </button>
          </div>
        </div>
        <RoomPlan
          furnitureMap={furnitureMap}
          onDoorChange={updateDoor}
          onDoorRemove={handleDoorRemove}
          onDoorSelect={selectDoor}
          onDuplicate={handleDuplicate}
          onMove={handleMove}
          onRemove={handleRemove}
          onRotate={handleRotate}
          onSelect={selectPlacement}
          room={selectedRoom}
          selectedDoorId={selectedDoorId}
          selectedPlacementId={selectedPlacementId}
        />
      </>
    )
  }

  const renderEditor = (current: EditingType): ReactElement => {
    // Keyed by what is being edited, so switching starts a fresh editor.
    const key = `${current.kind}-${current.id}`

    if (current.kind === 'room') {
      return (
        <ShapeEditor
          color={GREY3}
          defaultCanvas={240}
          defaultRectSize={120}
          defaultSnap={6}
          detailsTarget={detailsTarget}
          idPrefix='room'
          initialName={editingRoom?.name ?? ''}
          initialRects={editingRoom?.rects ?? []}
          key={key}
          namePlaceholder='Living room'
          onCancel={() => { setEditing(null) }}
          onDelete={editingRoom && (() => { handleRoomDelete(editingRoom) })}
          onSave={saveRoom}
          submitLabel={editingRoom ? 'Save room' : 'Create room'}
        />
      )
    }

    return (
      <ShapeEditor
        color={editingFurniture?.color ?? FURNITURE_COLORS[furniture.length % FURNITURE_COLORS.length]}
        defaultCanvas={96}
        defaultRectSize={24}
        defaultSnap={1}
        detailsTarget={detailsTarget}
        idPrefix='furniture'
        initialName={editingFurniture?.name ?? ''}
        initialRects={editingFurniture?.rects ?? []}
        key={key}
        namePlaceholder='Sofa'
        onCancel={() => { setEditing(null) }}
        onDelete={editingFurniture && (() => { handleFurnitureDelete(editingFurniture) })}
        onSave={saveFurniture}
        submitLabel={editingFurniture ? 'Save furniture' : 'Create furniture'}
      />
    )
  }

  const mainTitle = (): string => {
    if (editing?.kind === 'room') return editingRoom ? `Edit ${editingRoom.name}` : 'New room'
    if (editing?.kind === 'furniture') return editingFurniture ? `Edit ${editingFurniture.name}` : 'New furniture'

    return selectedRoom?.name ?? 'Plan'
  }

  return (
    <RoomPlannerContentStyled className='fade-in'>
      <aside className='room-planner-sidebar'>
        <div className='room-planner-intro'>
          <TagH size={2}>
            Room planner
          </TagH>
          <TagP>
            All measurements are in inches, and everything is saved in this browser.
          </TagP>
        </div>
        { renderSection(
          'selected',
          editing ? 'Rectangle' : 'Selected',
          editing ? <div ref={setDetailsTarget} /> : renderSelection()
        ) }
        { renderSection(
          'rooms',
          'Rooms',
          renderRooms()
        ) }
        { renderSection(
          'furniture',
          'Furniture',
          renderFurniture()
        ) }
      </aside>
      { renderCard(
        mainTitle(),
        editing ? renderEditor(editing) : renderPlan(),
        'room-planner-main'
      ) }
    </RoomPlannerContentStyled>
  )
}

export default RoomPlannerContent
