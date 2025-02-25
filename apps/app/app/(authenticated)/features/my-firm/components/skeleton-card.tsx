import { Card, CardContent, CardHeader } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import type { SkeletonCardProps } from '../types';

export function SkeletonCard({ type = 'lawyer', count = 3 }: SkeletonCardProps) {
  const renderSkeletonCard = () => {
    if (type === 'lawyer') {
      return (
        <Card className="overflow-hidden border border-border h-[180px] flex flex-col">
          <div className="h-1 bg-muted w-full"></div>
          
          <CardHeader className="pb-1 pt-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div>
                  <Skeleton className="h-3 w-28 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow py-1 px-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-36" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            <div className="mt-1.5">
              <div className="flex items-center justify-between mb-0.5">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-4 w-7" />
              </div>
              
              <div className="flex gap-1">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="overflow-hidden border border-border h-[180px] flex flex-col">
        <div className="h-1 bg-muted w-full"></div>
        
        <CardHeader className="pb-1 pt-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow py-1 px-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex gap-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-3/4" />
            
            <div>
              <Skeleton className="h-2.5 w-16 mb-0.5" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
          </div>
          
          <div className="mt-1.5">
            <div className="flex items-center justify-between mb-0.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-4 w-7" />
            </div>
            
            <div className="flex -space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-5 rounded-full border-2 border-background" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeletonCard()}</div>
      ))}
    </>
  );
} 