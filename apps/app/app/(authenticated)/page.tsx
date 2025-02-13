"use client";

import { env } from '@/env';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
import { AdvisoryCasesKPI } from './components/dashboard/advisory-cases-kpi';
import { DraggableCard } from './components/shared/draggable-card';
import dynamic from 'next/dynamic';

const title = 'Acme Inc';
const description = 'My application.';

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

// export const metadata: Metadata = {
//   title,
//   description,
// };

interface DashboardCard {
  id: string;
  component: React.ComponentType;
}

const initialCards: DashboardCard[] = [
  { id: 'advisory-cases', component: AdvisoryCasesKPI },
  // Add other cards here
];

export default function DashboardPage() {
  const [cards, setCards] = useState(initialCards);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      <Header pages={[]} page="Dashboard">
        {/* {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider> */}
        {/* )} */}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cards.map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              {cards.map((card) => (
                <DraggableCard key={card.id} id={card.id}>
                  <card.component />
                </DraggableCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
