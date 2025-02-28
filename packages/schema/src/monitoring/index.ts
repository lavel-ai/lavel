// packages/schema/src/monitoring/index.ts
type MetricDimension = 
  | 'completeness' 
  | 'accuracy' 
  | 'consistency' 
  | 'timeliness' 
  | 'validity';

type DataQualityMetric = {
  entityType: string;
  dimension: MetricDimension;
  score: number; // 0-100
  timestamp: number;
};

// In-memory store for metrics in development
// In production, this would send to a proper metrics system
const metricsStore: DataQualityMetric[] = [];

export function recordMetric(type: string, data: any): void {
  if (type === 'data_quality') {
    metricsStore.push(data);
    console.log(`[Metric] ${data.entityType} ${data.dimension}: ${data.score}`);
  }
}

export function monitorDataQuality(entityType: string, data: any): any {
  // Calculate completeness
  const completeness = calculateCompleteness(entityType, data);
  
  // Record metrics
  recordMetric('data_quality', {
    entityType,
    dimension: 'completeness',
    score: completeness,
    timestamp: Date.now(),
  });
  
  // Return enriched data
  return {
    ...data,
    _quality: {
      completeness,
    },
  };
}

function calculateCompleteness(entityType: string, data: any): number {
  // Implementation depends on the entity type
  if (entityType === 'team') {
    const requiredFields = ['name'];
    const optionalFields = ['description', 'practiceArea', 'department'];
    
    const requiredComplete = requiredFields.every(field => !!data[field]);
    if (!requiredComplete) return 0;
    
    const optionalFieldsPresent = optionalFields.filter(field => !!data[field]).length;
    const optionalCompleteness = optionalFields.length > 0 
      ? optionalFieldsPresent / optionalFields.length
      : 1;
    
    return 0.6 + (0.4 * optionalCompleteness); // 60% for required, 40% for optional
  }
  
  return 1.0; // Default for unknown entities
}