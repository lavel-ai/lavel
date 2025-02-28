// packages/schema/src/pipeline/index.ts
export type TransformationContext = {
  userId?: string;
  tenantId?: string;
  source?: string;
  timestamp?: number;
  [key: string]: any;
};

export interface TransformationStage<T> {
  name: string;
  transform: (input: T, context: TransformationContext) => T | Promise<T>;
}

export class TransformationPipeline<T> {
  constructor(
    private readonly name: string,
    private readonly stages: TransformationStage<T>[] = []
  ) {}

  addStage(stage: TransformationStage<T>): this {
    this.stages.push(stage);
    return this;
  }

  async process(
    input: T, 
    context: TransformationContext = {}
  ): Promise<{
    result: T;
    changes: Array<{
      stage: string;
      field: string;
      originalValue: any;
      newValue: any;
    }>;
    metrics: {
      totalTime: number;
      stageTimings: Record<string, number>;
    };
  }> {
    const startTime = Date.now();
    const changes: Array<{
      stage: string;
      field: string;
      originalValue: any;
      newValue: any;
    }> = [];
    
    const stageTimings: Record<string, number> = {};
    let result = { ...input } as T;
    
    // Process through each stage
    for (const stage of this.stages) {
      const stageStartTime = Date.now();
      
      // Save original values for change tracking
      const beforeStage = { ...result };
      
      // Apply transformation
      result = await stage.transform(result, context);
      
      // Track changes
      Object.keys(result).forEach(key => {
        if (JSON.stringify(beforeStage[key]) !== JSON.stringify(result[key])) {
          changes.push({
            stage: stage.name,
            field: key,
            originalValue: beforeStage[key],
            newValue: result[key],
          });
        }
      });
      
      // Record timing
      const stageDuration = Date.now() - stageStartTime;
      stageTimings[stage.name] = stageDuration;
    }
    
    const totalTime = Date.now() - startTime;
    
    return {
      result,
      changes,
      metrics: {
        totalTime,
        stageTimings,
      },
    };
  }
}

export function createTransformPipeline<T>(options: {
  name: string;
  stages: TransformationStage<T>[];
}): TransformationPipeline<T> {
  return new TransformationPipeline<T>(options.name, options.stages);
}