import { LoadingSkeletonProps } from '../types';

export function SkeletonCard({ type = 'lawyer', count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
        >
          {/* Header */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>

          {/* Content */}
          {type === 'team' && (
            <div className="space-y-3 mt-4">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-4/6" />
            </div>
          )}

          {type === 'lawyer' && (
            <div className="space-y-3 mt-4">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </>
  );
} 