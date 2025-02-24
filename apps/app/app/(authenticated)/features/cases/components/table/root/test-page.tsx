'use client';

import { LitigationTable } from './LitigationTable';
import { type Case } from '@repo/database/src/tenant-app/schema/case-schema';

// Generate sample data
function generateSampleData(count: number): Case[] {
  const now = new Date();
  const userId = 'user-1'; // Sample user ID
  const teamId = 'team-1'; // Sample team ID

  return Array.from({ length: count }, (_, i) => ({
    id: `case-${i}`,
    title: `Test Case ${i}`,
    description: `Description for case ${i}`,
    
    // Location
    stateId: i % 5 + 1,
    cityId: i % 10 + 1,
    courthouseId: i % 3 + 1,
    
    // Type and Status
    type: i % 2 === 0 ? 'litigation' : 'advisory',
    caseLawBranchId: i % 3 + 1,
    isActive: true,
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'closed',
    riskLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
    
    // Relationships
    originalCaseId: null,
    relationshipType: null,
    
    // Dates
    startDate: new Date(2024, 0, i + 1),
    estimatedEndDate: new Date(2024, 6, i + 1),
    actualEndDate: null,
    transformationDate: null,
    
    // Team and Responsibility
    leadAttorneyId: userId,
    assignedTeamId: teamId,
    
    // Activity Tracking
    lastActivityAt: now,
    lastActivityById: userId,
    lastActivityType: 'created',
    
    // Counters
    documentsCount: 0,
    privateDocumentsCount: 0,
    tasksCount: 0,
    pendingTasksCount: 0,
    completedTasksCount: 0,
    eventsCount: 0,
    upcomingEventsCount: 0,
    notesCount: 0,
    privateNotesCount: 0,
    lastNoteAt: null,
    lastNoteById: null,
    commentsCount: 0,
    unreadCommentsCount: 0,
    
    // Time Tracking
    totalBillableHours: '0',
    totalNonBillableHours: '0',
    totalHours: '0',
    totalTaskHours: '0',
    totalOtherHours: '0',
    
    // Media
    totalMediaCount: 0,
    totalMediaSize: 0,
    
    // Audit
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
    version: 1,
    deletedAt: null,
  }));
}

export default function TestPage() {
  const sampleData = generateSampleData(100);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Case Table Test</h1>
      <div className="border rounded-lg bg-background">
        <LitigationTable 
          data={sampleData}
          isLoading={false}
        />
      </div>
    </div>
  );
} 