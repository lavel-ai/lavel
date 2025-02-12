import type React from "react"
import { Draggable } from "react-beautiful-dnd"
import { AnimatedCard } from "./animated-card"
import { GripVertical } from "lucide-react"

interface DraggableCardProps {
  id: string
  index: number
  children: React.ReactNode
}

export const DraggableCard: React.FC<DraggableCardProps> = ({ id, index, children }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <AnimatedCard className="relative">
            <div
              {...provided.dragHandleProps}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted cursor-move"
            >
              <GripVertical size={16} />
            </div>
            {children}
          </AnimatedCard>
        </div>
      )}
    </Draggable>
  )
}

