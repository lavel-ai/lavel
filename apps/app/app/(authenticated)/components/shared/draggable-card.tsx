import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AnimatedCard } from "./animated-card"
import { GripVertical } from "lucide-react"

interface DraggableCardProps {
  id: string
  children: React.ReactNode
}

export const DraggableCard: React.FC<DraggableCardProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <AnimatedCard className="relative">
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted cursor-move"
        >
          <GripVertical size={16} />
        </div>
        {children}
      </AnimatedCard>
    </div>
  )
}

