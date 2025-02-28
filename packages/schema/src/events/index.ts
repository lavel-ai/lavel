// packages/schema/src/events/index.ts
type NormalizationEventType = 'create' | 'update' | 'validate';

export type NormalizationEvent = {
  entityType: string;
  operation: NormalizationEventType;
  data: any;
  changes?: Array<{
    stage: string;
    field: string;
    originalValue: any;
    newValue: any;
  }>;
  context: {
    userId: string;
    source: string;
    timestamp: number;
  };
};

// In-memory store for events in development
const events: NormalizationEvent[] = [];

export async function recordNormalizationEvent(event: NormalizationEvent): Promise<void> {
  events.push(event);
  console.log(`[Event] ${event.entityType} ${event.operation}: ${event.changes?.length || 0} changes`);
}

export class NormalizationEventBus {
  private subscribers: Map<string, Array<(event: NormalizationEvent) => void>> = new Map();
  
  subscribe(entityType: string, handler: (event: NormalizationEvent) => void) {
    const handlers = this.subscribers.get(entityType) || [];
    handlers.push(handler);
    this.subscribers.set(entityType, handlers);
    return () => this.unsubscribe(entityType, handler);
  }
  
  unsubscribe(entityType: string, handler: (event: NormalizationEvent) => void) {
    const handlers = this.subscribers.get(entityType) || [];
    this.subscribers.set(entityType, handlers.filter(h => h !== handler));
  }
  
  async publish(event: NormalizationEvent) {
    // Store event
    await recordNormalizationEvent(event);
    
    // Notify handlers
    const handlers = this.subscribers.get(event.entityType) || [];
    await Promise.all(handlers.map(handler => handler(event)));
    
    // Also notify global handlers
    const globalHandlers = this.subscribers.get('*') || [];
    await Promise.all(globalHandlers.map(handler => handler(event)));
  }
}

export const eventBus = new NormalizationEventBus();