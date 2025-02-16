"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import { updateKPIOrder } from "../../../actions/components/kpi-actions"; // Import the Server Action
import LitigationCasesKPI from "./litigation-cases-kpi"; // Import the KPI components
import AdvisoryCasesKPI from "./advisory-cases-kpi";
import { v4 as uuidv4 } from 'uuid';

type KPI = {
  id: string;
  component: string;
  title: string;
  order: number;
};

type Props = {
  kpis: KPI[];
};

const SortableKPI = ({ kpi }: { kpi: KPI }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [instanceId, setInstanceId] = useState<string>("");

  useEffect(() => {
    setInstanceId(uuidv4());
  }, []);

  const renderKPIComponent = () => {
    switch (kpi.component) {
      case "LitigationCasesKPI":
        return <LitigationCasesKPI instanceId={instanceId}/>;
      case "AdvisoryCasesKPI":
        return <AdvisoryCasesKPI instanceId={instanceId}/>;
      // Add other cases for other KPIs
      default:
        return null; // Or a default component/error message
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab"
    >
      {renderKPIComponent()}
    </div>
  );
};

const DashboardGrid = ({ kpis: initialKPIs }: Props) => {
  const [kpis, setKPIs] = useState(initialKPIs);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require movement of 8px before dragging starts
      },
    })
  );

  useEffect(() => {
    setKPIs(initialKPIs);
  }, [initialKPIs]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setKPIs((kpis) => {
        const oldIndex = kpis.findIndex((kpi) => kpi.id === active.id);
        const newIndex = kpis.findIndex((kpi) => kpi.id === over?.id);
        return arrayMove(kpis, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Update local state (already done in handleDragOver)

      // Persist the new order to the database
      const newOrder = kpis.map((kpi, index) => ({
        kpiId: kpi.id,
        order: index,
      }));
      await updateKPIOrder(newOrder); // Call the Server Action
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={kpis.map((kpi) => kpi.id)}
        strategy={sortableKeyboardCoordinates as any}
      >
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {kpis.map((kpi) => (
            <SortableKPI key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="bg-white p-4 rounded-md shadow-lg">
            {/* You might want to render a preview of the active KPI here */}
            {kpis.find(kpi=> kpi.id === activeId)?.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DashboardGrid; 