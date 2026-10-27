import {
  type PointerEvent,
  useEffect,
  useRef,
  useState
} from 'react'

/* How long an unselected item must be held before it can be dragged. */
const HOLD_MS = 350

/* How far, in screen pixels, the pointer may wander before a press counts as a drag. Keeps
   a stylus's wobble on a tap from moving anything. */
const MOVE_TOLERANCE = 6

interface GateType {
  key: string
  startX: number
  startY: number
  isArmed: boolean
  isMoving: boolean
  timer?: number
}

interface DragGateType {
  /** Call on pointer down. An item that was already selected can be dragged at once; any
      other only after being held still for a moment. */
  begin: (event: PointerEvent, key: string, isSelected: boolean) => void
  /** Whether this pointer move should move the item. */
  allowsMove: (event: PointerEvent) => boolean
  /** Call on pointer up. */
  end: () => void
  /** The item picked up by holding, while it is held, so it can be shown lifted. */
  liftedKey: string | null
}

/* Stops a press from dragging an item by accident: the first tap only selects it. */
export const useDragGate = (): DragGateType => {
  const gateRef = useRef<GateType | null>(null)
  const [ liftedKey, setLiftedKey ] = useState<string | null>(null)

  const end = (): void => {
    window.clearTimeout(gateRef.current?.timer)
    gateRef.current = null
    setLiftedKey(null)
  }

  const begin = (
    event: PointerEvent,
    key: string,
    isSelected: boolean
  ): void => {
    end()

    const gate: GateType = {
      isArmed: isSelected,
      isMoving: false,
      key,
      startX: event.clientX,
      startY: event.clientY
    }

    if (!isSelected) {
      gate.timer = window.setTimeout(
        () => {
          gate.isArmed = true
          setLiftedKey(key)
        },
        HOLD_MS
      )
    }

    gateRef.current = gate
  }

  const allowsMove = (event: PointerEvent): boolean => {
    const gate = gateRef.current

    if (!gate) return false
    if (gate.isMoving) return true

    const distance = Math.hypot(
      event.clientX - gate.startX,
      event.clientY - gate.startY
    )

    if (distance < MOVE_TOLERANCE) return false

    // Moved off before the hold finished: this press only selects.
    if (!gate.isArmed) {
      end()

      return false
    }

    gate.isMoving = true

    return true
  }

  useEffect(
    () => () => { window.clearTimeout(gateRef.current?.timer) },
    []
  )

  return { allowsMove, begin, end, liftedKey }
}
