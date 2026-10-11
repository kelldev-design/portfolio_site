import {
  type FunctionComponent,
  type HTMLAttributes,
  type ReactNode
} from 'react'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  restrictToParentElement,
  restrictToVerticalAxis
} from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableListPropsType {
  children: ReactNode
  /** The ids of the SortableItems inside, in their current order. */
  ids: string[]
  /** Called with the ids in their new order after an item is dropped somewhere else. */
  onReorder: (ids: string[]) => void
}

/**
 * A vertical list whose SortableItems can be dragged into a new order by their handle, with
 * a mouse, a finger, or the keyboard (focus the handle, Space to lift, arrows to move, Space
 * to drop).
 */
export const SortableList: FunctionComponent<SortableListPropsType> = ({
  children,
  ids,
  onReorder
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(
      KeyboardSensor,
      { coordinateGetter: sortableKeyboardCoordinates }
    )
  )

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (!over || active.id === over.id) return

    onReorder(arrayMove(
      ids,
      ids.indexOf(String(active.id)),
      ids.indexOf(String(over.id))
    ))
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[ restrictToVerticalAxis, restrictToParentElement ]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={ids}
        strategy={verticalListSortingStrategy}
      >
        { children }
      </SortableContext>
    </DndContext>
  )
}

interface SortableItemPropsType {
  /** Renders the item. Spread the props it is given onto the element that acts as the drag handle. */
  children: (handleProps: HTMLAttributes<HTMLElement>) => ReactNode
  id: string
}

export const SortableItem: FunctionComponent<SortableItemPropsType> = ({
  children,
  id
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id })

  return (
    <div
      className={`sortable-item ${isDragging ? 'is-dragging' : ''}`}
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition
      }}
    >
      { children({ ...attributes, ...listeners }) }
    </div>
  )
}

interface DragHandlePropsType {
  handleProps: HTMLAttributes<HTMLElement>
  label: string
}

export const DragHandle: FunctionComponent<DragHandlePropsType> = ({
  handleProps,
  label
}) =>
  <button
    {...handleProps}
    aria-label={label}
    className='drag-handle'
    title={label}
    type='button'
  >
    ⠿
  </button>
