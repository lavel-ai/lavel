import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string({
    required_error: 'Event title is required',
  }).min(1, 'Event title is required'),
  
  description: z.string().optional(),
  
  startTime: z.date({
    required_error: 'Start time is required',
  }),
  
  endTime: z.date({
    required_error: 'End time is required',
  }),
  
  isAllDay: z.boolean().default(false),
  
  location: z.string().optional(),
  
  status: z.enum(['confirmed', 'tentative', 'cancelled']).default('confirmed'),
  
  eventType: z.enum(['hearing', 'appointment', 'call', 'meeting', 'other']).default('appointment'),
  
  timezone: z.string().default('UTC'),
});

export const eventsSchema = z.object({
  events: z.array(eventSchema),
});

export type EventSchema = z.infer<typeof eventSchema>;
export type EventsSchema = z.infer<typeof eventsSchema>;
